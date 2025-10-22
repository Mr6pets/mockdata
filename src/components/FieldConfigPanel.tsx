import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Collapse,
  List,
  Empty,
  Typography,
  Checkbox,
  Dropdown,
  Modal,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined, UpOutlined, DownOutlined, AppstoreOutlined, CheckOutlined, CloseOutlined, HolderOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { FieldConfig, DataType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import templateApiService from '../services/templateApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

// 字段模板定义
// 定义模板接口
interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    name: string;
    type: DataType;
    required: boolean;
  }>;
  isCustom?: boolean;
  createdAt?: string;
}

// 内置模板
const defaultTemplates: FieldTemplate[] = [
  {
    id: 'user-info',
    name: '用户信息',
    description: '包含用户基本信息的字段组合',
    fields: [
      { name: 'id', type: 'uuid' as DataType, required: true },
      { name: 'name', type: 'name' as DataType, required: true },
      { name: 'email', type: 'email' as DataType, required: true },
      { name: 'phone', type: 'phone' as DataType, required: false },
      { name: 'address', type: 'address' as DataType, required: false },
    ]
  },
  {
    id: 'product-info',
    name: '商品信息',
    description: '电商商品相关字段',
    fields: [
      { name: 'productId', type: 'uuid' as DataType, required: true },
      { name: 'productName', type: 'string' as DataType, required: true },
      { name: 'price', type: 'price' as DataType, required: true },
      { name: 'description', type: 'paragraph' as DataType, required: false },
      { name: 'imageUrl', type: 'image' as DataType, required: false },
      { name: 'company', type: 'company' as DataType, required: false },
    ]
  },
  {
    id: 'article-info',
    name: '文章信息',
    description: '博客或新闻文章字段',
    fields: [
      { name: 'articleId', type: 'uuid' as DataType, required: true },
      { name: 'title', type: 'sentence' as DataType, required: true },
      { name: 'content', type: 'paragraph' as DataType, required: true },
      { name: 'author', type: 'name' as DataType, required: true },
      { name: 'publishDate', type: 'date' as DataType, required: true },
      { name: 'url', type: 'url' as DataType, required: false },
    ]
  },
  {
    id: 'employee-info',
    name: '员工信息',
    description: '企业员工管理字段',
    fields: [
      { name: 'employeeId', type: 'uuid' as DataType, required: true },
      { name: 'name', type: 'name' as DataType, required: true },
      { name: 'email', type: 'email' as DataType, required: true },
      { name: 'phone', type: 'phone' as DataType, required: false },
      { name: 'job', type: 'job' as DataType, required: true },
      { name: 'company', type: 'company' as DataType, required: true },
    ]
  }
];

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
  const [expandedFields, setExpandedFields] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<DataType | 'all'>('all');
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  
  // 自定义模板相关状态
  const [customTemplates, setCustomTemplates] = useState<FieldTemplate[]>([]);
  const [saveTemplateModalVisible, setSaveTemplateModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [allTemplates, setAllTemplates] = useState<FieldTemplate[]>(defaultTemplates);

  // 组件初始化时加载自定义模板
  useEffect(() => {
    loadCustomTemplates();
  }, []);

  // 从API加载自定义模板
  const loadCustomTemplates = async () => {
    try {
      const templates = await templateApiService.getTemplates();
      // 转换Template类型为FieldTemplate类型
      const fieldTemplates: FieldTemplate[] = templates.map(template => ({
        ...template,
        description: template.description || '',
        isCustom: true,
        fields: template.fields.map(field => ({
          name: field.name,
          type: field.type as DataType,
          required: field.required || false
        }))
      }));
      setCustomTemplates(fieldTemplates);
      setAllTemplates([...defaultTemplates, ...fieldTemplates]);
    } catch (error) {
      console.error('加载自定义模板失败:', error);
      message.error('加载自定义模板失败');
    }
  };

  // 保存自定义模板到API
  const saveCustomTemplates = async (templates: FieldTemplate[]) => {
    try {
      // 这个方法现在主要用于更新本地状态
      setCustomTemplates(templates);
      setAllTemplates([...defaultTemplates, ...templates]);
    } catch (error) {
      console.error('更新模板状态失败:', error);
    }
  };

  // 验证单个字段
  const validateField = (field: FieldConfig): string[] => {
    const errors: string[] = [];
    
    // 验证字段名称
    if (!field.name.trim()) {
      errors.push('字段名称不能为空');
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
      errors.push('字段名称只能包含字母、数字和下划线，且不能以数字开头');
    } else if (fields.filter(f => f.name === field.name).length > 1) {
      errors.push('字段名称不能重复');
    }

    // 验证字段选项
    if (field.options) {
      if (['string', 'paragraph', 'sentence', 'word'].includes(field.type)) {
        if (field.options.min && field.options.max && field.options.min > field.options.max) {
          errors.push('最小长度不能大于最大长度');
        }
      }
      if (['number', 'price'].includes(field.type)) {
        if (field.options.min && field.options.max && field.options.min > field.options.max) {
          errors.push('最小值不能大于最大值');
        }
      }
      if (field.type === 'custom' && (!field.options.values || field.options.values.length === 0)) {
        errors.push('自定义类型必须提供至少一个值');
      }
    }

    return errors;
  };

  // 验证所有字段
  const validateAllFields = () => {
    const newErrors: Record<string, string[]> = {};
    fields.forEach(field => {
      const errors = validateField(field);
      if (errors.length > 0) {
        newErrors[field.id] = errors;
      }
    });
    setFieldErrors(newErrors);
  };

  const addField = () => {
    const newField: FieldConfig = {
      id: uuidv4(),
      name: '',
      type: 'string',
      required: false,
    };
    const newFields = [...fields, newField];
    onFieldsChange(newFields);
    setExpandedFields([...expandedFields, newField.id]);
  };

  const removeField = (id: string) => {
    const newFields = fields.filter(field => field.id !== id);
    onFieldsChange(newFields);
    setExpandedFields(expandedFields.filter(fieldId => fieldId !== id));
    
    // 清除该字段的错误信息
    const newErrors = { ...fieldErrors };
    delete newErrors[id];
    setFieldErrors(newErrors);
  };

  const updateField = (id: string, updates: Partial<FieldConfig>) => {
    const newFields = fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    );
    onFieldsChange(newFields);
    
    // 重新验证所有字段
    setTimeout(() => validateAllFields(), 0);
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < fields.length - 1)
    ) {
      const newFields = [...fields];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [newFields[currentIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[currentIndex]];
      onFieldsChange(newFields);
    }
  };

  const addFieldsFromTemplate = (template: FieldTemplate) => {
    const newFields = template.fields.map(templateField => ({
      id: uuidv4(),
      name: templateField.name,
      type: templateField.type,
      required: templateField.required,
    }));
    
    const updatedFields = [...fields, ...newFields];
    onFieldsChange(updatedFields);
    
    // 展开新添加的字段
    const newFieldIds = newFields.map(field => field.id);
    setExpandedFields([...expandedFields, ...newFieldIds]);
    
    // 隐藏模板选择
    setShowTemplates(false);
  };

  // 保存当前字段配置为自定义模板
  const saveCurrentFieldsAsTemplate = async () => {
    if (!templateName.trim()) {
      Modal.error({ title: '错误', content: '请输入模板名称' });
      return;
    }

    if (fields.length === 0) {
      Modal.error({ title: '错误', content: '当前没有字段可以保存为模板' });
      return;
    }

    const newTemplate: FieldTemplate = {
      id: uuidv4(),
      name: templateName.trim(),
      description: templateDescription.trim() || '自定义模板',
      fields: fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required
      })),
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    try {
      // 使用API保存模板
      await templateApiService.createTemplate(newTemplate);
      
      // 更新本地状态
      const updatedCustomTemplates = [...customTemplates, newTemplate];
      setCustomTemplates(updatedCustomTemplates);
      setAllTemplates([...defaultTemplates, ...updatedCustomTemplates]);

      // 重置表单
      setTemplateName('');
      setTemplateDescription('');
      setSaveTemplateModalVisible(false);

      message.success('模板保存成功！');
    } catch (error) {
      console.error('保存模板失败:', error);
      message.error('保存模板失败，请重试');
    }
  };

  // 删除自定义模板
  const deleteCustomTemplate = async (templateId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个自定义模板吗？此操作不可恢复。',
      onOk: async () => {
        try {
          // 使用API删除模板
          await templateApiService.deleteTemplate(templateId);
          
          // 更新本地状态
          const updatedCustomTemplates = customTemplates.filter(t => t.id !== templateId);
          setCustomTemplates(updatedCustomTemplates);
          setAllTemplates([...defaultTemplates, ...updatedCustomTemplates]);
          
          message.success('模板删除成功！');
        } catch (error) {
          console.error('删除模板失败:', error);
          message.error('删除模板失败，请重试');
        }
      }
    });
  };

  // 批量操作函数
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFields(filteredFields.map(field => field.id));
    } else {
      setSelectedFields([]);
    }
  };

  const handleSelectField = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    }
  };

  const batchDeleteFields = () => {
    Modal.confirm({
      title: '批量删除字段',
      content: `确定要删除选中的 ${selectedFields.length} 个字段吗？`,
      onOk: () => {
        const newFields = fields.filter(field => !selectedFields.includes(field.id));
        onFieldsChange(newFields);
        setSelectedFields([]);
        setExpandedFields(expandedFields.filter(id => !selectedFields.includes(id)));
        
        // 清除被删除字段的错误信息
        const newErrors = { ...fieldErrors };
        selectedFields.forEach(id => delete newErrors[id]);
        setFieldErrors(newErrors);
      }
    });
  };

  const batchSetRequired = (required: boolean) => {
    const newFields = fields.map(field => 
      selectedFields.includes(field.id) ? { ...field, required } : field
    );
    onFieldsChange(newFields);
    setSelectedFields([]);
    
    // 重新验证所有字段
    setTimeout(() => validateAllFields(), 0);
  };

  const batchSetType = (type: DataType) => {
    const newFields = fields.map(field => 
      selectedFields.includes(field.id) ? { ...field, type, options: undefined } : field
    );
    onFieldsChange(newFields);
    setSelectedFields([]);
    
    // 重新验证所有字段
    setTimeout(() => validateAllFields(), 0);
  };

  const getBatchOperationMenuItems = () => [
    {
      key: 'setRequired',
      label: '设为必填',
      icon: <CheckOutlined />,
      onClick: () => batchSetRequired(true)
    },
    {
      key: 'setOptional',
      label: '设为可选',
      icon: <CloseOutlined />,
      onClick: () => batchSetRequired(false)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'batchType',
      label: '批量设置类型',
      children: dataTypeOptions.map(option => ({
        key: `type-${option.value}`,
        label: option.label,
        onClick: () => batchSetType(option.value)
      }))
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: batchDeleteFields
    }
  ];

  // 拖拽排序处理函数
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    // 重新排序字段数组
    const newFields = Array.from(fields);
    const [reorderedField] = newFields.splice(sourceIndex, 1);
    newFields.splice(destinationIndex, 0, reorderedField);

    onFieldsChange(newFields);

    // 清除选中状态
    setSelectedFields([]);
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
              <Text>最小长度：</Text>
              <InputNumber
                min={1}
                value={field.options?.min}
                onChange={(value) => updateField(field.id, { 
                  options: { ...field.options, min: value || undefined } 
                })}
                size="small"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Text>最大长度：</Text>
              <InputNumber
                min={1}
                value={field.options?.max}
                onChange={(value) => updateField(field.id, { 
                  options: { ...field.options, max: value || undefined } 
                })}
                size="small"
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        );
      case 'number':
      case 'price':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <Text>最小值：</Text>
              <InputNumber
                value={field.options?.min}
                onChange={(value) => updateField(field.id, { 
                  options: { ...field.options, min: value || undefined } 
                })}
                size="small"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Text>最大值：</Text>
              <InputNumber
                value={field.options?.max}
                onChange={(value) => updateField(field.id, { 
                  options: { ...field.options, max: value || undefined } 
                })}
                size="small"
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        );
      case 'custom':
        return (
          <div>
            <Text>自定义值（每行一个）：</Text>
            <TextArea
              rows={3}
              value={field.options?.values?.join('\n') || ''}
              onChange={(e) => updateField(field.id, { 
                options: { 
                  ...field.options, 
                  values: e.target.value.split('\n').filter(v => v.trim()) 
                } 
              })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // 过滤字段
  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         dataTypeOptions.find(opt => opt.value === field.type)?.label.includes(searchText);
    const matchesType = filterType === 'all' || field.type === filterType;
    const matchesRequired = !showRequiredOnly || field.required;
    
    return matchesSearch && matchesType && matchesRequired;
  });

  return (
    <>
    <Card title="字段配置" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 数据条数设置 */}
        <div>
          <Text>生成数据条数：</Text>
          <InputNumber
            min={1}
            max={10000}
            value={dataCount}
            onChange={(value) => onDataCountChange(value || 1)}
            style={{ marginLeft: 8 }}
          />
        </div>

        {/* 字段列表区域 */}
        <div>
          {/* 搜索和过滤 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Input.Search
                placeholder="搜索字段名称或类型"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="筛选数据类型"
                value={filterType}
                onChange={setFilterType}
                allowClear
                style={{ minWidth: 100 }}
              >
                <Option value="all">全部类型</Option>
                {dataTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Switch
                checkedChildren="仅必填"
                unCheckedChildren="全部"
                checked={showRequiredOnly}
                onChange={setShowRequiredOnly}
              />
            </Col>
            <Col span={4}>
              <Text type="secondary">
                共 {filteredFields.length} 个字段
              </Text>
            </Col>
          </Row>

          {/* 添加字段和模板按钮 */}
          <Row gutter={8} style={{ marginBottom: 16 }}>
            <Col>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={addField}
              >
                添加字段
              </Button>
            </Col>
            <Col>
              <Button
                size="small"
                icon={<AppstoreOutlined />}
                onClick={() => setShowTemplates(!showTemplates)}
              >
                字段模板
              </Button>
            </Col>
            {fields.length > 0 && (
              <Col>
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={() => setSaveTemplateModalVisible(true)}
                >
                  保存为模板
                </Button>
              </Col>
            )}
            {filteredFields.length > 0 && (
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <Space>
                  <Checkbox
                    indeterminate={selectedFields.length > 0 && selectedFields.length < filteredFields.length}
                    checked={selectedFields.length === filteredFields.length && filteredFields.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    全选
                  </Checkbox>
                  {selectedFields.length > 0 && (
                    <Dropdown
                      menu={{ items: getBatchOperationMenuItems() }}
                      placement="bottomRight"
                    >
                      <Button size="small">
                        批量操作 ({selectedFields.length}) <DownOutlined />
                      </Button>
                    </Dropdown>
                  )}
                </Space>
              </Col>
            )}
          </Row>

          {/* 字段模板选择 */}
          {showTemplates && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>选择字段模板：</Text>
                {customTemplates.length > 0 && (
                  <Text type="secondary">
                    内置模板 {defaultTemplates.length} 个，自定义模板 {customTemplates.length} 个
                  </Text>
                )}
              </div>
              
              {/* 内置模板 */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>内置模板</Text>
                <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                  {defaultTemplates.map((template) => (
                    <Col span={12} key={template.id}>
                      <Card
                        size="small"
                        hoverable
                        onClick={() => addFieldsFromTemplate(template)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Meta
                          title={template.name}
                          description={
                            <div>
                              <div style={{ marginBottom: 8 }}>
                                {template.description}
                              </div>
                              <div>
                                {template.fields.map((field, idx) => (
                                  <Tag key={idx}>
                                    {field.name}
                                    {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* 自定义模板 */}
              {customTemplates.length > 0 && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>自定义模板</Text>
                  <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                    {customTemplates.map((template) => (
                      <Col span={12} key={template.id}>
                        <Card
                          size="small"
                          hoverable
                          onClick={() => addFieldsFromTemplate(template)}
                          style={{ cursor: 'pointer' }}
                          actions={[
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              danger
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomTemplate(template.id);
                              }}
                            >
                              删除
                            </Button>
                          ]}
                        >
                          <Card.Meta
                            title={
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{template.name}</span>
                                <Tag color="green">自定义</Tag>
                              </div>
                            }
                            description={
                              <div>
                                <div style={{ marginBottom: 8 }}>
                                  {template.description}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <Text type="secondary" style={{ fontSize: '11px' }}>
                                    创建时间：{template.createdAt}
                                  </Text>
                                </div>
                                <div>
                                  {template.fields.map((field, idx) => (
                                    <Tag key={idx}>
                                      {field.name}
                                      {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card>
          )}

          {/* 字段列表 */}
          {filteredFields.length === 0 ? (
            <Empty
              description={fields.length === 0 ? "暂无字段配置" : "没有匹配的字段"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '8px',
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <Row style={{ width: '100%' }} align="middle">
                              <Col flex="none" style={{ marginRight: 8 }}>
                                <Checkbox
                                  checked={selectedFields.includes(field.id)}
                                  onChange={(e) => handleSelectField(field.id, e.target.checked)}
                                />
                              </Col>
                              <Col flex="none" style={{ marginRight: 8 }}>
                                <div {...provided.dragHandleProps}>
                                  <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />
                                </div>
                              </Col>
                              <Col flex="auto">
                      <Collapse
                        size="small"
                        style={{ width: '100%' }}
                        activeKey={expandedFields.includes(field.id) ? [field.id] : []}
                        onChange={(keys) => {
                          if (keys.includes(field.id)) {
                            setExpandedFields([...expandedFields, field.id]);
                          } else {
                            setExpandedFields(expandedFields.filter(id => id !== field.id));
                          }
                        }}
                      >
                    <Panel
                      key={field.id}
                      header={
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          color: fieldErrors[field.id] ? '#ff4d4f' : undefined
                        }}>
                          <span>
                            {field.name || '未命名字段'}
                            {field.required && <Tag color="red" style={{ marginLeft: 8 }}>必填</Tag>}
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                              {dataTypeOptions.find(opt => opt.value === field.type)?.label}
                            </Tag>
                            {fieldErrors[field.id] && (
                              <Tooltip title={fieldErrors[field.id].join('; ')}>
                                <Tag color="error" style={{ marginLeft: 8 }}>
                                  错误
                                </Tag>
                              </Tooltip>
                            )}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeField(field.id)}
                          />
                        </div>
                      }
                    >
                      {/* 错误提示 */}
                      {fieldErrors[field.id] && (
                        <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px' }}>
                          <Text type="danger">
                            <strong>错误：</strong>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {fieldErrors[field.id].map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </Text>
                        </div>
                      )}

                      <Row gutter={16}>
                        <Col span={8}>
                          <Text>字段名称：</Text>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            size="small"
                            status={fieldErrors[field.id]?.some(error => error.includes('字段名称')) ? 'error' : undefined}
                          />
                        </Col>
                        <Col span={8}>
                          <Text>数据类型：</Text>
                          <Select
                            value={field.type}
                            onChange={(value) => updateField(field.id, { type: value })}
                            options={dataTypeOptions}
                            style={{ width: '100%' }}
                            size="small"
                          />
                        </Col>
                        <Col span={8}>
                          <Text>是否必填：</Text>
                          <Switch
                            checked={field.required}
                            onChange={(checked) => updateField(field.id, { required: checked })}
                            size="small"
                          />
                        </Col>
                      </Row>

                      <Divider style={{ margin: '12px 0' }} />

                      {renderFieldOptions(field)}
                    </Panel>
                   </Collapse>
                               </Col>
                             </Row>
                           </div>
                         )}
                       </Draggable>
                     ))}
                     {provided.placeholder}
                   </div>
                 )}
               </Droppable>
             </DragDropContext>
           )}
         </div>
      </Space>
    </Card>
    
    {/* 保存模板对话框 */}
    <Modal
      title="保存为自定义模板"
      open={saveTemplateModalVisible}
      onOk={() => saveCurrentFieldsAsTemplate()}
      onCancel={() => {
        setSaveTemplateModalVisible(false);
        setTemplateName('');
        setTemplateDescription('');
      }}
      okText="保存"
      cancelText="取消"
      okButtonProps={{ disabled: !templateName.trim() }}
    >
      <Form layout="vertical">
        <Form.Item
          label="模板名称"
          required
          validateStatus={!templateName.trim() ? 'error' : ''}
          help={!templateName.trim() ? '请输入模板名称' : ''}
        >
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="请输入模板名称"
            maxLength={50}
          />
        </Form.Item>
        <Form.Item label="模板描述">
          <TextArea
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            placeholder="请输入模板描述（可选）"
            rows={3}
            maxLength={200}
          />
        </Form.Item>
        <Form.Item label="将要保存的字段">
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: '6px', padding: '8px' }}>
            {fields.map((field, index) => (
              <div key={field.id} style={{ marginBottom: '4px' }}>
                <Tag color={field.required ? 'red' : 'blue'}>
                  {index + 1}. {field.name || '未命名字段'} 
                  ({dataTypeOptions.find(opt => opt.value === field.type)?.label})
                  {field.required && ' *'}
                </Tag>
              </div>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
    </>
  );
};

export default FieldConfigPanel;