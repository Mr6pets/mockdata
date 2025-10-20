import { saveAs } from 'file-saver';
import { ExportOptions, GeneratedData } from '../types';

// JSON导出
const exportToJSON = (data: GeneratedData[], filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${filename}.json`);
};

// CSV导出
const exportToCSV = (data: GeneratedData[], filename: string): void => {
  if (data.length === 0) return;

  // 获取所有字段名
  const headers = Object.keys(data[0]);
  
  // 创建CSV内容
  const csvContent = [
    // 表头
    headers.join(','),
    // 数据行
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号、引号或换行符的值
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // 添加BOM以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
};

// XML导出
const exportToXML = (data: GeneratedData[], filename: string): void => {
  if (data.length === 0) return;

  // 转义XML特殊字符
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // 生成XML内容
  const xmlContent = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<data>',
    ...data.map((row, index) => {
      const itemContent = Object.entries(row)
        .map(([key, value]) => {
          if (value === null || value === undefined) {
            return `  <${key}></${key}>`;
          }
          return `  <${key}>${escapeXML(String(value))}</${key}>`;
        })
        .join('\n');
      
      return `<item id="${index + 1}">\n${itemContent}\n</item>`;
    }),
    '</data>'
  ].join('\n');

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  saveAs(blob, `${filename}.xml`);
};

// 主导出函数
export const exportData = async (options: ExportOptions): Promise<void> => {
  const { format, filename, data } = options;

  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据');
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');

  switch (format) {
    case 'json':
      exportToJSON(data, safeFilename);
      break;
    
    case 'csv':
      exportToCSV(data, safeFilename);
      break;
    
    case 'xml':
      exportToXML(data, safeFilename);
      break;
    
    default:
      throw new Error(`不支持的导出格式: ${format}`);
  }
};

// 获取数据统计信息
export const getDataStats = (data: GeneratedData[]) => {
  if (!data || data.length === 0) {
    return {
      totalRecords: 0,
      totalFields: 0,
      fieldTypes: {},
      estimatedSize: 0
    };
  }

  const firstRecord = data[0];
  const fieldTypes: Record<string, number> = {};
  
  // 分析字段类型
  Object.entries(firstRecord).forEach(([key, value]) => {
    const type = typeof value;
    fieldTypes[type] = (fieldTypes[type] || 0) + 1;
  });

  // 估算数据大小（字节）
  const jsonString = JSON.stringify(data);
  const estimatedSize = new Blob([jsonString]).size;

  return {
    totalRecords: data.length,
    totalFields: Object.keys(firstRecord).length,
    fieldTypes,
    estimatedSize
  };
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 验证导出数据
export const validateExportData = (data: GeneratedData[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('数据必须是数组格式');
    return { valid: false, errors };
  }

  if (data.length === 0) {
    errors.push('数据不能为空');
    return { valid: false, errors };
  }

  // 检查数据结构一致性
  const firstRecordKeys = Object.keys(data[0]).sort();
  for (let i = 1; i < data.length; i++) {
    const currentKeys = Object.keys(data[i]).sort();
    if (JSON.stringify(firstRecordKeys) !== JSON.stringify(currentKeys)) {
      errors.push(`第 ${i + 1} 条记录的字段结构与第一条不一致`);
      break;
    }
  }

  return { valid: errors.length === 0, errors };
};