# MySQL数据库设置指南

## 1. 数据库准备

### 方式一：使用Navicat创建数据库
1. 打开Navicat，连接到你的MySQL服务器
2. 右键点击连接，选择"新建数据库"
3. 数据库名称：`mockdata_generator`
4. 字符集：`utf8mb4`
5. 排序规则：`utf8mb4_unicode_ci`

### 方式二：使用SQL命令创建
```sql
CREATE DATABASE IF NOT EXISTS mockdata_generator 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

## 2. 创建数据表

在Navicat中打开`mockdata_generator`数据库，执行以下SQL：

```sql
USE mockdata_generator;

CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(36) PRIMARY KEY COMMENT '模板唯一标识符',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    fields JSON NOT NULL COMMENT '字段配置（JSON格式）',
    is_custom BOOLEAN DEFAULT TRUE COMMENT '是否为自定义模板',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字段模板表';
```

## 3. 配置环境变量

编辑 `.env` 文件，设置你的MySQL连接信息：

```env
# MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=mockdata_generator

# 服务器配置
PORT=3001
```

## 4. 数据迁移

如果你之前有JSON格式的模板数据，可以运行迁移脚本：

```bash
node migrate.js
```

## 5. 启动服务器

```bash
npm start
```

## 6. 在Navicat中查看数据

1. 刷新数据库连接
2. 展开 `mockdata_generator` 数据库
3. 双击 `templates` 表查看数据
4. 可以直接在表格中编辑数据

## 表结构说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(36) | 模板唯一标识符（主键） |
| name | VARCHAR(100) | 模板名称 |
| description | TEXT | 模板描述 |
| fields | JSON | 字段配置（JSON格式） |
| is_custom | BOOLEAN | 是否为自定义模板 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 常见问题

### Q: 连接数据库失败
A: 检查以下项目：
- MySQL服务是否启动
- 用户名密码是否正确
- 数据库是否存在
- 防火墙设置

### Q: JSON字段显示问题
A: 在Navicat中，JSON字段可能显示为文本，这是正常的。可以点击字段查看完整JSON内容。

### Q: 中文显示乱码
A: 确保数据库和表都使用utf8mb4字符集。