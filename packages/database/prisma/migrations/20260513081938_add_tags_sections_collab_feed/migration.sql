-- AlterTable
ALTER TABLE "collection_items" ADD COLUMN     "note" TEXT,
ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "isCollaborative" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "forum_threads" ADD COLUMN     "sourcePhotoId" TEXT;

-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "previewUrl" TEXT;

-- CreateTable
CREATE TABLE "collection_sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_collaborators" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_tags" (
    "photoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("photoId","tagId")
);

-- CreateIndex
CREATE INDEX "collection_sections_collectionId_sortOrder_idx" ON "collection_sections"("collectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "collection_collaborators_userId_idx" ON "collection_collaborators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_collaborators_collectionId_userId_key" ON "collection_collaborators"("collectionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "collection_items_sectionId_idx" ON "collection_items"("sectionId");

-- CreateIndex
CREATE INDEX "forum_threads_sourcePhotoId_idx" ON "forum_threads"("sourcePhotoId");

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_sourcePhotoId_fkey" FOREIGN KEY ("sourcePhotoId") REFERENCES "photos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_sections" ADD CONSTRAINT "collection_sections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_collaborators" ADD CONSTRAINT "collection_collaborators_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_collaborators" ADD CONSTRAINT "collection_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "collection_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
