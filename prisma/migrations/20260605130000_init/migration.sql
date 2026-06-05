-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "rawData" JSONB,
    "summary" JSONB,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetectedTool" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "identifier" TEXT,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "evidence" JSONB,

    CONSTRAINT "DetectedTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetectedEvent" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT,
    "parameters" JSONB,
    "rawPayload" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetectedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventName" TEXT,
    "evidence" JSONB,
    "businessImpact" TEXT NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_startedAt_idx" ON "Audit"("startedAt");

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE INDEX "DetectedTool_auditId_idx" ON "DetectedTool"("auditId");

-- CreateIndex
CREATE INDEX "DetectedTool_name_idx" ON "DetectedTool"("name");

-- CreateIndex
CREATE INDEX "DetectedEvent_auditId_idx" ON "DetectedEvent"("auditId");

-- CreateIndex
CREATE INDEX "DetectedEvent_normalizedName_idx" ON "DetectedEvent"("normalizedName");

-- CreateIndex
CREATE INDEX "Issue_auditId_idx" ON "Issue"("auditId");

-- CreateIndex
CREATE INDEX "Issue_severity_idx" ON "Issue"("severity");

-- AddForeignKey
ALTER TABLE "DetectedTool" ADD CONSTRAINT "DetectedTool_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectedEvent" ADD CONSTRAINT "DetectedEvent_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

