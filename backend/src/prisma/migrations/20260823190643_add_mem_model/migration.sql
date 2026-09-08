-- CreateTable
CREATE TABLE "Mem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Mem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mem_name_key" ON "Mem"("name");
