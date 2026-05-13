import bcryptjs from 'bcryptjs'
const { hash } = bcryptjs
import { prisma } from '../src/index.js'

// picsum gives stable, real-looking photos by seed name
const img = (seed: string, w = 800, h = 1000) => `https://picsum.photos/seed/${seed}/${w}/${h}`
const thumb = (seed: string) => img(seed, 400, 500)

async function main() {
  console.log('Seeding database...')

  // ── Forum categories ────────────────────────────────────────────────────────
  const categories = [
    { slug: 'EQUIPMENT_REVIEWS', name: 'Equipment Reviews', description: 'Cameras, lenses, and gear discussion', sortOrder: 0 },
    { slug: 'TOKYO_PHOTO_SPOTS', name: 'Tokyo Photo Spots', description: 'Discover the best shooting locations in Tokyo', sortOrder: 1 },
    { slug: 'CRITIQUE_MY_WORK', name: 'Critique My Work', description: 'Share your photos and get constructive feedback', sortOrder: 2 },
    { slug: 'GENERAL', name: 'General Discussion', description: 'Photography talk and community chat', sortOrder: 3 },
  ]
  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug as any },
      update: {},
      create: cat as any,
    })
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  const pw = await hash('demo123456', 12)
  const adminPw = await hash('admin123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokyolens.jp' },
    update: { password: adminPw },
    create: {
      email: 'admin@tokyolens.jp', username: 'admin', name: 'Tokyo Lens Admin',
      password: adminPw, role: 'ADMIN', bio: 'Platform administrator',
    },
  })

  const sakura = await prisma.user.upsert({
    where: { email: 'demo@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'demo@tokyolens.jp', username: 'sakura_shots', name: 'Sakura Yamamoto',
      password: pw, role: 'USER',
      bio: 'Street photographer based in Shinjuku. Capturing Tokyo one frame at a time.',
      location: 'Shinjuku, Tokyo', instagramUrl: 'sakura_shots',
    },
  })

  const kenji = await prisma.user.upsert({
    where: { email: 'kenji@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'kenji@tokyolens.jp', username: 'kenji_frames', name: 'Kenji Nakamura',
      password: pw, role: 'USER',
      bio: 'Architectural and night photographer. Sony A7 IV shooter.',
      location: 'Shibuya, Tokyo', instagramUrl: 'kenji_frames',
    },
  })

  const yuki = await prisma.user.upsert({
    where: { email: 'yuki@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'yuki@tokyolens.jp', username: 'yuki_lens', name: 'Yuki Tanaka',
      password: pw, role: 'USER',
      bio: 'Portrait & macro. Finding beauty in small things across Tokyo.',
      location: 'Harajuku, Tokyo',
    },
  })

  const hiro = await prisma.user.upsert({
    where: { email: 'hiro@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'hiro@tokyolens.jp', username: 'hiro_snap', name: 'Hiro Suzuki',
      password: pw, role: 'USER',
      bio: 'Travel and landscape photographer. Fujifilm X-T5 user.',
      location: 'Asakusa, Tokyo', instagramUrl: 'hiro_snap',
    },
  })

  const luna = await prisma.user.upsert({
    where: { email: 'luna@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'luna@tokyolens.jp', username: 'luna_tokyo', name: 'Luna Park',
      password: pw, role: 'USER',
      bio: 'Wildlife and abstract. Nikon Z8. Chasing the unexpected.',
      location: 'Ueno, Tokyo',
    },
  })

  const users = [sakura, kenji, yuki, hiro, luna, admin]

  // ── Photos ──────────────────────────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)

  const photoData = [
    // Sakura — Street
    { title: 'Shinjuku Rain at Midnight', seed: 'tokyo-street-1', w: 800, h: 1067, neighborhood: 'Shinjuku', category: 'STREET', author: sakura, desc: 'The neon reflections on wet asphalt never get old.', days: 1, votes: 42 },
    { title: 'Golden Gai Alley', seed: 'tokyo-street-2', w: 800, h: 600, neighborhood: 'Shinjuku', category: 'STREET', author: sakura, desc: 'A narrow slice of old Tokyo still breathing.', days: 5, votes: 38 },
    { title: 'Shibuya Scramble Dusk', seed: 'tokyo-street-3', w: 800, h: 534, neighborhood: 'Shibuya', category: 'STREET', author: sakura, desc: '3000 people crossing at once. Every time.', days: 10, votes: 61 },
    { title: 'Yanaka Ghost Town', seed: 'tokyo-street-4', w: 800, h: 1200, neighborhood: 'Yanaka', category: 'STREET', author: sakura, desc: 'The last neighborhood that feels untouched.', days: 18, votes: 27 },

    // Kenji — Architecture + Night
    { title: 'Tokyo Skytree Blue Hour', seed: 'tokyo-arch-1', w: 800, h: 1067, neighborhood: 'Asakusa', category: 'ARCHITECTURE', author: kenji, desc: 'The 30-second window before the magic fades.', days: 2, votes: 55 },
    { title: 'Roppongi Hills Glass', seed: 'tokyo-arch-2', w: 800, h: 600, neighborhood: 'Roppongi', category: 'ARCHITECTURE', author: kenji, desc: 'Reflected city in the tower facade.', days: 7, votes: 33 },
    { title: 'Shinjuku Neons', seed: 'tokyo-night-1', w: 800, h: 1200, neighborhood: 'Shinjuku', category: 'NIGHT', author: kenji, desc: 'ISO 3200, f/1.8. Hand-held and hoping.', days: 12, votes: 72 },
    { title: 'Odaiba Rainbow Bridge', seed: 'tokyo-night-2', w: 800, h: 534, neighborhood: 'Odaiba', category: 'NIGHT', author: kenji, desc: '20-second exposure from the waterfront.', days: 20, votes: 48 },

    // Yuki — Portrait + Macro
    { title: 'Tea Ceremony Light', seed: 'tokyo-portrait-1', w: 800, h: 1000, neighborhood: 'Harajuku', category: 'PORTRAIT', author: yuki, desc: 'Window light. No flash. Just patience.', days: 3, votes: 44 },
    { title: 'Harajuku Cosplay', seed: 'tokyo-portrait-2', w: 800, h: 1067, neighborhood: 'Harajuku', category: 'PORTRAIT', author: yuki, desc: 'She said yes to one shot. This was it.', days: 8, votes: 58 },
    { title: 'Cherry Blossom Macro', seed: 'tokyo-macro-1', w: 800, h: 534, neighborhood: 'Shinjuku Gyoen', category: 'MACRO', author: yuki, desc: '105mm macro, f/4.5. Waited for no wind.', days: 14, votes: 35 },
    { title: 'Raindrop on Maple', seed: 'tokyo-macro-2', w: 800, h: 800, neighborhood: 'Yanaka', category: 'MACRO', author: yuki, desc: 'Autumn detail. Nature\'s own lens.', days: 22, votes: 29 },

    // Hiro — Landscape + Travel
    { title: 'Mt Fuji from Kawaguchi', seed: 'tokyo-landscape-1', w: 800, h: 534, neighborhood: 'Odaiba', category: 'LANDSCAPE', author: hiro, desc: 'Woke up at 3am. Worth every minute.', days: 4, votes: 89 },
    { title: 'Autumn Nikko Valley', seed: 'tokyo-landscape-2', w: 800, h: 1067, neighborhood: 'Asakusa', category: 'LANDSCAPE', author: hiro, desc: 'Two-hour drive from Tokyo, but another world.', days: 9, votes: 66 },
    { title: 'Tsukiji Morning Fish', seed: 'tokyo-travel-1', w: 800, h: 600, neighborhood: 'Tsukiji', category: 'TRAVEL', author: hiro, desc: 'The old market spirit still alive at 4am.', days: 15, votes: 41 },
    { title: 'Senso-ji Incense Fog', seed: 'tokyo-travel-2', w: 800, h: 1200, neighborhood: 'Asakusa', category: 'TRAVEL', author: hiro, desc: 'Smoke and silence before the tourist crowds arrive.', days: 25, votes: 54 },

    // Luna — Wildlife + Abstract
    { title: 'Ueno Park Crow', seed: 'tokyo-wildlife-1', w: 800, h: 800, neighborhood: 'Ueno', category: 'WILDLIFE', author: luna, desc: 'Tokyo\'s true rulers. 600mm, 1/2000s.', days: 6, votes: 37 },
    { title: 'Koi at Hamarikyu', seed: 'tokyo-wildlife-2', w: 800, h: 534, neighborhood: 'Shimbashi', category: 'WILDLIFE', author: luna, desc: 'Long lens through the lily pads.', days: 11, votes: 31 },
    { title: 'Shibuya Blur Abstract', seed: 'tokyo-abstract-1', w: 800, h: 1067, neighborhood: 'Shibuya', category: 'ABSTRACT', author: luna, desc: '2-second exposure, panning. Intentional camera movement.', days: 16, votes: 46 },
    { title: 'Light Trails Expressway', seed: 'tokyo-abstract-2', w: 800, h: 600, neighborhood: 'Shinjuku', category: 'ABSTRACT', author: luna, desc: '30 seconds of Tokyo moving.', days: 30, votes: 52 },

    // Admin — extra
    { title: 'Meiji Shrine Forest', seed: 'tokyo-other-1', w: 800, h: 1067, neighborhood: 'Harajuku', category: 'OTHER', author: admin, desc: 'Urban forest in the heart of the city.', days: 2, votes: 43 },
    { title: 'Tsukishima Monja Street', seed: 'tokyo-other-2', w: 800, h: 600, neighborhood: 'Tsukishima', category: 'OTHER', author: admin, desc: 'Old downtown feels. Everyone knows everyone.', days: 8, votes: 24 },
    { title: 'Toyosu Fish Auction', seed: 'tokyo-other-3', w: 800, h: 534, neighborhood: 'Toyosu', category: 'TRAVEL', author: admin, desc: 'The new market, same pre-dawn energy.', days: 19, votes: 36 },
    { title: 'Akihabara Night Signs', seed: 'tokyo-other-4', w: 800, h: 1200, neighborhood: 'Akihabara', category: 'NIGHT', author: admin, desc: 'Electric Town lives up to the name after dark.', days: 28, votes: 61 },
  ]

  const createdPhotos: any[] = []
  for (const p of photoData) {
    const created = await prisma.photo.upsert({
      where: { id: `seed-photo-${p.seed}` },
      update: { voteCount: p.votes },
      create: {
        id: `seed-photo-${p.seed}`,
        title: p.title,
        description: p.desc,
        imageUrl: img(p.seed, p.w, p.h),
        thumbnailUrl: thumb(p.seed),
        width: p.w,
        height: p.h,
        fileSize: 1_200_000,
        neighborhood: p.neighborhood,
        category: p.category as any,
        status: 'APPROVED',
        authorId: p.author.id,
        voteCount: p.votes,
        approvedAt: daysAgo(p.days + 1),
        createdAt: daysAgo(p.days),
      },
    })
    createdPhotos.push({ ...created, meta: p })
  }

  // ── Votes ───────────────────────────────────────────────────────────────────
  // Each user votes on a selection of photos (not their own)
  const votePairs: [string, string][] = []
  for (const voter of users) {
    const eligible = createdPhotos.filter(p => p.authorId !== voter.id)
    const picks = eligible.sort(() => Math.random() - 0.5).slice(0, 10)
    for (const photo of picks) {
      votePairs.push([voter.id, photo.id])
    }
  }
  for (const [userId, photoId] of votePairs) {
    await prisma.vote.upsert({
      where: { userId_photoId: { userId, photoId } },
      update: {},
      create: { userId, photoId },
    })
  }

  // ── Comments ────────────────────────────────────────────────────────────────
  const commentPool = [
    'Incredible light here, how did you nail the exposure?',
    'This is my favourite spot in Tokyo too! Great composition.',
    'The depth of field is perfect on this one.',
    'Love the mood. What time of day did you shoot this?',
    'Been to this spot many times but never captured it like this.',
    'The bokeh is incredible, what lens did you use?',
    'Color grading is on point. Film emulation?',
    'This makes me miss Tokyo so much.',
    'Stunning work as always!',
    'The leading lines really draw the eye in.',
    'Shot on a rainy day? The reflections are beautiful.',
    'How long was your shutter speed for the light trails?',
  ]
  let commentIdx = 0
  for (let i = 0; i < createdPhotos.length; i++) {
    const photo = createdPhotos[i]!
    const commenters = users.filter(u => u.id !== photo.authorId).slice(0, 3)
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          body: commentPool[commentIdx % commentPool.length]!,
          authorId: commenter.id,
          photoId: photo.id,
          createdAt: daysAgo(Math.floor(Math.random() * 5)),
        },
      })
      commentIdx++
    }
  }

  // ── Forum threads & replies ─────────────────────────────────────────────────
  const forumCategories = await prisma.forumCategory.findMany()
  const catMap = Object.fromEntries(forumCategories.map(c => [c.slug, c.id]))

  const threads = [
    {
      title: 'Sony A7R V vs Nikon Z8 for Tokyo street — which do you prefer?',
      body: 'I\'ve been shooting the Sony A7R V for the past year and absolutely love the resolution for cropping in post. But a friend swears by the Nikon Z8\'s autofocus for moving subjects in crowds. Anyone have first-hand experience switching between the two in a Tokyo street context? Battery life in the cold is also a concern for me.',
      categoryId: catMap['EQUIPMENT_REVIEWS']!, author: kenji,
      replies: [
        { body: 'I switched from Sony to Nikon Z8 last spring and haven\'t looked back. The AF tracking in Shibuya crowds is unreal.', author: sakura },
        { body: 'The A7R V eye-AF is actually very close now after firmware updates. But yes, Nikon battery life wins easily.', author: hiro },
        { body: 'For street, I\'d actually recommend the Fuji X100VI — smaller, lighter, street-friendly.', author: yuki },
      ]
    },
    {
      title: 'Best spots for blue hour in Shinjuku — share your secrets',
      body: 'I keep seeing incredible blue hour shots from Shinjuku on here and I can\'t figure out the exact positions. The Tokyo Metropolitan Government Building rooftop is obvious, but what else? Specifically looking for spots that show the neon district from above or at street level with good framing.',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: sakura,
      replies: [
        { body: 'The west exit park area gives you a great angle on the skyscrapers with foreground interest. Underrated.', author: kenji },
        { body: 'Takashimaya Times Square rooftop terrace on the south side! You get the JR lines as leading lines.', author: luna },
        { body: 'Also try the Dai-ichi Seimei building bridge — connects two buildings over the street and gives a unique overhead view.', author: hiro },
      ]
    },
    {
      title: 'My Shibuya blur shot — thoughts on the abstraction level?',
      body: 'I\'ve been experimenting with intentional camera movement (ICM) at Shibuya. Some people love the full abstraction, others say it loses too much of the sense of place. Posting my latest attempt — curious where the TokyoLens community falls on this.',
      categoryId: catMap['CRITIQUE_MY_WORK']!, author: luna,
      replies: [
        { body: 'I think the abstraction works here because you can still feel the urban density. If it were completely unrecognisable it might lose impact.', author: yuki },
        { body: 'The colour palette is the real star. That cyan-magenta split feels very Tokyo.', author: sakura },
      ]
    },
    {
      title: 'How do you handle memory card strategy for all-day shoots?',
      body: 'Going on a 10-hour Tokyo walk next weekend and trying to plan my card strategy. Do you shoot RAW+JPEG, RAW only? How many cards, what capacity? I got burned last month when one card corrupted mid-shoot. Looking for your workflow tips.',
      categoryId: catMap['GENERAL']!, author: hiro,
      replies: [
        { body: 'Always shoot to two cards simultaneously if your camera supports it. Lost a wedding to one card corruption years ago — never again.', author: kenji },
        { body: 'RAW only, multiple 128GB V90 cards. I swap cards every 3 hours regardless of how full they are.', author: admin },
        { body: 'I do RAW+JPEG for insurance. The JPEGs are immediately shareable and the RAWs are my backup for important shots.', author: sakura },
      ]
    },
    {
      title: 'Asakusa early morning — best arrival time?',
      body: 'I want to shoot Senso-ji without crowds. I\'ve heard 5am works, but sunrise varies so much through the year. What\'s your experience? Also is there a good vantage point for the thunder gate (Kaminarimon) with nobody in it?',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: yuki,
      replies: [
        { body: 'In summer, 4:30am gives you the best light and almost no people. Winter it\'s darker but still manageable at 6am.', author: hiro },
        { body: 'The gate itself is hard to get empty. I\'ve had luck very early on weekday mornings in February. Patience and waiting for the rare gap.', author: luna },
      ]
    },
  ]

  for (const t of threads) {
    const existing = await prisma.forumThread.findFirst({ where: { title: t.title } })
    if (existing) continue
    const thread = await prisma.forumThread.create({
      data: {
        title: t.title, body: t.body,
        authorId: t.author.id, categoryId: t.categoryId,
        replyCount: t.replies.length,
        lastReplyAt: daysAgo(1),
        createdAt: daysAgo(7),
      },
    })
    for (const r of t.replies) {
      await prisma.forumReply.create({
        data: { body: r.body, authorId: r.author.id, threadId: thread.id, createdAt: daysAgo(Math.floor(Math.random() * 6)) },
      })
    }
  }

  // ── Awards ───────────────────────────────────────────────────────────────────
  const topPhoto = createdPhotos.find(p => p.meta.seed === 'tokyo-landscape-1')! // Mt Fuji, votes: 89
  const secondPhoto = createdPhotos.find(p => p.meta.seed === 'tokyo-night-1')!  // Shinjuku Neons, votes: 72

  const weekStart = daysAgo(7)
  const weekEnd = now
  await prisma.award.upsert({
    where: { type_periodStart: { type: 'WEEKLY_WINNER', periodStart: weekStart } },
    update: {},
    create: {
      type: 'WEEKLY_WINNER',
      photoId: topPhoto.id, userId: topPhoto.authorId,
      periodStart: weekStart, periodEnd: weekEnd,
      voteCount: topPhoto.meta.votes,
    },
  })

  const monthStart = daysAgo(30)
  const monthEnd = now
  await prisma.award.upsert({
    where: { type_periodStart: { type: 'MONTHLY_WINNER', periodStart: monthStart } },
    update: {},
    create: {
      type: 'MONTHLY_WINNER',
      photoId: secondPhoto.id, userId: secondPhoto.authorId,
      periodStart: monthStart, periodEnd: monthEnd,
      voteCount: secondPhoto.meta.votes,
    },
  })

  // ── Collections ──────────────────────────────────────────────────────────────
  const streetPhotos = createdPhotos.filter(p => p.meta.category === 'STREET')
  const nightPhotos = createdPhotos.filter(p => p.meta.category === 'NIGHT')

  const sakuraColl = await prisma.collection.upsert({
    where: { id: 'seed-coll-sakura-1' },
    update: {},
    create: {
      id: 'seed-coll-sakura-1', name: 'Tokyo Street Favourites',
      description: 'My personal picks for the best street shots on the platform.',
      isPrivate: false, userId: sakura.id,
      coverUrl: nightPhotos[0] ? img(nightPhotos[0].meta.seed, 400, 500) : null,
    },
  })
  for (const photo of [...streetPhotos.slice(0, 3), ...nightPhotos.slice(0, 2)]) {
    await prisma.collectionItem.upsert({
      where: { collectionId_photoId: { collectionId: sakuraColl.id, photoId: photo.id } },
      update: {},
      create: { collectionId: sakuraColl.id, photoId: photo.id },
    })
  }

  const kenjiColl = await prisma.collection.upsert({
    where: { id: 'seed-coll-kenji-1' },
    update: {},
    create: {
      id: 'seed-coll-kenji-1', name: 'Night City Inspiration',
      isPrivate: false, userId: kenji.id,
      coverUrl: nightPhotos[0] ? img(nightPhotos[0].meta.seed, 400, 500) : null,
    },
  })
  for (const photo of nightPhotos) {
    await prisma.collectionItem.upsert({
      where: { collectionId_photoId: { collectionId: kenjiColl.id, photoId: photo.id } },
      update: {},
      create: { collectionId: kenjiColl.id, photoId: photo.id },
    })
  }

  // ── Follows ──────────────────────────────────────────────────────────────────
  const followPairs: [string, string][] = [
    [sakura.id, kenji.id], [sakura.id, yuki.id], [sakura.id, hiro.id],
    [kenji.id, sakura.id], [kenji.id, luna.id],
    [yuki.id, sakura.id], [yuki.id, kenji.id],
    [hiro.id, sakura.id], [hiro.id, luna.id], [hiro.id, yuki.id],
    [luna.id, kenji.id], [luna.id, hiro.id],
  ]
  for (const [followerId, followingId] of followPairs) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    })
  }

  console.log(`✓ Seed complete — ${createdPhotos.length} photos, ${threads.length} forum threads, 2 awards`)
  console.log('  Demo login: demo@tokyolens.jp / demo123456')
  console.log('  Admin login: admin@tokyolens.jp / admin123456')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
