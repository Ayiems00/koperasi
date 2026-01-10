
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  name: 'name',
  role: 'role',
  branch: 'branch',
  position: 'position',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LivestockScalarFieldEnum = {
  id: 'id',
  type: 'type',
  batchId: 'batchId',
  tagId: 'tagId',
  quantity: 'quantity',
  initialWeight: 'initialWeight',
  currentWeight: 'currentWeight',
  status: 'status',
  dateReceived: 'dateReceived',
  farmLocation: 'farmLocation',
  costPrice: 'costPrice',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SlaughterLogScalarFieldEnum = {
  id: 'id',
  livestockId: 'livestockId',
  date: 'date',
  quantity: 'quantity',
  yieldWeight: 'yieldWeight',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  unitType: 'unitType',
  price: 'price',
  costPrice: 'costPrice',
  stock: 'stock',
  sku: 'sku',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  memberId: 'memberId',
  totalAmount: 'totalAmount',
  paymentMethod: 'paymentMethod',
  status: 'status',
  date: 'date'
};

exports.Prisma.TransactionItemScalarFieldEnum = {
  id: 'id',
  transactionId: 'transactionId',
  productId: 'productId',
  quantity: 'quantity',
  price: 'price',
  subtotal: 'subtotal'
};

exports.Prisma.MemberScalarFieldEnum = {
  id: 'id',
  name: 'name',
  icNumber: 'icNumber',
  phone: 'phone',
  points: 'points',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AllowanceTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  approvalRequired: 'approvalRequired',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceAllowanceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  invoiceNumber: 'invoiceNumber',
  month: 'month',
  year: 'year',
  totalAmount: 'totalAmount',
  status: 'status',
  approvalTimestamp: 'approvalTimestamp',
  approverRole: 'approverRole',
  approverName: 'approverName',
  originalInvoiceId: 'originalInvoiceId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceAllowanceItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  allowanceTypeId: 'allowanceTypeId',
  amount: 'amount',
  description: 'description'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  oldValue: 'oldValue',
  newValue: 'newValue',
  details: 'details',
  reason: 'reason',
  timestamp: 'timestamp'
};

exports.Prisma.ProfileChangeRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  field: 'field',
  oldValue: 'oldValue',
  newValue: 'newValue',
  status: 'status',
  adminNote: 'adminNote',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvestmentSummaryScalarFieldEnum = {
  id: 'id',
  totalAmount: 'totalAmount',
  startDate: 'startDate',
  category: 'category',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvestmentHistoryScalarFieldEnum = {
  id: 'id',
  investmentId: 'investmentId',
  previousAmount: 'previousAmount',
  newAmount: 'newAmount',
  changeType: 'changeType',
  editedByUserId: 'editedByUserId',
  reason: 'reason',
  timestamp: 'timestamp'
};

exports.Prisma.DividendSettingScalarFieldEnum = {
  id: 'id',
  investmentId: 'investmentId',
  cycle: 'cycle',
  percentage: 'percentage',
  amount: 'amount',
  declarationDate: 'declarationDate',
  paymentStatus: 'paymentStatus',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DividendHistoryScalarFieldEnum = {
  id: 'id',
  dividendId: 'dividendId',
  cycle: 'cycle',
  percentage: 'percentage',
  amount: 'amount',
  declarationDate: 'declarationDate',
  paymentDate: 'paymentDate',
  status: 'status',
  editedByUserId: 'editedByUserId',
  createdAt: 'createdAt'
};

exports.Prisma.MemberInvestmentScalarFieldEnum = {
  id: 'id',
  memberId: 'memberId',
  submittedByUserId: 'submittedByUserId',
  amount: 'amount',
  type: 'type',
  bankName: 'bankName',
  referenceNo: 'referenceNo',
  date: 'date',
  proofPath: 'proofPath',
  notes: 'notes',
  status: 'status',
  rejectionReason: 'rejectionReason',
  approvedByUserId: 'approvedByUserId',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermissionModuleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  module: 'module',
  allowed: 'allowed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExpenseCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExpenseScalarFieldEnum = {
  id: 'id',
  name: 'name',
  categoryId: 'categoryId',
  amount: 'amount',
  date: 'date',
  paymentMethod: 'paymentMethod',
  referenceNo: 'referenceNo',
  notes: 'notes',
  createdByUserId: 'createdByUserId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  bankName: 'bankName',
  proofPath: 'proofPath'
};

exports.Prisma.ExpenseHistoryScalarFieldEnum = {
  id: 'id',
  expenseId: 'expenseId',
  previousAmount: 'previousAmount',
  newAmount: 'newAmount',
  editedByUserId: 'editedByUserId',
  timestamp: 'timestamp'
};

exports.Prisma.MemberInvestmentHistoryScalarFieldEnum = {
  id: 'id',
  investmentId: 'investmentId',
  memberId: 'memberId',
  amount: 'amount',
  transactionDate: 'transactionDate',
  approvedByUserId: 'approvedByUserId',
  approvedAt: 'approvedAt',
  source: 'source',
  proofPath: 'proofPath',
  createdAt: 'createdAt'
};

exports.Prisma.ExpenseVisibilityScalarFieldEnum = {
  id: 'id',
  superAdmin: 'superAdmin',
  admin: 'admin',
  finance: 'finance',
  posUser: 'posUser',
  farmAdmin: 'farmAdmin',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Livestock: 'Livestock',
  SlaughterLog: 'SlaughterLog',
  Product: 'Product',
  Transaction: 'Transaction',
  TransactionItem: 'TransactionItem',
  Member: 'Member',
  AllowanceType: 'AllowanceType',
  InvoiceAllowance: 'InvoiceAllowance',
  InvoiceAllowanceItem: 'InvoiceAllowanceItem',
  AuditLog: 'AuditLog',
  ProfileChangeRequest: 'ProfileChangeRequest',
  InvestmentSummary: 'InvestmentSummary',
  InvestmentHistory: 'InvestmentHistory',
  DividendSetting: 'DividendSetting',
  DividendHistory: 'DividendHistory',
  MemberInvestment: 'MemberInvestment',
  PermissionModule: 'PermissionModule',
  ExpenseCategory: 'ExpenseCategory',
  Expense: 'Expense',
  ExpenseHistory: 'ExpenseHistory',
  MemberInvestmentHistory: 'MemberInvestmentHistory',
  ExpenseVisibility: 'ExpenseVisibility'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
