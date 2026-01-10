-- CreateTable
CREATE TABLE "InvestmentSummary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InvestmentHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "investmentId" INTEGER NOT NULL,
    "previousAmount" REAL NOT NULL,
    "newAmount" REAL NOT NULL,
    "changeType" TEXT NOT NULL,
    "editedByUserId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvestmentHistory_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "InvestmentSummary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestmentHistory_editedByUserId_fkey" FOREIGN KEY ("editedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DividendSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "investmentId" INTEGER NOT NULL,
    "cycle" TEXT NOT NULL,
    "percentage" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL DEFAULT 0,
    "declarationDate" DATETIME,
    "paymentStatus" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DividendSetting_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "InvestmentSummary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DividendHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dividendId" INTEGER NOT NULL,
    "cycle" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "declarationDate" DATETIME NOT NULL,
    "paymentDate" DATETIME,
    "status" TEXT NOT NULL,
    "editedByUserId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DividendHistory_dividendId_fkey" FOREIGN KEY ("dividendId") REFERENCES "DividendSetting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DividendHistory_editedByUserId_fkey" FOREIGN KEY ("editedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
