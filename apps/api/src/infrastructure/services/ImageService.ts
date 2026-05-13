import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createId } from '../utils/cuid.js'

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')

// S3 client — supports LocalStack (S3_ENDPOINT set) or Cloudflare R2 (R2_ACCOUNT_ID set)
function makeS3Client(): S3Client | null {
  const accessKeyId = process.env['R2_ACCESS_KEY_ID']
  const secretAccessKey = process.env['R2_SECRET_ACCESS_KEY']
  if (!accessKeyId || !secretAccessKey) return null

  const s3Endpoint = process.env['S3_ENDPOINT']
  if (s3Endpoint) {
    return new S3Client({
      region: 'us-east-1',
      endpoint: s3Endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })
  }

  const accountId = process.env['R2_ACCOUNT_ID']
  if (!accountId) return null
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

let r2: S3Client | null | undefined

function getR2(): S3Client | null {
  if (r2 === undefined) r2 = makeS3Client()
  return r2
}

export interface ProcessedImage {
  imageUrl: string
  thumbnailUrl: string
  previewUrl: string
  width: number
  height: number
  fileSize: number
}

export interface ExifData {
  cameraMake?: string
  cameraModel?: string
  lens?: string
  iso?: number
  aperture?: string
  shutterSpeed?: string
  focalLength?: string
  takenAt?: Date
}

async function uploadToR2(client: S3Client, key: string, buffer: Buffer, contentType: string): Promise<string> {
  const bucket = process.env['R2_BUCKET_NAME']!
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  const publicUrl = process.env['R2_PUBLIC_URL']!.replace(/\/$/, '')
  return `${publicUrl}/${key}`
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export const ImageService = {
  async process(buffer: Buffer): Promise<ProcessedImage & { exif: ExifData }> {
    const id = createId()
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const filename = `${id}.jpg`
    const photoKey = `photos/${yyyy}/${mm}/${filename}`
    const thumbKey = `thumbs/${yyyy}/${mm}/${filename}`
    const previewKey = `previews/${yyyy}/${mm}/${filename}`

    const image = sharp(buffer).rotate()
    const metadata = await image.metadata()

    // Resize main image: cap at 1920px wide, re-encode JPEG, strip GPS
    const mainBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 92, progressive: true })
      .toBuffer()

    // Preview: 800px wide — for photo detail page
    const previewBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    // Thumbnail: 600px wide
    const thumbBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 600, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer()

    const client = getR2()

    let imageUrl: string
    let thumbnailUrl: string
    let previewUrl: string

    if (client) {
      // Upload to Cloudflare R2
      ;[imageUrl, thumbnailUrl, previewUrl] = await Promise.all([
        uploadToR2(client, photoKey, mainBuffer, 'image/jpeg'),
        uploadToR2(client, thumbKey, thumbBuffer, 'image/jpeg'),
        uploadToR2(client, previewKey, previewBuffer, 'image/jpeg'),
      ])
    } else {
      // Fall back to local disk (development without R2)
      const photoDir = path.join(UPLOADS_DIR, 'photos', String(yyyy), mm)
      const thumbDir = path.join(UPLOADS_DIR, 'thumbs', String(yyyy), mm)
      const previewDir = path.join(UPLOADS_DIR, 'previews', String(yyyy), mm)
      await Promise.all([ensureDir(photoDir), ensureDir(thumbDir), ensureDir(previewDir)])
      await Promise.all([
        fs.writeFile(path.join(photoDir, filename), mainBuffer),
        fs.writeFile(path.join(thumbDir, filename), thumbBuffer),
        fs.writeFile(path.join(previewDir, filename), previewBuffer),
      ])
      imageUrl = `/uploads/photos/${yyyy}/${mm}/${filename}`
      thumbnailUrl = `/uploads/thumbs/${yyyy}/${mm}/${filename}`
      previewUrl = `/uploads/previews/${yyyy}/${mm}/${filename}`
    }

    return {
      imageUrl,
      thumbnailUrl,
      previewUrl,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      fileSize: mainBuffer.length,
      exif: {},
    }
  },

  async ensureUploadsDir() {
    if (!getR2()) {
      await ensureDir(path.join(UPLOADS_DIR, 'photos'))
      await ensureDir(path.join(UPLOADS_DIR, 'thumbs'))
      await ensureDir(path.join(UPLOADS_DIR, 'previews'))
    }
  },
}
