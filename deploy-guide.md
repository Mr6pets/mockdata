# 部署指南

## 项目架构
- **前端**: React + Vite (根目录)
- **后端**: Node.js + Express (server/ 目录)

## 部署步骤

### 1. 前端部署

#### 本地构建
```bash
# 在项目根目录
cd d:\githubStore\mockdata
npm run build:prod
```

#### 上传到服务器
1. 将生成的 `dist/` 目录上传到服务器
2. 推荐路径：`/var/www/mockdata/` 或 `/usr/share/nginx/html/mockdata/`

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name mockdatagenerator.guluwater.com;
    
    # 前端静态文件
    location / {
        root /var/www/mockdata/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 后端部署

#### 上传文件
将以下文件/目录上传到服务器：
```
server/
├── .env.production     # 生产环境配置
├── package.json
├── server.js
├── database.js
├── database.sql
└── 其他文件...
```

#### 服务器操作
```bash
# 进入后端目录
cd /path/to/server

# 安装依赖
npm install

# 启动服务（生产环境）
npm run start:prod

# 或者使用 PM2 管理进程
pm2 start server.js --name "mockdata-api" --env production
```

### 3. 数据库配置

#### 创建数据库
```sql
CREATE DATABASE mockdata_generator 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

#### 导入表结构
```bash
mysql -u root -p mockdata_generator < database.sql
```

## 环境配置

### 前端环境变量
**生产环境** (`.env.production`):
```env
VITE_API_BASE_URL=http://mockdatagenerator.guluwater.com/api
VITE_APP_ENV=production
```

### 后端环境变量
**生产环境** (`server/.env.production`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=8bR39mc9!
DB_NAME=mockdata_generator
PORT=3001
NODE_ENV=production
```

## 部署检查清单

### 前端检查
- [ ] `dist/` 目录已生成
- [ ] 静态文件已上传到 Web 服务器
- [ ] Nginx 配置正确
- [ ] 域名解析正确

### 后端检查
- [ ] `server/` 目录已上传
- [ ] `.env.production` 配置正确
- [ ] 依赖已安装 (`npm install`)
- [ ] 数据库连接正常
- [ ] 服务启动成功 (`npm run start:prod`)

### 数据库检查
- [ ] 数据库 `mockdata_generator` 已创建
- [ ] 表结构已导入
- [ ] 数据库用户权限正确
- [ ] 密码配置正确

## 常见问题

### API 请求失败
1. 检查 Nginx 反向代理配置
2. 确认后端服务是否运行在 3001 端口
3. 检查防火墙设置

### 数据库连接失败
1. 确认数据库密码是否为 `8bR39mc9!`
2. 检查数据库服务是否启动
3. 验证用户权限

### 静态文件 404
1. 检查 Nginx 配置中的 root 路径
2. 确认 `dist/` 目录权限
3. 检查 `try_files` 配置

## 进程管理（推荐使用 PM2）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "mockdata-api" --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs mockdata-api

# 重启应用
pm2 restart mockdata-api
```