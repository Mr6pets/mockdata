import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Card, 
  InputNumber,
  Divider,
  Row,
  Col,
  Tag,
  Tooltip
} from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { FieldConfig, DataType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;
const { TextArea } = Input;

interface FieldConfigPanelProps {
  fields: FieldConfig[];
  dataCount: number;
  onFieldsChange: (fields: FieldConfig[]) => void;
  onDataCountChange: (count: number) => void;
}

const dataTypeOptions: { value: DataType; label: string; description: string }[] = [
  { value: 'string', label: '字符串', description: '随机字符串' },
  { value: 'number', label: '数字', description: '随机数字' },
  { value: 'boolean', label: '布尔值', description: 'true/false' },
  { value: 'date', label: '日期', description: '随机日期' },
  { value: 'email', label: '邮箱', description: '随机邮箱地址' },
  { value: 'phone', label: '手机号', description: '随机手机号码' },
  { value: 'name', label: '姓名', description: '随机人名' },
  { value: 'address', label: '地址', description: '随机地址' },
  { value: 'uuid', label: 'UUID', description: '唯一标识符' },
  { value: 'url', label: 'URL', description: '随机网址' },
  { value: 'image', label: '图片', description: '随机图片URL' },
  { value: 'paragraph', label: '段落', description: '随机段落文本' },
  { value: 'sentence', label: '句子', description: '随机句子' },
  { value: 'word', label: '单词', description: '随机单词' },
  { value: 'color', label: '颜色', description: '随机颜色值' },
  { value: 'company', label: '公司', description: '随机公司名' },
  { value: 'job', label: '职位', description: '随机职位名称' },
  { value: 'price', label: '价格', description: '随机价格' },
  { value: 'custom', label: '自定义', description: '自定义值' },
];

const FieldConfigPanel: React.FC<FieldConfigPanelProps> = ({
  fields,
  dataCount,
  onFieldsChange,
  onDataCountChange
}) => {
  const [form] = Form.useForm();

  const addField = () => {
    const newField: FieldConfig = {
      id: uuidv4(),
      name: `field_${fields.length + 1}`,
      type: 'string',
      required: true,
      options: {}
    };
    onFieldsChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldConfig>) => {
    onFieldsChange(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const renderFieldOptions = (field: FieldConfig) => {
    switch (field.type) {
      case 'string':
      case 'paragraph':
      case 'sentence':
      case 'word':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="最小长度">
                <InputNumber
                  min={1}
                  value={field.options?.min || 1}
                  onChange={(value) => updateField(field.id, {
                    options: { ...field.options, min: value || 1 }
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大长度">
                <InputNumber
                  min={1}
                  value={field.options?.max || 10}
                  onChange={(value) => updateField(field.id, {
                    options: { ...field.options, max: value || 10 }
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      
      case 'number':
      case 'price':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="最小值">
                <InputNumber
                  value={field.options?.min || 0}
                  onChange={(value) => updateField(field.id, {
                    options: { ...field.options, min: value || 0 }
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大值">
                <InputNumber
                  value={field.options?.max || 100}
                  onChange={(value) => updateField(field.id, {
                    options: { ...field.options, max: value || 100 }
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      
      case 'date':
        return (
          <Form.Item label="日期格式">
            <Select
              value={field.options?.format || 'YYYY-MM-DD'}
              onChange={(value) => updateField(field.id, {
                options: { ...field.options, format: value }
              })}
            >
              <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
              <Option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</Option>
              <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
              <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
            </Select>
          </Form.Item>
        );
      
      case 'custom':
        return (
          <Form.Item label="自定义值列表">
            <TextArea
              rows={3}
              placeholder="每行一个值，系统将随机选择"
              value={field.options?.values?.join('\n') || ''}
              onChange={(e) => updateField(field.id, {
                options: { 
                  ...field.options, 
                  values: e.target.value.split('\n').filter(v => v.trim()) 
                }
              })}
            />
          </Form.Item>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {/* 数据数量配置 */}
      <Form.Item label="生成数据条数">
        <InputNumber
          min={1}
          max={10000}
          value={dataCount}
          onChange={(value) => onDataCountChange(value || 10)}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Divider>字段配置</Divider>

      {/* 字段列表 */}
      <Space direction="vertical" style={{ width: '100%' }}>
        {fields.map((field, index) => (
          <Card
            key={field.id}
            size="small"
            className="field-config-item"
            title={
              <Space>
                <SettingOutlined />
                <span>字段 {index + 1}</span>
                <Tag color="blue">{dataTypeOptions.find(opt => opt.value === field.type)?.label}</Tag>
              </Space>
            }
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeField(field.id)}
              />
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="字段名称">
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    placeholder="请输入字段名称"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="数据类型">
                  <Select
                    value={field.type}
                    onChange={(value) => updateField(field.id, { type: value, options: {} })}
                  >
                    {dataTypeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Tooltip title={option.description}>
                          {option.label}
                        </Tooltip>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="必填字段">
                  <Switch
                    checked={field.required}
                    onChange={(checked) => updateField(field.id, { required: checked })}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 字段特定选项 */}
            {renderFieldOptions(field)}
          </Card>
        ))}
      </Space>

      {/* 添加字段按钮 */}
      <Button
        type="dashed"
        onClick={addField}
        icon={<PlusOutlined />}
        style={{ width: '100%', marginTop: '16px' }}
      >
        添加字段
      </Button>
    </div>
  );
};

export default FieldConfigPanel;