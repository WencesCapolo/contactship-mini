-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('IDLE', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "aiStatus" "AiStatus" NOT NULL DEFAULT 'IDLE';
