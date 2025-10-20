import React, { useState } from 'react';
import { Table, Empty, Tabs, Typography, Space, Tag, Button } from 'antd';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { GeneratedData } from '../types';

const { TabPane } = Tabs;
const { Text, Paragraph } = Typography;

interface DataPreviewProps {
  data: GeneratedData[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<string>('table');

  if (!data || data.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无数据"
        style={{ padding: '40px 0' }}
      >
        <Text type="secondary">请配置字段并生成数据</Text>
      </Empty>
    );
  }

  // 生成表格列配置
  const columns = Object.keys(data[0]).map(key => ({
    title: key,
    dataIndex: key,
    key,
    ellipsis: true,
    render: (value: any) => {
      if (typeof value === 'boolean') {
        return <Tag color={value ? 'green' : 'red'}>{String(value)}</Tag>;
      }
      if (typeof value === 'number') {
        return <Text code>{value}</Text>;
      }
      if (typeof value === 'string' && value.length > 50) {
        return (
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: '更多' }}
            style={{ margin: 0 }}
          >
            {value}
          </Paragraph>
        );
      }
      return String(value);
    }
  }));

  // 复制JSON数据
  const copyJsonData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
  };

  // 表格视图
  const TableView = () => (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Text strong>共 {data.length} 条数据</Text>
        <Text type="secondary">|</Text>
        <Text type="secondary">{Object.keys(data[0]).length} 个字段</Text>
        <Button
          type="link"
          icon={<CopyOutlined />}
          onClick={copyJsonData}
          size="small"
        >
          复制JSON
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data.map((item, index) => ({ ...item, key: index }))}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </div>
  );

  // JSON视图
  const JsonView = () => (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<CopyOutlined />}
          onClick={copyJsonData}
          size="small"
        >
          复制全部
        </Button>
      </Space>
      <div className="generated-data-preview">
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );

  // 统计视图
  const StatsView = () => {
    const stats = {
      totalRecords: data.length,
      totalFields: Object.keys(data[0]).length,
      fieldTypes: {} as Record<string, number>,
      sampleData: data.slice(0, 3)
    };

    // 分析字段类型
    Object.keys(data[0]).forEach(key => {
      const sampleValue = data[0][key];
      const type = typeof sampleValue;
      stats.fieldTypes[type] = (stats.fieldTypes[type] || 0) + 1;
    });

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>数据统计</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              <Tag color="blue">总记录数: {stats.totalRecords}</Tag>
              <Tag color="green">字段数: {stats.totalFields}</Tag>
              {Object.entries(stats.fieldTypes).map(([type, count]) => (
                <Tag key={type} color="orange">
                  {type}: {count}
                </Tag>
              ))}
            </Space>
          </div>
        </div>

        <div>
          <Text strong>数据样例</Text>
          <div className="generated-data-preview" style={{ marginTop: 8 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(stats.sampleData, null, 2)}
            </pre>
          </div>
        </div>
      </Space>
    );
  };

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <TabPane 
        tab={
          <span>
            <EyeOutlined />
            表格视图
          </span>
        } 
        key="table"
      >
        <TableView />
      </TabPane>
      <TabPane 
        tab={
          <span>
            <CopyOutlined />
            JSON视图
          </span>
        } 
        key="json"
      >
        <JsonView />
      </TabPane>
      <TabPane 
        tab={
          <span>
            <EyeOutlined />
            统计信息
          </span>
        } 
        key="stats"
      >
        <StatsView />
      </TabPane>
    </Tabs>
  );
};

export default DataPreview;