-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "bankName" TEXT;
ALTER TABLE "Expense" ADD COLUMN "proofPath" TEXT;

-- CreateTable
CREATE TABLE "MemberInvestmentHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "investmentId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "approvedByUserId" INTEGER NOT NULL,
    "approvedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "proofPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberInvestmentHistory_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "MemberInvestment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MemberInvestmentHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MemberInvestmentHistory_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
