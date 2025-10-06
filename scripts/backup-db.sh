#!/bin/bash

# 数据库备份脚本
# 用法: ./scripts/backup-db.sh

set -e

# 配置
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="./prisma/prod.db"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.db"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "开始备份数据库..."
echo "源文件: $DB_FILE"
echo "备份文件: $BACKUP_FILE"

# 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
    echo "错误: 数据库文件不存在: $DB_FILE"
    exit 1
fi

# 复制数据库文件
cp "$DB_FILE" "$BACKUP_FILE"

# 压缩备份文件
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

echo "备份完成: $BACKUP_FILE"

# 计算备份文件大小
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "备份大小: $BACKUP_SIZE"

# 清理旧备份（保留最近7天）
echo "清理旧备份..."
find "$BACKUP_DIR" -name "backup_*.db.gz" -mtime +7 -delete
echo "清理完成"

# 列出所有备份
echo ""
echo "当前备份列表:"
ls -lh "$BACKUP_DIR"/backup_*.db.gz 2>/dev/null || echo "无备份文件"

exit 0

