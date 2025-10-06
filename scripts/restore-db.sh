#!/bin/bash

# 数据库恢复脚本
# 用法: ./scripts/restore-db.sh <backup_file>

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: $0 <backup_file>"
    echo "示例: $0 ./backups/backup_20250106_120000.db.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_FILE="./prisma/prod.db"
TEMP_FILE="./prisma/temp_restore.db"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "警告: 此操作将覆盖当前数据库!"
echo "备份文件: $BACKUP_FILE"
echo "目标文件: $DB_FILE"
read -p "确认继续? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

# 备份当前数据库
if [ -f "$DB_FILE" ]; then
    CURRENT_BACKUP="./backups/before_restore_$(date +"%Y%m%d_%H%M%S").db"
    echo "备份当前数据库到: $CURRENT_BACKUP"
    cp "$DB_FILE" "$CURRENT_BACKUP"
    gzip "$CURRENT_BACKUP"
fi

# 解压备份文件
echo "解压备份文件..."
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

# 恢复数据库
echo "恢复数据库..."
mv "$TEMP_FILE" "$DB_FILE"

echo "数据库恢复完成!"
echo "请重启应用以使更改生效"

exit 0

