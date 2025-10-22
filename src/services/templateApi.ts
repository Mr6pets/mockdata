// 模板API服务

// 类型定义
interface Template {
  id: string;
  name: string;
  description?: string;
  fields: FieldConfig[];
  createdAt?: string;
  updatedAt?: string;
}

interface FieldConfig {
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  format?: string;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class TemplateApiService {
  private baseUrl: string = API_BASE_URL;
  private storageKey: string = 'customFieldTemplates';

  // 获取所有自定义模板
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取模板失败:', error);
      // 如果API调用失败，回退到localStorage
      return this.getTemplatesFromLocalStorage();
    }
  }

  // 创建新模板
  async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template | null> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('创建模板失败:', error);
      // 如果API调用失败，回退到localStorage
      const newTemplate: Template = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.createTemplateInLocalStorage(newTemplate);
      return newTemplate;
    }
  }

  // 删除模板
  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.deleteTemplateFromLocalStorage(templateId);
      return { success: true, data: undefined };
    } catch (error) {
      console.error('删除模板失败:', error);
      this.deleteTemplateFromLocalStorage(templateId);
      return { success: true, data: undefined };
    }
  }

  async updateTemplate(templateId: string, template: Template): Promise<ApiResponse<Template>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.updateTemplateInLocalStorage(templateId, data);
      return { success: true, data };
    } catch (error) {
      console.error('更新模板失败:', error);
      this.updateTemplateInLocalStorage(templateId, template);
      return { success: true, data: template };
    }
  }

  // 检查服务器健康状态
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('服务器健康检查失败:', error);
      return false;
    }
  }

  // localStorage回退方法
  getTemplatesFromLocalStorage() {
    try {
      const templates = localStorage.getItem('customFieldTemplates');
      return templates ? JSON.parse(templates) : [];
    } catch (error) {
      console.error('从localStorage读取模板失败:', error);
      return [];
    }
  }

  createTemplateInLocalStorage(template: Template): void {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      if (templates.find((t: Template) => t.id === template.id)) {
        console.warn('模板已存在，跳过创建');
        return;
      }
      templates.push(template);
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('保存模板到本地存储失败:', error);
    }
  }

  deleteTemplateFromLocalStorage(templateId: string): void {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      const index = templates.findIndex((t: Template) => t.id === templateId);
      if (index > -1) {
        templates.splice(index, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(templates));
      }
    } catch (error) {
      console.error('从本地存储删除模板失败:', error);
    }
  }

  updateTemplateInLocalStorage(templateId: string, template: Template): void {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      const index = templates.findIndex((t: Template) => t.id === templateId);
      if (index > -1) {
        templates[index] = template;
        localStorage.setItem(this.storageKey, JSON.stringify(templates));
      }
    } catch (error) {
      console.error('更新本地存储模板失败:', error);
    }
  }
}

// 创建单例实例
const templateApiService = new TemplateApiService();

export default templateApiService;