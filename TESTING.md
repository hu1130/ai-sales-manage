# Playwright 自动化测试说明

## 📦 项目测试结构

```
ai-sales-manage/
├── test/
│   ├── helpers.js          # 测试辅助函数
│   ├── login.spec.js       # 登录流程测试
│   ├── dashboard.spec.js   # 仪表盘测试
│   ├── leads.spec.js       # 线索管理测试
│   ├── customers.spec.js   # 客户管理测试
│   ├── quotes.spec.js      # 报价管理测试
│   └── contracts.spec.js   # 合同管理测试
├── playwright.config.js    # Playwright 配置文件
└── package.json            # 项目根级 package.json
```

## 🚀 一键运行测试

### 前置准备

1. **确保已安装 Node.js**（建议 v16 或更高版本）

2. **安装 Playwright 依赖和浏览器**：
   ```bash
   npm install
   npm run install:playwright
   ```

3. **分别安装后端和前端依赖**（如果还没有安装）：
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### 运行测试

#### 方式一：一键完整测试（推荐）

```bash
npm test
```

#### 方式二：使用 UI 模式运行测试

```bash
npm run test:ui
```

#### 方式三：查看测试报告

```bash
npm run test:report
```

## 📋 测试覆盖范围

| 测试模块 | 测试文件 | 覆盖功能 |
|---------|---------|---------|
| 登录流程 | [login.spec.js](file:///h:/Projects/ai-sales-manage/test/login.spec.js) | 登录页面显示、成功登录、失败登录 |
| 仪表盘 | [dashboard.spec.js](file:///h:/Projects/ai-sales-manage/test/dashboard.spec.js) | 仪表盘显示、统计卡片、AI洞察 |
| 线索管理 | [leads.spec.js](file:///h:/Projects/ai-sales-manage/test/leads.spec.js) | 线索列表、新增线索 |
| 客户管理 | [customers.spec.js](file:///h:/Projects/ai-sales-manage/test/customers.spec.js) | 客户列表、新增客户 |
| 报价管理 | [quotes.spec.js](file:///h:/Projects/ai-sales-manage/test/quotes.spec.js) | 报价列表、创建报价 |
| 合同管理 | [contracts.spec.js](file:///h:/Projects/ai-sales-manage/test/contracts.spec.js) | 合同列表、创建合同 |

## 📝 配置说明

Playwright 配置文件位于 [playwright.config.js](file:///h:/Projects/ai-sales-manage/playwright.config.js)，包含：
- 自动启动前后端服务
- 仅在 Chromium 浏览器中运行（最小可运行矩阵）
- 失败时自动截图
- 失败时记录追踪信息

## ⚠️ 注意事项

1. **端口占用**：确保 3001（后端）和 8080（前端）端口未被占用
2. **首次运行**：首次运行需要下载浏览器，时间较长，请耐心等待
3. **并行测试**：测试会并行运行，若需要可修改配置中的 `workers`
4. **默认账号**：测试使用 `admin` / `admin123` 账号

## 🔍 测试报告

测试完成后，报告将自动生成在 `playwright-report` 目录下。
