/**
 * 核心类型定义字典 (Type Definitions)
 * 职责：严格约束画板中所有组件的数据结构，杜绝运行时的 undefined 报错
 */

// 1. 所有组件共用的基础物理属性
export interface BaseComponent {
  id: string;
  type: string;
  label?: string;
  width?: number;
  marginTop?: number;
  marginBottom?: number;
  hidden?: boolean;
}

// 2. 表单与基础UI组件专属属性 (继承基础属性)
export interface FormComponent extends BaseComponent {
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  readonly?: boolean;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  options?: Array<{ label: string; value: string }>; // 针对下拉、单选、多选框
  max?: number;
  value?: number;
  buttonText?: string;
  text?: string;
  color?: string;
  content?: string;
  fontSize?: number;
  url?: string;
  borderStyle?: string;
}

// 3. ECharts 可视化图表专属属性
export interface EchartsComponent extends BaseComponent {
  type: 'echarts';
  height?: number;
  options?: Record<string, any>; // 图表底层 JSON 配置
}

// 4. 复杂嵌套布局容器专属属性
export interface LayoutComponent extends BaseComponent {
  type: 'card' | 'grid' | 'tabs';
  children?: ComponentSchema[]; // 递归子节点
  gutter?: number; // 栅格间距
  cols?: Array<{ span: number; children: ComponentSchema[] }>; // 栅格列
  activeTab?: string;
  panes?: Array<{ label: string; name: string; children: ComponentSchema[] }>; // 标签页
}

// 🚀 核心暴露：联合类型（代表画板上的任意合法组件）
export type ComponentSchema = FormComponent | EchartsComponent | LayoutComponent;