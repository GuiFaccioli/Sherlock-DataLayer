-- Add audit quality classification fields
ALTER TABLE "Audit" ADD COLUMN "auditStatus" TEXT;
ALTER TABLE "Audit" ADD COLUMN "collectionQuality" TEXT;
ALTER TABLE "Audit" ADD COLUMN "failureReason" TEXT;

-- Backfill existing rows with status-compatible values where possible
UPDATE "Audit"
SET "auditStatus" = "status"
WHERE "auditStatus" IS NULL;
