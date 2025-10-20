// Data types for mock data generation
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'name' | 'address' | 'uuid' | 'url' | 'image' | 'paragraph' | 'sentence' | 'word' | 'color' | 'company' | 'job' | 'price' | 'custom';

// Field configuration interface
export interface FieldConfig {
  id: string;
  name: string;
  type: DataType;
  required: boolean;
  options?: {
    min?: number;
    max?: number;
    format?: string;
    values?: string[];
    customValue?: string;
    length?: number;
    prefix?: string;
    suffix?: string;
  };
}

// Mock data configuration
export interface MockDataConfig {
  fields: FieldConfig[];
  count: number;
  format: 'json' | 'csv' | 'xml';
}

// Generated data structure
export interface GeneratedData {
  [key: string]: any;
}

// Export options
export interface ExportOptions {
  format: 'json' | 'csv' | 'xml';
  filename: string;
  data: GeneratedData[];
}