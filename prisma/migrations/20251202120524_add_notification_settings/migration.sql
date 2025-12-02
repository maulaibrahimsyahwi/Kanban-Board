-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'dd/MM/yyyy',
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endDateTrigger" TEXT NOT NULL DEFAULT '1day',
    "endDateEmail" BOOLEAN NOT NULL DEFAULT true,
    "endDatePush" BOOLEAN NOT NULL DEFAULT true,
    "deadlineTrigger" TEXT NOT NULL DEFAULT '1day',
    "deadlineEmail" BOOLEAN NOT NULL DEFAULT true,
    "deadlinePush" BOOLEAN NOT NULL DEFAULT true,
    "startDateTrigger" TEXT NOT NULL DEFAULT '1day',
    "startDateEmail" BOOLEAN NOT NULL DEFAULT true,
    "startDatePush" BOOLEAN NOT NULL DEFAULT true,
    "mentionsEmail" BOOLEAN NOT NULL DEFAULT true,
    "mentionsPush" BOOLEAN NOT NULL DEFAULT true,
    "assignedEmail" BOOLEAN NOT NULL DEFAULT true,
    "assignedPush" BOOLEAN NOT NULL DEFAULT true,
    "commentsEmail" BOOLEAN NOT NULL DEFAULT true,
    "commentsPush" BOOLEAN NOT NULL DEFAULT true,
    "attachmentsEmail" BOOLEAN NOT NULL DEFAULT true,
    "attachmentsPush" BOOLEAN NOT NULL DEFAULT true,
    "playSound" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
