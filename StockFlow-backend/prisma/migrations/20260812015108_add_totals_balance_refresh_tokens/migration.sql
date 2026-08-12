/*
  Warnings:

  - You are about to drop the column `reason` on the `stock_movements` table. All the data in the column will be lost.
  - Added the required column `balanceAfter` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `stock_movements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovementSource" AS ENUM ('MANUAL_ADJUSTMENT', 'CHALLAN_CONFIRMED', 'CHALLAN_CANCELLED_REVERSAL', 'PURCHASE_RECEIVED', 'DAMAGED', 'RETURNED');

-- AlterTable
ALTER TABLE "challans" ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "reason",
ADD COLUMN     "balanceAfter" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "source" "MovementSource" NOT NULL;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
