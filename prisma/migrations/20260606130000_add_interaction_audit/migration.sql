-- Add interaction audit result fields
ALTER TABLE "Audit" ADD COLUMN "interactions" JSONB;
ALTER TABLE "Audit" ADD COLUMN "interactionSummary" JSONB;
