-- AlterTable
ALTER TABLE "Comedian" ADD COLUMN     "instagramUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "youtubeUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "OrganizerProfile" ADD COLUMN     "instagramUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "youtubeUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
