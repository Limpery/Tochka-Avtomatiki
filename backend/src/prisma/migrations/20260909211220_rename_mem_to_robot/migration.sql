-- RenameTable: Mem -> Robot (memes -> robots rebrand)
ALTER TABLE "Mem" RENAME TO "Robot";
ALTER INDEX "Mem_pkey" RENAME TO "Robot_pkey";
ALTER INDEX "Mem_name_key" RENAME TO "Robot_name_key";
