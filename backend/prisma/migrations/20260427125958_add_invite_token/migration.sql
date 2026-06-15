-- AlterTable
ALTER TABLE "users" ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT;
