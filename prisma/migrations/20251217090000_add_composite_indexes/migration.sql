-- CreateIndex
CREATE INDEX "Board_projectId_order_idx" ON "Board"("projectId", "order");

-- CreateIndex
CREATE INDEX "ProjectStatus_userId_order_idx" ON "ProjectStatus"("userId", "order");

-- CreateIndex
CREATE INDEX "Task_boardId_order_idx" ON "Task"("boardId", "order");
