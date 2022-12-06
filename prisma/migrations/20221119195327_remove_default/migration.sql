-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Datapoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "metadataid" INTEGER,
    "postedById" INTEGER,
    CONSTRAINT "Datapoint_metadataid_fkey" FOREIGN KEY ("metadataid") REFERENCES "Metadata" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Datapoint_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Datapoint" ("id", "metadataid", "postedById", "timestamp", "value") SELECT "id", "metadataid", "postedById", "timestamp", "value" FROM "Datapoint";
DROP TABLE "Datapoint";
ALTER TABLE "new_Datapoint" RENAME TO "Datapoint";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
