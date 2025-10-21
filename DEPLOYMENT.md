# 部署说明文档

## 环境配置

本项目支持多环境部署，通过环境变量来配置不同环境的API地址。

### 环境变量文件

- `.env` - 开发环境配置
- `.env.production` - 生产环境配置

### 配置说明

#### 开发环境 (.env)
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

#### 生产环境 (.env.production)
```
VITE_API_BASE_URL=http://mockdatagenerator.guluwater.com/api
VITE_APP_ENV=production
```

## 部署步骤

### 1. 开发环境运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 生产环境构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 3. 生产环境部署

#### 前端部署
1. 执行 `npm run build` 构建项目
2. 将 `dist` 目录下的文件部署到 Web 服务器
3. 确保服务器配置支持 SPA 路由（如 Nginx 的 try_files 配置）

#### 后端部署
1. 将 `server` 目录部署到服务器
2. 配置 `server/.env` 文件中的数据库连接信息
3. 安装依赖：`npm install`
4. 启动服务：`npm start`

### 4. 环境变量说明

- `VITE_API_BASE_URL`: API 服务的基础URL
- `VITE_APP_ENV`: 应用环境标识

### 5. 注意事项

1. **API地址配置**: 生产环境需要将 `VITE_API_BASE_URL` 修改为实际的后端API地址
2. **CORS配置**: 确保后端服务器配置了正确的CORS策略
3. **HTTPS**: 生产环境建议使用HTTPS协议
4. **数据库**: 确保生产环境的MySQL数据库已正确配置

### 6. 域名配置示例

如果部署到 `http://mockdatagenerator.guluwater.com/`，需要：

1. 修改 `.env.production` 中的 `VITE_API_BASE_URL`
2. 确保后端API服务部署在对应的域名下
3. 配置Web服务器的反向代理（如果需要）

### 7. 构建命令

```bash
# 开发环境构建
npm run build

# 指定环境构建
npm run build -- --mode production
```

## 故障排除

### API请求失败
1. 检查 `.env.production` 中的API地址是否正确
2. 确认后端服务是否正常运行
3. 检查网络连接和CORS配置

### 环境变量不生效
1. 确保环境变量以 `VITE_` 开头
2. 重新构建项目
3. 检查 `vite.config.ts` 配置是否正确