\# AI 销售管理系统



\## 项目结构

H:\\Projects\\ai-sales-manage

├── backend/

│ ├── server.js

│ ├── config/

│ │ └── db.config.js

│ ├── routes/

│ │ └── ai.js

│ ├── controllers/

│ │ └── aiController.js

│ └── package.json

└── frontend/

├── src/

│ ├── views/

│ │ ├── Dashboard.vue

│ │ ├── Leads.vue

│ │ ├── Customers.vue

│ │ ├── Quotes.vue

│ │ ├── Contracts.vue

│ │ └── AiInsights.vue

│ └── ...

└── package.json







\## 安装与运行



\### 后端



1\.  进入 `backend` 目录: `cd H:\\Projectsw\\ai-sales-manage\\backend`

2\.  安装依赖: `npm install`

3\.  配置数据库连接: 编辑 `config/db.config.js`

4\.  （可选）配置 DeepSeek API Key 环境变量。

5\.  启动服务: `npm start` (生产) 或 `npm run dev` (开发)



\### 前端



1\.  进入 `frontend` 目录: `cd H:\\Projectsw\\ai-sales-manage\\frontend`

2\.  安装依赖: `npm install`

3\.  启动开发服务器: `npm run serve`



\## 功能模块



\*   \*\*仪表盘 (Dashboard)\*\*: 展示关键指标和提醒。

\*   \*\*线索管理 (Leads)\*\*: 添加、分析、转换线索。

\*   \*\*客户管理 (Customers)\*\*: 管理客户信息、生命周期、生成AI建议。

\*   \*\*报价管理 (Quotes)\*\*: 创建、编辑、发送报价单。

\*   \*\*合同管理 (Contracts)\*\*: 创建、管理合同，标记回款。

\*   \*\*AI洞察 (AI Insights)\*\*: 展示AI分析结果、预警和策略建议。



\## 技术栈



\*   \*\*前端\*\*: Vue 3

\*   \*\*后端\*\*: Node.js, Express

\*   \*\*数据库\*\*: MySQL

\*   \*\*AI模型\*\*: DeepSeek (API集成示例在后端控制器中)

