import { FieldConfig, MockDataConfig, GeneratedData, DataType } from '../types';
import dayjs from 'dayjs';

// 简单的随机数据生成器（替代faker.js）
class MockDataGenerator {
  private static instance: MockDataGenerator;
  
  private constructor() {}
  
  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  // 生成随机字符串
  generateString(min: number = 5, max: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成随机数字
  generateNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 生成随机布尔值
  generateBoolean(): boolean {
    return Math.random() > 0.5;
  }

  // 生成随机日期
  generateDate(format: string = 'YYYY-MM-DD'): string {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return dayjs(randomDate).format(format);
  }

  // 生成随机邮箱
  generateEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', '163.com', 'qq.com', 'hotmail.com'];
    const username = this.generateString(5, 10).toLowerCase();
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${domain}`;
  }

  // 生成随机手机号
  generatePhone(): string {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  }

  // 生成随机姓名
  generateName(): string {
    const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗'];
    const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return firstName + lastName;
  }

  // 生成随机地址
  generateAddress(): string {
    const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '山东省', '河南省', '四川省', '湖北省', '湖南省'];
    const cities = ['海淀区', '朝阳区', '西城区', '东城区', '丰台区', '石景山区', '门头沟区', '房山区', '通州区', '顺义区'];
    const streets = ['中关村大街', '王府井大街', '长安街', '建国门外大街', '复兴门外大街', '西单北大街', '东单北大街', '前门大街'];
    
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${province}${city}${street}${number}号`;
  }

  // 生成UUID
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 生成随机URL
  generateURL(): string {
    const protocols = ['http', 'https'];
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'mock.io'];
    const paths = ['', '/api', '/users', '/products', '/data', '/info'];
    
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    
    return `${protocol}://${domain}${path}`;
  }

  // 生成随机图片URL
  generateImage(): string {
    const width = Math.floor(Math.random() * 400) + 200;
    const height = Math.floor(Math.random() * 400) + 200;
    return `https://picsum.photos/${width}/${height}`;
  }

  // 生成随机段落
  generateParagraph(): string {
    const sentences = [
      '这是一个示例段落。',
      '用于演示数据生成功能。',
      '可以包含多个句子。',
      '内容是随机生成的。',
      '适用于各种测试场景。',
      '帮助开发者快速构建原型。',
      '提供真实的数据体验。',
      '支持中文内容生成。'
    ];
    
    const numSentences = Math.floor(Math.random() * 4) + 2;
    const selectedSentences = [];
    
    for (let i = 0; i < numSentences; i++) {
      const sentence = sentences[Math.floor(Math.random() * sentences.length)];
      selectedSentences.push(sentence);
    }
    
    return selectedSentences.join('');
  }

  // 生成随机句子
  generateSentence(): string {
    const sentences = [
      '这是一个测试句子。',
      '用于数据模拟生成。',
      '支持中文内容。',
      '可以自定义长度。',
      '适合各种应用场景。',
      '提供高质量的模拟数据。'
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  // 生成随机单词
  generateWord(): string {
    const words = ['测试', '数据', '模拟', '生成', '随机', '内容', '示例', '演示', '功能', '应用', '系统', '平台', '工具', '服务', '接口', '组件'];
    return words[Math.floor(Math.random() * words.length)];
  }

  // 生成随机颜色
  generateColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 生成随机公司名
  generateCompany(): string {
    const prefixes = ['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '西安', '南京', '苏州'];
    const types = ['科技', '网络', '信息', '软件', '数据', '智能', '创新', '数字'];
    const suffixes = ['有限公司', '股份有限公司', '科技有限公司', '网络科技有限公司'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}${type}${suffix}`;
  }

  // 生成随机职位
  generateJob(): string {
    const jobs = ['软件工程师', '产品经理', '设计师', '数据分析师', '项目经理', '运营专员', '市场专员', '人事专员', '财务专员', '销售经理', '技术总监', '架构师', '测试工程师', '运维工程师', '前端工程师', '后端工程师'];
    return jobs[Math.floor(Math.random() * jobs.length)];
  }

  // 生成随机价格
  generatePrice(min: number = 10, max: number = 1000): string {
    const price = (Math.random() * (max - min) + min).toFixed(2);
    return `¥${price}`;
  }

  // 根据字段配置生成数据
  generateFieldValue(field: FieldConfig): any {
    const { type, options = {} } = field;

    switch (type) {
      case 'string':
        return this.generateString(options.min, options.max);
      
      case 'number':
        return this.generateNumber(options.min, options.max);
      
      case 'boolean':
        return this.generateBoolean();
      
      case 'date':
        return this.generateDate(options.format);
      
      case 'email':
        return this.generateEmail();
      
      case 'phone':
        return this.generatePhone();
      
      case 'name':
        return this.generateName();
      
      case 'address':
        return this.generateAddress();
      
      case 'uuid':
        return this.generateUUID();
      
      case 'url':
        return this.generateURL();
      
      case 'image':
        return this.generateImage();
      
      case 'paragraph':
        return this.generateParagraph();
      
      case 'sentence':
        return this.generateSentence();
      
      case 'word':
        return this.generateWord();
      
      case 'color':
        return this.generateColor();
      
      case 'company':
        return this.generateCompany();
      
      case 'job':
        return this.generateJob();
      
      case 'price':
        return this.generatePrice(options.min, options.max);
      
      case 'custom':
        if (options.values && options.values.length > 0) {
          return options.values[Math.floor(Math.random() * options.values.length)];
        }
        return 'Custom Value';
      
      default:
        return this.generateString();
    }
  }
}

// 导出数据生成函数
export const generateMockData = (config: MockDataConfig): GeneratedData[] => {
  const generator = MockDataGenerator.getInstance();
  const { fields, count } = config;
  const result: GeneratedData[] = [];

  for (let i = 0; i < count; i++) {
    const record: GeneratedData = {};
    
    fields.forEach(field => {
      if (field.required || Math.random() > 0.1) { // 90%概率生成非必填字段
        record[field.name] = generator.generateFieldValue(field);
      } else {
        record[field.name] = null;
      }
    });
    
    result.push(record);
  }

  return result;
};