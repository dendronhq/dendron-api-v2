-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fname" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updated" INTEGER NOT NULL,
    "created" INTEGER NOT NULL,
    "vault_name" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "idx_notes_id" ON "note"("id");
