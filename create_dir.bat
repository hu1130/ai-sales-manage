@echo off
chcp 65001 >nul
:: 创建文件夹结构
md backend\config
md backend\controllers
md backend\routes
md frontend\public
md frontend\src\assets
md frontend\src\components
md frontend\src\views
md frontend\src\router

:: 后端空文件
type nul >backend\config\db.config.js
type nul >backend\controllers\aiController.js
type nul >backend\routes\ai.js
type nul >backend\server.js
type nul >backend\package.json

:: 前端空文件
type nul >frontend\public\index.html
type nul >frontend\src\views\Dashboard.vue
type nul >frontend\src\views\Leads.vue
type nul >frontend\src\views\Customers.vue
type nul >frontend\src\views\Quotes.vue
type nul >frontend\src\views\Contracts.vue
type nul >frontend\src\views\AiInsights.vue
type nul >frontend\src\router\index.js
type nul >frontend\src\App.vue
type nul >frontend\src\main.js
type nul >frontend\package.json
type nul >frontend\vue.config.js

:: 项目根目录文档
type nul >README.md

echo ✅ 全部目录&空白文件创建完毕！
pause