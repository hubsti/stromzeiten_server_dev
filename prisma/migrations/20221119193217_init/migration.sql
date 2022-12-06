-- CreateTable
CREATE TABLE "Datapoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "metadataid" INTEGER,
    "postedById" INTEGER,
    CONSTRAINT "Datapoint_metadataid_fkey" FOREIGN KEY ("metadataid") REFERENCES "Metadata" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Datapoint_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "unit" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_type_key" ON "Metadata"("type");
