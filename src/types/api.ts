/**
 * API 类型定义
 * 定义 API 请求和响应的类型
 */

// ============================================================================
// API 响应类型
// ============================================================================

/**
 * API 成功响应
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * API 错误响应
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
  timestamp: string;
}

/**
 * API 响应（成功或错误）
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 分页元数据
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * 游标分页元数据
 */
export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

/**
 * 游标分页响应
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

// ============================================================================
// API 请求参数类型
// ============================================================================

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 搜索参数
 */
export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

/**
 * 完整查询参数
 */
export interface QueryParams extends PaginationParams, SortParams, SearchParams {}

/**
 * 游标分页参数
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

// ============================================================================
// API 错误类型
// ============================================================================

/**
 * API 错误代码
 */
export enum ApiErrorCode {
  // 认证错误 (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // 权限错误 (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // 资源错误 (404)
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  // 验证错误 (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // 冲突错误 (409)
  CONFLICT = "CONFLICT",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // 业务逻辑错误 (422)
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
  INVALID_OPERATION = "INVALID_OPERATION",

  // 速率限制 (429)
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // 服务器错误 (500)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",

  // 服务不可用 (503)
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  MAINTENANCE_MODE = "MAINTENANCE_MODE",
}

/**
 * API 错误详情
 */
export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  field?: string;
  value?: unknown;
  constraint?: string;
}

// ============================================================================
// 文件上传类型
// ============================================================================

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
}

/**
 * 批量文件上传响应
 */
export interface BatchFileUploadResponse {
  files: FileUploadResponse[];
  successCount: number;
  failureCount: number;
  errors?: Array<{
    fileName: string;
    error: string;
  }>;
}

// ============================================================================
// 批量操作类型
// ============================================================================

/**
 * 批量操作请求
 */
export interface BatchOperationRequest<T = unknown> {
  ids: string[];
  operation: string;
  data?: T;
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

// ============================================================================
// 统计和分析类型
// ============================================================================

/**
 * 统计数据
 */
export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  growth?: number;
  growthRate?: number;
}

/**
 * 时间序列数据点
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

/**
 * 时间序列数据
 */
export interface TimeSeriesData {
  data: TimeSeriesDataPoint[];
  total: number;
  average: number;
  min: number;
  max: number;
}

/**
 * 仪表板统计
 */
export interface DashboardStats {
  users: Statistics;
  shops: Statistics;
  products: Statistics;
  orders: Statistics;
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
}

// ============================================================================
// Webhook 类型
// ============================================================================

/**
 * Webhook 事件类型
 */
export enum WebhookEventType {
  ORDER_CREATED = "order.created",
  ORDER_UPDATED = "order.updated",
  ORDER_CANCELLED = "order.cancelled",
  PRODUCT_CREATED = "product.created",
  PRODUCT_UPDATED = "product.updated",
  PRODUCT_DELETED = "product.deleted",
  SHOP_CONNECTED = "shop.connected",
  SHOP_DISCONNECTED = "shop.disconnected",
}

/**
 * Webhook 负载
 */
export interface WebhookPayload<T = unknown> {
  event: WebhookEventType;
  timestamp: string;
  data: T;
  signature?: string;
}

// ============================================================================
// 导出和导入类型
// ============================================================================

/**
 * 导出格式
 */
export enum ExportFormat {
  CSV = "csv",
  XLSX = "xlsx",
  JSON = "json",
  XML = "xml",
}

/**
 * 导出请求
 */
export interface ExportRequest {
  format: ExportFormat;
  filters?: Record<string, unknown>;
  fields?: string[];
}

/**
 * 导出响应
 */
export interface ExportResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
}

/**
 * 导入结果
 */
export interface ImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}
