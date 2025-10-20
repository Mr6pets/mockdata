import { GeneratedData } from '../types';

// Mock API服务器类
export class MockApiServer {
  private data: GeneratedData[] = [];
  private isRunning: boolean = false;
  private port: number = 3001;
  private baseUrl: string = '';

  constructor(port: number = 3001) {
    this.port = port;
    this.baseUrl = `http://localhost:${port}`;
  }

  // 设置数据
  setData(data: GeneratedData[]): void {
    this.data = data;
  }

  // 获取API端点信息
  getEndpoints(): Array<{ method: string; path: string; description: string }> {
    return [
      { method: 'GET', path: '/api/data', description: '获取所有数据' },
      { method: 'GET', path: '/api/data/:id', description: '根据ID获取单条数据' },
      { method: 'GET', path: '/api/data/random', description: '获取随机数据' },
      { method: 'GET', path: '/api/data/count', description: '获取数据总数' },
      { method: 'GET', path: '/api/health', description: '健康检查' },
    ];
  }

  // 生成API文档
  generateApiDoc(): string {
    const endpoints = this.getEndpoints();
    const sampleData = this.data.slice(0, 2);

    return `
# Mock API 文档

## 基础信息
- 服务地址: ${this.baseUrl}
- 数据总数: ${this.data.length} 条
- 状态: ${this.isRunning ? '运行中' : '已停止'}

## API 端点

${endpoints.map(endpoint => `
### ${endpoint.method} ${endpoint.path}
${endpoint.description}

**请求示例:**
\`\`\`
curl -X ${endpoint.method} "${this.baseUrl}${endpoint.path}"
\`\`\`
`).join('\n')}

## 数据样例
\`\`\`json
${JSON.stringify(sampleData, null, 2)}
\`\`\`

## 使用说明
1. 所有接口返回JSON格式数据
2. 支持CORS跨域请求
3. 错误时返回相应的HTTP状态码
4. 数据ID从1开始递增
    `;
  }

  // 模拟启动服务器（实际上是创建一个虚拟的API服务）
  start(): Promise<{ success: boolean; message: string; endpoints: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isRunning = true;
        resolve({
          success: true,
          message: `Mock API 服务已启动在 ${this.baseUrl}`,
          endpoints: this.getEndpoints().map(endpoint => ({
            ...endpoint,
            url: `${this.baseUrl}${endpoint.path}`
          }))
        });
      }, 1000);
    });
  }

  // 停止服务器
  stop(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isRunning = false;
        resolve({
          success: true,
          message: 'Mock API 服务已停止'
        });
      }, 500);
    });
  }

  // 获取服务状态
  getStatus(): { isRunning: boolean; port: number; baseUrl: string; dataCount: number } {
    return {
      isRunning: this.isRunning,
      port: this.port,
      baseUrl: this.baseUrl,
      dataCount: this.data.length
    };
  }

  // 模拟API响应
  simulateApiResponse(endpoint: string, params?: any): any {
    if (!this.isRunning) {
      return { error: 'API服务未启动' };
    }

    switch (endpoint) {
      case '/api/data':
        return {
          success: true,
          data: this.data,
          total: this.data.length,
          timestamp: new Date().toISOString()
        };

      case '/api/data/random':
        const randomIndex = Math.floor(Math.random() * this.data.length);
        return {
          success: true,
          data: this.data[randomIndex] || null,
          timestamp: new Date().toISOString()
        };

      case '/api/data/count':
        return {
          success: true,
          count: this.data.length,
          timestamp: new Date().toISOString()
        };

      case '/api/health':
        return {
          success: true,
          status: 'healthy',
          uptime: '模拟运行时间',
          timestamp: new Date().toISOString()
        };

      default:
        if (endpoint.startsWith('/api/data/') && params?.id) {
          const id = parseInt(params.id);
          const item = this.data[id - 1]; // ID从1开始
          if (item) {
            return {
              success: true,
              data: { ...item, id },
              timestamp: new Date().toISOString()
            };
          } else {
            return {
              success: false,
              error: '数据不存在',
              timestamp: new Date().toISOString()
            };
          }
        }
        return {
          success: false,
          error: '端点不存在',
          timestamp: new Date().toISOString()
        };
    }
  }

  // 生成Postman集合
  generatePostmanCollection(): any {
    const endpoints = this.getEndpoints();
    
    return {
      info: {
        name: 'Mock Data API',
        description: '自动生成的Mock数据API集合',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: endpoints.map(endpoint => ({
        name: endpoint.description,
        request: {
          method: endpoint.method,
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            }
          ],
          url: {
            raw: `${this.baseUrl}${endpoint.path}`,
            protocol: 'http',
            host: ['localhost'],
            port: this.port.toString(),
            path: endpoint.path.split('/').filter(p => p)
          }
        },
        response: []
      }))
    };
  }
}

// 创建全局实例
export const mockApiServer = new MockApiServer();