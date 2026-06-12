import { createRouter, createWebHashHistory } from 'vue-router';
import store from '../store';
import Dashboard from '../views/Dashboard.vue';
import Leads from '../views/Leads.vue';
import LeadsAdd from '../views/LeadsAdd.vue';
import Customers from '../views/Customers.vue';
import CustomersAdd from '../views/CustomersAdd.vue';
import Quotes from '../views/Quotes.vue';
import QuotesAdd from '../views/QuotesAdd.vue';
import Contracts from '../views/Contracts.vue';
import ContractsAdd from '../views/ContractsAdd.vue';
import AiInsights from '../views/AiInsights.vue';
import AiAnalysis from '../views/AiAnalysis.vue';
import CustomerDetail from '../views/CustomerDetail.vue';
import CustomersList from '../views/CustomersList.vue';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { permission: 'DASHBOARD_READ' }
  },
  {
    path: '/home',
    name: 'HomeAlt',
    component: Home,
    meta: { permission: 'DASHBOARD_READ' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { permission: 'DASHBOARD_READ' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'), // 懒加载
    meta: { permission: 'REPORT_READ' }
  },
  {
    path: '/leads',
    name: 'Leads',
    component: Leads,
    meta: { permission: 'LEAD_READ' }
  },
  {
    path: '/leads/add',
    name: 'LeadsAdd',
    component: LeadsAdd,
    meta: { permission: 'LEAD_CREATE' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers,
    meta: { permission: 'CUSTOMER_READ' }
  },
  {
    path: '/customers/list',
    name: 'CustomersList',
    component: CustomersList,
    meta: { permission: 'CUSTOMER_READ' }
  },
  {
    path: '/customers/add',
    name: 'CustomersAdd',
    component: CustomersAdd,
    meta: { permission: 'CUSTOMER_CREATE' }
  },
  {
    path: '/customers/detail/:id',
    name: 'CustomerDetail',
    component: CustomerDetail,
    props: true,
    meta: { permission: 'CUSTOMER_READ' }
  },
  {
    path: '/quotes',
    name: 'Quotes',
    component: Quotes,
    meta: { permission: 'QUOTE_READ' }
  },
  {
    path: '/quotes/add',
    name: 'QuotesAdd',
    component: QuotesAdd,
    meta: { permission: 'QUOTE_CREATE' }
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: Contracts,
    meta: { permission: 'CONTRACT_READ' }
  },
  {
    path: '/contracts/add',
    name: 'ContractsAdd',
    component: ContractsAdd,
    meta: { permission: 'CONTRACT_CREATE' }
  },
  {
    path: '/ai-insights',
    name: 'AiInsights',
    component: AiInsights,
    meta: { permission: 'AI_ANALYZE' }
  },
  {
    path: '/ai-analysis',
    name: 'AiAnalysis',
    component: AiAnalysis,
    meta: { permission: 'AI_ANALYZE' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫：未登录跳转到 /login
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  if (to.meta.public) {
    // 公开页面（登录页），已登录则跳转仪表盘
    if (isAuthenticated) {
      next('/dashboard');
    } else {
      next();
    }
  } else {
    // 需要认证的页面
    if (!isAuthenticated) {
      next('/login');
    } else if (to.meta.permission && !store.getters.hasPermission(to.meta.permission)) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router;
