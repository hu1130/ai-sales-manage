<template>
  <div id="app">
    <!-- 未登录：仅显示路由内容（Login 页面） -->
    <template v-if="!isAuthenticated">
      <router-view />
    </template>

    <!-- 已登录：侧边栏 + 主内容区 -->
    <template v-else>
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="logo" @click="toggleSidebar">
            <div class="logo-icon">🤖</div>
            <span class="logo-text">AI Sales Pro</span>
          </div>
          <button class="collapse-btn" @click="toggleSidebar">
            {{ sidebarCollapsed ? '→' : '←' }}
          </button>
        </div>
        <ul class="nav-menu">
          <!-- 递归渲染菜单 -->
          <menu-item 
            v-for="menu in userMenus" 
            :key="menu.id" 
            :menu="menu" 
            :depth="0"
            :expanded-menus="expandedMenus"
            @toggle="handleMenuToggle"
          />
        </ul>
      </div>
      <div class="main-content" :class="{ 'sidebar-expanded': !sidebarCollapsed, 'sidebar-collapsed-layout': sidebarCollapsed }">
        <header class="app-header">
          <div class="header-left">
            <h1>{{ getCurrentPageTitle }}</h1>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="avatar">👤</div>
              <span>{{ currentUser ? currentUser.name : '管理员' }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout">退出</button>
          </div>
        </header>
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import MenuItem from './components/MenuItem.vue';

export default {
  name: 'App',
  components: {
    MenuItem
  },
  data() {
    return {
      sidebarCollapsed: false,
      expandedMenus: []
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    currentUser() {
      return this.$store.getters.currentUser;
    },
userMenus() {
  const menus = this.$store.getters.userMenus;
  return this.buildMenuTree(menus);
},


    getCurrentPageTitle() {
      const routeMap = {
        '/dashboard': '仪表盘',
        '/leads': '线索管理',
        '/customers': '客户管理',
        '/quotes': '报价管理',
        '/contracts': '合同管理',
        '/ai-insights': 'AI洞察',
        '/ai-analysis': '智能分析',
        '/leads/add': '添加线索',
        '/customers/add': '添加客户',
        '/quotes/add': '创建报价',
        '/contracts/add': '创建合同',
        '/reports': '报表中心'
      };
      return routeMap[this.$route.path] || 'AI销售管理系统';
    }
  },
  async mounted() {
    // 如果用户已登录，则强制刷新菜单
    if (this.isAuthenticated) {
      try {
        // 先清除旧的菜单数据，避免 localStorage 残留旧数据
        localStorage.removeItem('menus');
        // 重新获取最新菜单
        await this.$store.dispatch('fetchMenus');
        this.expandParentMenus();
      } catch (error) {
        console.error('获取菜单失败:', error);
      }
    }
  },
  
  // 监听登录状态变化，登录后立即刷新菜单
  watch: {
    isAuthenticated: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          try {
            // 登录成功时，清除旧菜单并重新获取
            localStorage.removeItem('menus');
            await this.$store.dispatch('fetchMenus');
            this.expandParentMenus();
          } catch (error) {
            console.error('获取菜单失败:', error);
          }
        }
      }
    },
    // 监听路由变化，更新激活的子菜单
    '$route.path': {
      immediate: true,
      handler(newPath) {
        this.updateActiveSubmenu(newPath);
      }
    }
  },
  methods: {
buildMenuTree(flatMenus) {
  if (!Array.isArray(flatMenus)) {
    return [];
  }

  const normalizeMenu = (menu) => ({
    ...menu,
    children: Array.isArray(menu.children)
      ? menu.children.map(normalizeMenu)
      : []
  });

  if (flatMenus.some(menu => Array.isArray(menu.children) && menu.children.length > 0)) {
    return flatMenus.map(normalizeMenu);
  }

  const rootMenus = flatMenus.filter(m => !m.parent_id || m.parent_id === 0);
  const childrenMap = {};
  flatMenus.forEach(m => {
    if (m.parent_id && m.parent_id > 0) {
      if (!childrenMap[m.parent_id]) {
        childrenMap[m.parent_id] = [];
      }
      childrenMap[m.parent_id].push(m);
    }
  });
  return rootMenus.map(root => ({
    ...root,
    children: childrenMap[root.id] || []
  }));
},

    expandParentMenus() {
      const collectParentCodes = (menus, codes = []) => {
        menus.forEach(menu => {
          if (menu.children && menu.children.length > 0) {
            codes.push(menu.code);
            collectParentCodes(menu.children, codes);
          }
        });
        return codes;
      };

      this.expandedMenus = Array.from(new Set([
        ...this.expandedMenus,
        ...collectParentCodes(this.userMenus)
      ]));
    },

    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    handleMenuToggle(menuCode, expanded) {
      const index = this.expandedMenus.indexOf(menuCode);
      if (expanded && index === -1) {
        this.expandedMenus.push(menuCode);
      } else if (!expanded && index !== -1) {
        this.expandedMenus.splice(index, 1);
      }
    },
    updateActiveSubmenu(path) {
      const findMenu = (menus, targetPath) => {
        for (const menu of menus) {
          if (menu.path === targetPath) {
            return menu;
          }
          if (menu.children && menu.children.length > 0) {
            const found = findMenu(menu.children, targetPath);
            if (found) {
              if (!this.expandedMenus.includes(menu.code)) {
                this.expandedMenus.push(menu.code);
              }
              return found;
            }
          }
        }
        return null;
      };
      
      if (this.userMenus) {
        findMenu(this.userMenus, path);
      }
    },
    handleLogout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4cc9f0;
  --background-color: #f8f9fa;
  --sidebar-bg: linear-gradient(180deg, #1e2a4a 0%, #2c3e50 100%);
  --text-color: #212529;
  --border-color: #dee2e6;
  --card-bg: #ffffff;
  --hover-color: rgba(67, 97, 238, 0.1);
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: var(--sidebar-bg);
  color: white;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 88px;
  min-width: 88px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-header {
  flex-direction: column;
  gap: 14px;
  padding: 18px 12px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 12px;
}

.sidebar.collapsed .logo {
  justify-content: center;
  gap: 0;
}

.logo-icon {
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 8px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar.collapsed .collapse-btn {
  width: 40px;
  height: 32px;
  border-radius: 10px;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.sidebar.collapsed .logo-text {
  display: none;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar.collapsed .arrow {
  display: none;
}

.sidebar.collapsed .nav-menu {
  padding: 14px 0;
}

.sidebar.collapsed .nav-item {
  margin-bottom: 8px;
}

.sidebar.collapsed .nav-link {
  width: 52px;
  min-height: 52px;
  justify-content: center;
  padding: 0;
  margin: 0 auto;
  border-radius: 14px;
  overflow: visible;
}

.sidebar.collapsed .nav-link::before {
  display: none;
}

.sidebar.collapsed .nav-link:hover {
  transform: none;
}

.sidebar.collapsed .icon {
  margin-right: 0;
  width: 34px;
  height: 34px;
}

.sidebar.collapsed .submenu {
  display: none !important;
}

.nav-menu {
  list-style: none;
  padding: 20px 0;
  flex: 1;
}

.nav-item {
  margin-bottom: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 25px 25px 0;
  margin: 0 10px;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: all 0.3s ease;
}

.nav-link:hover::before {
  background: var(--accent-color);
}

.nav-link:hover {
  background: var(--hover-color);
  transform: translateX(5px);
}

.icon {
  margin-right: 12px;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
  font-size: 0.8rem;
  opacity: 0.7;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  padding-left: 50px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 10px 10px;
  margin: 5px 10px 0 10px;
  overflow: hidden;
}

.submenu li {
  padding: 8px 0;
}

.submenu a {
  color: #bdc3c7;
  text-decoration: none;
  padding: 8px 12px;
  display: block;
  transition: all 0.2s;
  border-radius: 6px;
  margin: 2px 0;
}

.submenu a:hover {
  color: white;
  background: rgba(67, 97, 238, 0.2);
}

/* ===== 主内容区 ===== */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--background-color);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: calc(100% - 280px);
}

.main-content.sidebar-collapsed-layout {
  margin-left: 88px;
  width: calc(100% - 88px);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--hover-color);
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}

/* 内容区：填满剩余空间 */
.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow: auto;
  width: 100%;
}

/* 路由链接激活状态样式 */
.router-link-active {
  color: var(--accent-color) !important;
  font-weight: 500;
}

.sidebar .router-link-active {
  background: var(--hover-color);
  color: white !important;
}

/* 卡片样式 */
.card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--secondary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 表格样式 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--hover-color);
  font-weight: 600;
  color: var(--secondary-color);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background: var(--hover-color);
}
</style>
