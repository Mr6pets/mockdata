// 模板API服务
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class TemplateApiService {
  // 获取所有自定义模板
  async getTemplates() {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`);
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
  async createTemplate(template) {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`, {
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
      return this.createTemplateInLocalStorage(template);
    }
  }

  // 删除模板
  async deleteTemplate(templateId) {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('删除模板失败:', error);
      // 如果API调用失败，回退到localStorage
      return this.deleteTemplateFromLocalStorage(templateId);
    }
  }

  // 更新模板
  async updateTemplate(templateId, template) {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'PUT',
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
      console.error('更新模板失败:', error);
      // 如果API调用失败，回退到localStorage
      return this.updateTemplateInLocalStorage(templateId, template);
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

  createTemplateInLocalStorage(template) {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      
      // 检查是否已存在相同ID的模板
      if (templates.find(t => t.id === template.id)) {
        throw new Error('模板ID已存在');
      }
      
      const newTemplate = {
        ...template,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      
      templates.push(newTemplate);
      localStorage.setItem('customFieldTemplates', JSON.stringify(templates));
      
      return { 
        message: '模板创建成功（本地存储）',
        template: newTemplate
      };
    } catch (error) {
      console.error('在localStorage中创建模板失败:', error);
      throw error;
    }
  }

  deleteTemplateFromLocalStorage(templateId) {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      const index = templates.findIndex(t => t.id === templateId);
      
      if (index === -1) {
        throw new Error('模板不存在');
      }
      
      templates.splice(index, 1);
      localStorage.setItem('customFieldTemplates', JSON.stringify(templates));
      
      return { message: '模板删除成功（本地存储）' };
    } catch (error) {
      console.error('从localStorage删除模板失败:', error);
      throw error;
    }
  }

  updateTemplateInLocalStorage(templateId, template) {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      const index = templates.findIndex(t => t.id === templateId);
      
      if (index === -1) {
        throw new Error('模板不存在');
      }
      
      templates[index] = {
        ...templates[index],
        ...template,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('customFieldTemplates', JSON.stringify(templates));
      
      return { 
        message: '模板更新成功（本地存储）',
        template: templates[index]
      };
    } catch (error) {
      console.error('在localStorage中更新模板失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const templateApiService = new TemplateApiService();

export default templateApiService;