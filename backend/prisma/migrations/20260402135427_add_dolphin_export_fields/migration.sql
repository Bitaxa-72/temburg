-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "exported_at" TIMESTAMP(3),
ADD COLUMN     "is_exported" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "bookings_is_exported_status_idx" ON "bookings"("is_exported", "status");
