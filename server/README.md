# MockData 后端 API 服务

这是一个简单的 Node.js + Express + SQLite 后端服务，用于存储和管理自定义字段模板。

## 功能特性

- ✅ RESTful API 接口
- ✅ SQLite 数据库存储
- ✅ CORS 跨域支持
- ✅ 模板增删改查操作

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将运行在 `http://localhost:3001`

## API 接口

### 获取所有模板
```
GET /api/templates
```

### 创建新模板
```
POST /api/templates
Content-Type: application/json

{
  "id": "template-id",
  "name": "模板名称",
  "description": "模板描述",
  "fields": [
    {
      "name": "字段名",
      "type": "字段类型",
      "required": true
    }
  ]
}
```

### 删除模板
```
DELETE /api/templates/:id
```

### 更新模板
```
PUT /api/templates/:id
Content-Type: application/json

{
  "name": "新模板名称",
  "description": "新模板描述",
  "fields": [...]
}
```

### 健康检查
```
GET /api/health
```

## 数据库

- 使用 SQLite 数据库
- 数据库文件：`server/templates.db`
- 自动创建表结构

## 部署到服务器

1. 将 `server` 文件夹上传到你的服务器
2. 安装 Node.js 和 npm
3. 运行 `npm install` 安装依赖
4. 使用 PM2 或其他进程管理器启动服务：

```bash
# 使用 PM2
npm install -g pm2
pm2 start server.js --name mockdata-api

# 或直接运行
npm start
```

## 环境变量

- `PORT`: 服务器端口（默认 3001）

## 注意事项

- 确保服务器防火墙开放对应端口
- 生产环境建议使用 HTTPS
- 可以考虑添加身份验证和权限控制