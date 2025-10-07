-- CreateTable
CREATE TABLE "product_sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_sync_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sourcePlatform" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "images" TEXT NOT NULL,
    "specifications" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "rating" REAL,
    "reviewCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dropshippingSupported" BOOLEAN NOT NULL DEFAULT false,
    "supplierName" TEXT,
    "supplierUrl" TEXT,
    "supplierShopId" TEXT,
    "costPrice" REAL,
    "suggestedRetailPrice" REAL,
    "profitMargin" REAL,
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
    "shippingTime" TEXT,
    "shippingFrom" TEXT,
    "stockQuantity" INTEGER,
    "stockSyncedAt" DATETIME,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "searchKeywords" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("category", "createdAt", "currency", "description", "id", "images", "price", "rating", "reviewCount", "sourcePlatform", "sourceProductId", "specifications", "status", "tags", "title", "updatedAt", "userId") SELECT "category", "createdAt", "currency", "description", "id", "images", "price", "rating", "reviewCount", "sourcePlatform", "sourceProductId", "specifications", "status", "tags", "title", "updatedAt", "userId" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE INDEX "products_userId_idx" ON "products"("userId");
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE INDEX "products_dropshippingSupported_idx" ON "products"("dropshippingSupported");
CREATE UNIQUE INDEX "products_sourcePlatform_sourceProductId_key" ON "products"("sourcePlatform", "sourceProductId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "product_sync_logs_productId_idx" ON "product_sync_logs"("productId");

-- CreateIndex
CREATE INDEX "product_sync_logs_platform_idx" ON "product_sync_logs"("platform");

-- CreateIndex
CREATE INDEX "product_sync_logs_syncedAt_idx" ON "product_sync_logs"("syncedAt");
