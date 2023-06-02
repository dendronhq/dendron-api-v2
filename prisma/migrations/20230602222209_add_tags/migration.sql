/*
  Warnings:

  - Added the required column `tags` to the `note` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fname" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updated" INTEGER NOT NULL,
    "created" INTEGER NOT NULL,
    "vault_name" TEXT NOT NULL
);
INSERT INTO "new_note" ("body", "created", "fname", "id", "title", "updated", "vault_name") SELECT "body", "created", "fname", "id", "title", "updated", "vault_name" FROM "note";
DROP TABLE "note";
ALTER TABLE "new_note" RENAME TO "note";
CREATE INDEX "idx_notes_id" ON "note"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
