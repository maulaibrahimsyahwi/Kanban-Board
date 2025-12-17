-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "TaskProgress" AS ENUM ('not_started', 'in_progress', 'done');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "statusId" TEXT;

-- Normalize existing data before converting to enums
UPDATE "Task"
SET "priority" = CASE
  WHEN "priority" = 'urgent' THEN 'critical'
  WHEN "priority" = 'important' THEN 'high'
  ELSE "priority"
END;

UPDATE "Task"
SET "progress" = CASE
  WHEN "progress" = 'not-started' THEN 'not_started'
  WHEN "progress" = 'in-progress' THEN 'in_progress'
  WHEN "progress" = 'completed' THEN 'done'
  ELSE "progress"
END;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "priority" DROP DEFAULT,
ALTER COLUMN "priority" TYPE "Priority" USING ("priority"::text)::"Priority",
ALTER COLUMN "priority" SET DEFAULT 'low'::"Priority",
ALTER COLUMN "progress" DROP DEFAULT,
ALTER COLUMN "progress" TYPE "TaskProgress" USING ("progress"::text)::"TaskProgress",
ALTER COLUMN "progress" SET DEFAULT 'not_started'::"TaskProgress";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSOSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT,
    "ssoUrl" TEXT,
    "issuer" TEXT,
    "certificate" TEXT,
    "forceSSO" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SSOSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SSOSettings_userId_key" ON "SSOSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_TaskAssignees_AB_pkey" ON "_TaskAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskAssignees_B_index" ON "_TaskAssignees"("B");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "ProjectStatus_userId_idx" ON "ProjectStatus"("userId");

-- CreateIndex
CREATE INDEX "Board_projectId_idx" ON "Board"("projectId");

-- CreateIndex
CREATE INDEX "Task_boardId_idx" ON "Task"("boardId");

-- CreateIndex
CREATE INDEX "Task_statusId_idx" ON "Task"("statusId");

-- CreateIndex
CREATE INDEX "ChecklistItem_taskId_idx" ON "ChecklistItem"("taskId");

-- CreateIndex
CREATE INDEX "Label_taskId_idx" ON "Label"("taskId");

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProjectStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSOSettings" ADD CONSTRAINT "SSOSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignees" ADD CONSTRAINT "_TaskAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignees" ADD CONSTRAINT "_TaskAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
