/*
  Warnings:

  - Added the required column `invoiceNumber` to the `InvoiceAllowance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN "reason" TEXT;

-- CreateTable
CREATE TABLE "PermissionModule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PermissionModule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AllowanceType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AllowanceType" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "AllowanceType";
DROP TABLE "AllowanceType";
ALTER TABLE "new_AllowanceType" RENAME TO "AllowanceType";
CREATE UNIQUE INDEX "AllowanceType_name_key" ON "AllowanceType"("name");
CREATE TABLE "new_InvoiceAllowance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "approvalTimestamp" DATETIME,
    "approverRole" TEXT,
    "approverName" TEXT,
    "originalInvoiceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvoiceAllowance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvoiceAllowance_originalInvoiceId_fkey" FOREIGN KEY ("originalInvoiceId") REFERENCES "InvoiceAllowance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvoiceAllowance" ("createdAt", "id", "month", "status", "totalAmount", "updatedAt", "userId", "year") SELECT "createdAt", "id", "month", "status", "totalAmount", "updatedAt", "userId", "year" FROM "InvoiceAllowance";
DROP TABLE "InvoiceAllowance";
ALTER TABLE "new_InvoiceAllowance" RENAME TO "InvoiceAllowance";
CREATE UNIQUE INDEX "InvoiceAllowance_invoiceNumber_key" ON "InvoiceAllowance"("invoiceNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PermissionModule_userId_module_key" ON "PermissionModule"("userId", "module");
