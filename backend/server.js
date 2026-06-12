const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ai-sales-dev-secret';
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const PERSISTED_KEYS = ['leads', 'customers', 'quotes', 'contracts', 'callAnalyses'];

app.use(cors());
app.use(express.json());

const now = () => new Date().toISOString();
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const permissionCodes = [
  'LEAD_READ', 'LEAD_CREATE', 'LEAD_EDIT', 'LEAD_DELETE', 'LEAD_EXPORT',
  'CUSTOMER_READ', 'CUSTOMER_CREATE', 'CUSTOMER_EDIT', 'CUSTOMER_DELETE', 'CUSTOMER_EXPORT',
  'QUOTE_READ', 'QUOTE_CREATE', 'QUOTE_EDIT', 'QUOTE_DELETE', 'QUOTE_EXPORT',
  'CONTRACT_READ', 'CONTRACT_CREATE', 'CONTRACT_EDIT', 'CONTRACT_DELETE', 'CONTRACT_EXPORT',
  'DASHBOARD_READ', 'REPORT_READ', 'AI_ANALYZE', 'AUDIO_UPLOAD', 'USER_MANAGE', 'ROLE_MANAGE'
];

const permissions = permissionCodes.map((code, index) => ({
  id: index + 1,
  code,
  name: code,
  resource: code.split('_')[0].toLowerCase(),
  action: code.split('_')[1] || 'manage'
}));

const roles = [
  { id: 1, name: '管理员', code: 'ADMIN', description: '系统管理员' },
  { id: 2, name: '销售经理', code: 'SALES_MANAGER', description: '团队销售管理' },
  { id: 3, name: '销售代表', code: 'SALES_REP', description: '销售业务执行' },
  { id: 4, name: '只读分析员', code: 'VIEWER', description: '只读报表权限' }
];

const menus = [
  { id: 1, parent_id: 0, name: '首页', code: 'HOME', path: '/', icon: 'home', sort: 1 },
  { id: 2, parent_id: 0, name: '线索管理', code: 'LEADS', path: '/leads', icon: 'user', sort: 2 },
  { id: 3, parent_id: 2, name: '线索列表', code: 'LEADS_LIST', path: '/leads', icon: 'list', sort: 1 },
  { id: 4, parent_id: 2, name: '添加线索', code: 'LEADS_ADD', path: '/leads/add', icon: 'plus', sort: 2 },
  { id: 5, parent_id: 0, name: '客户管理', code: 'CUSTOMERS', path: '/customers', icon: 'team', sort: 3 },
  { id: 6, parent_id: 5, name: '客户列表', code: 'CUSTOMERS_LIST', path: '/customers', icon: 'list', sort: 1 },
  { id: 7, parent_id: 5, name: '添加客户', code: 'CUSTOMERS_ADD', path: '/customers/add', icon: 'plus', sort: 2 },
  { id: 8, parent_id: 0, name: '报价管理', code: 'QUOTES', path: '/quotes', icon: 'file-text', sort: 4 },
  { id: 9, parent_id: 8, name: '报价列表', code: 'QUOTES_LIST', path: '/quotes', icon: 'list', sort: 1 },
  { id: 10, parent_id: 8, name: '新建报价', code: 'QUOTES_ADD', path: '/quotes/add', icon: 'plus', sort: 2 },
  { id: 11, parent_id: 0, name: '合同管理', code: 'CONTRACTS', path: '/contracts', icon: 'file', sort: 5 },
  { id: 12, parent_id: 11, name: '合同列表', code: 'CONTRACTS_LIST', path: '/contracts', icon: 'list', sort: 1 },
  { id: 13, parent_id: 11, name: '新建合同', code: 'CONTRACTS_ADD', path: '/contracts/add', icon: 'plus', sort: 2 },
  { id: 14, parent_id: 0, name: '数据报表', code: 'REPORTS', path: '/reports', icon: 'bar-chart', sort: 6 },
  { id: 15, parent_id: 0, name: '分析', code: 'AI_ANALYSIS', path: '/ai-analysis', icon: 'brain', sort: 7 }
];

const users = [
  { id: 1, username: 'admin', password: 'admin123', name: '管理员', email: 'admin@aisales.local', phone: '13800138000', roleCodes: ['ADMIN'] },
  { id: 2, username: 'manager_chen', password: '123456', name: '陈明', email: 'chen.ming@aisales.local', phone: '13800138001', roleCodes: ['SALES_MANAGER'] },
  { id: 3, username: 'sales_lin', password: '123456', name: '林悦', email: 'lin.yue@aisales.local', phone: '13800138002', roleCodes: ['SALES_REP'] },
  { id: 4, username: 'sales_zhou', password: '123456', name: '周航', email: 'zhou.hang@aisales.local', phone: '13800138003', roleCodes: ['SALES_REP'] },
  { id: 5, username: 'viewer_qi', password: '123456', name: '齐思', email: 'qi.si@aisales.local', phone: '13800138004', roleCodes: ['VIEWER'] }
];

menus.push(
  { id: 16, parent_id: 0, name: 'Dashboard', code: 'DASHBOARD', path: '/dashboard', icon: 'home', sort: 0 },
  { id: 17, parent_id: 0, name: 'System', code: 'SYSTEM', path: '/system', icon: 'settings', sort: 99 },
  { id: 18, parent_id: 17, name: 'Users', code: 'USERS', path: '/users', icon: 'user-cog', sort: 1 },
  { id: 19, parent_id: 17, name: 'Roles', code: 'ROLES', path: '/roles', icon: 'shield', sort: 2 }
);

users.find(user => user.id === 3).manager_id = 2;
users.find(user => user.id === 4).manager_id = 2;

const businessPermissions = [
  'LEAD_READ', 'LEAD_CREATE', 'LEAD_EDIT', 'LEAD_DELETE', 'LEAD_EXPORT',
  'CUSTOMER_READ', 'CUSTOMER_CREATE', 'CUSTOMER_EDIT', 'CUSTOMER_DELETE', 'CUSTOMER_EXPORT',
  'QUOTE_READ', 'QUOTE_CREATE', 'QUOTE_EDIT', 'QUOTE_DELETE', 'QUOTE_EXPORT',
  'CONTRACT_READ', 'CONTRACT_CREATE', 'CONTRACT_EDIT', 'CONTRACT_DELETE', 'CONTRACT_EXPORT',
  'DASHBOARD_READ', 'REPORT_READ', 'AI_ANALYZE', 'AUDIO_UPLOAD'
];

const rolePermissionMap = {
  ADMIN: permissionCodes,
  SALES_MANAGER: businessPermissions,
  SALES_REP: businessPermissions.filter(code => code !== 'REPORT_READ'),
  VIEWER: ['DASHBOARD_READ', 'LEAD_READ', 'CUSTOMER_READ', 'QUOTE_READ', 'CONTRACT_READ']
};

const roleMenuMap = {
  ADMIN: null,
  SALES_MANAGER: ['DASHBOARD', 'HOME', 'LEADS', 'LEADS_LIST', 'LEADS_ADD', 'CUSTOMERS', 'CUSTOMERS_LIST', 'CUSTOMERS_ADD', 'QUOTES', 'QUOTES_LIST', 'QUOTES_ADD', 'CONTRACTS', 'CONTRACTS_LIST', 'CONTRACTS_ADD', 'REPORTS', 'AI_ANALYSIS'],
  SALES_REP: ['DASHBOARD', 'HOME', 'LEADS', 'LEADS_LIST', 'LEADS_ADD', 'CUSTOMERS', 'CUSTOMERS_LIST', 'CUSTOMERS_ADD', 'QUOTES', 'QUOTES_LIST', 'QUOTES_ADD', 'CONTRACTS', 'CONTRACTS_LIST', 'CONTRACTS_ADD', 'AI_ANALYSIS'],
  VIEWER: ['DASHBOARD', 'LEADS', 'LEADS_LIST', 'CUSTOMERS', 'CUSTOMERS_LIST', 'QUOTES', 'QUOTES_LIST', 'CONTRACTS', 'CONTRACTS_LIST']
};

const store = {
  leads: [
    { id: 1, name: '华东云仓数字化项目', email: 'it@hdcloud-logistics.com', phone: '021-6123-8801', status: '新线索', source: '官网咨询', created_by: 3, created_at: now() },
    { id: 2, name: '星河医疗集团CRM升级', email: 'ops@xinghe-med.com', phone: '0755-8899-1024', status: '跟进中', source: '行业峰会', created_by: 3, created_at: daysAgo(2) },
    { id: 3, name: '北辰教育校区招生系统', email: 'admin@beichen-edu.cn', phone: '010-5876-2300', status: '已转化', source: '老客户推荐', created_by: 4, created_at: daysAgo(5) },
    { id: 4, name: '青橙零售私域运营', email: 'growth@qingcheng-retail.cn', phone: '0571-6688-7712', status: '跟进中', source: '广告投放', created_by: 4, created_at: daysAgo(9) },
    { id: 5, name: '远山装备售后服务平台', email: 'service@yuanshan-equip.com', phone: '028-6100-4567', status: '新线索', source: '客户转介绍', created_by: 2, created_at: daysAgo(1) }
  ],
  customers: [
    { id: 1, name: '星河医疗集团', company: '星河医疗集团', email: 'ops@xinghe-med.com', phone: '0755-8899-1024', lead_id: 2, created_by: 3, created_at: daysAgo(14), contactPerson: '许琳', type: 'enterprise', industry: 'healthcare', status: 'active', dealValue: 680000, totalDealValue: 680000, contractCount: 2, quoteCount: 3 },
    { id: 2, name: '北辰教育科技', company: '北辰教育科技有限公司', email: 'admin@beichen-edu.cn', phone: '010-5876-2300', lead_id: 3, created_by: 4, created_at: daysAgo(21), contactPerson: '高远', type: 'education', industry: 'education', status: 'active', dealValue: 320000, totalDealValue: 320000, contractCount: 1, quoteCount: 2 },
    { id: 3, name: '青橙零售', company: '杭州青橙零售有限公司', email: 'growth@qingcheng-retail.cn', phone: '0571-6688-7712', lead_id: 4, created_by: 4, created_at: daysAgo(8), contactPerson: '唐晓', type: 'enterprise', industry: 'retail', status: 'prospect', dealValue: 180000, totalDealValue: 0, contractCount: 0, quoteCount: 1 },
    { id: 4, name: '远山装备', company: '成都远山装备制造有限公司', email: 'service@yuanshan-equip.com', phone: '028-6100-4567', lead_id: 5, created_by: 2, created_at: daysAgo(3), contactPerson: '罗成', type: 'enterprise', industry: 'other', status: 'prospect', dealValue: 460000, totalDealValue: 0, contractCount: 0, quoteCount: 1 }
  ],
  quotes: [
    { id: 1, customer_id: 1, amount: 420000, items: JSON.stringify([{ name: 'CRM 标准版', qty: 1, price: 220000 }, { name: '数据迁移服务', qty: 1, price: 80000 }, { name: '实施培训', qty: 1, price: 120000 }]), status: '已接受', created_by: 3, created_at: daysAgo(12) },
    { id: 2, customer_id: 1, amount: 260000, items: JSON.stringify([{ name: '客户成功模块', qty: 1, price: 180000 }, { name: '接口集成', qty: 1, price: 80000 }]), status: '已发送', created_by: 3, created_at: daysAgo(4) },
    { id: 3, customer_id: 2, amount: 320000, items: JSON.stringify([{ name: '招生线索管理', qty: 1, price: 180000 }, { name: '校区看板', qty: 1, price: 90000 }, { name: '短信通知包', qty: 1, price: 50000 }]), status: '已接受', created_by: 4, created_at: daysAgo(17) },
    { id: 4, customer_id: 3, amount: 180000, items: JSON.stringify([{ name: '私域运营看板', qty: 1, price: 120000 }, { name: '营销自动化', qty: 1, price: 60000 }]), status: '待审批', created_by: 4, created_at: daysAgo(2) },
    { id: 5, customer_id: 4, amount: 460000, items: JSON.stringify([{ name: '售后服务平台', qty: 1, price: 300000 }, { name: '移动工单', qty: 1, price: 90000 }, { name: '设备档案迁移', qty: 1, price: 70000 }]), status: '草稿', created_by: 2, created_at: now() }
  ],
  contracts: [
    { id: 1, quote_id: 1, customer_id: 1, amount: 420000, status: '已签署', signed_date: daysAgo(10), created_by: 3, created_at: daysAgo(10) },
    { id: 2, quote_id: 3, customer_id: 2, amount: 320000, status: '已签署', signed_date: daysAgo(15), created_by: 4, created_at: daysAgo(15) },
    { id: 3, quote_id: 2, customer_id: 1, amount: 260000, status: '待签署', signed_date: null, created_by: 3, created_at: daysAgo(3) }
  ],
  reminders: [
    { id: 1, user_id: 1, type: 'warning', title: '合同签署提醒', content: '星河医疗集团二期合同待客户法务确认，请今日跟进', priority: 'high', is_read: 0, created_at: now() },
    { id: 2, user_id: 1, type: 'task', title: '报价审批', content: '青橙零售私域运营报价需要销售经理审批', priority: 'normal', is_read: 0, created_at: daysAgo(1) }
  ],
  teamPerformance: [
    { id: 1, user_id: 3, member_name: '林悦', avatar: '', weekly_sales: 420000, performance_rate: 112 },
    { id: 2, user_id: 4, member_name: '周航', avatar: '', weekly_sales: 320000, performance_rate: 94 },
    { id: 3, user_id: 2, member_name: '陈明', avatar: '', weekly_sales: 180000, performance_rate: 76 }
  ],
  dealNews: [
    { id: 1, user_id: 3, customer_name: '星河医疗集团', amount: 420000, content: 'CRM 一期项目已完成签约，计划两周内启动实施', created_at: daysAgo(10) },
    { id: 2, user_id: 4, customer_name: '北辰教育科技', amount: 320000, content: '招生线索管理项目签约，覆盖 12 个校区', created_at: daysAgo(15) }
  ],
  highPotentialCustomers: [
    { id: 1, customer_name: '远山装备', potential_score: 91, reason: '售后服务团队扩张，预算已确认' },
    { id: 2, customer_name: '青橙零售', potential_score: 86, reason: '私域运营指标压力高，决策链较短' },
    { id: 3, customer_name: '华东云仓', potential_score: 82, reason: '仓配数字化需求明确，正在比较供应商' }
  ],
  marketingTips: [
    { id: 1, content: '制造业客户更关注售后响应时效，建议准备工单闭环案例', category: '行业', created_at: now() },
    { id: 2, content: '对医疗客户突出权限审计和数据安全能力，能显著缩短评审周期', category: '销售策略', created_at: daysAgo(1) }
  ],
  salesForecast: [
    { id: 1, metric_name: '本月销售额', current_value: 740000, predicted_value: 1180000, change_rate: 18.6 },
    { id: 2, metric_name: '线索转化率', current_value: 32, predicted_value: 38, change_rate: 6 },
    { id: 3, metric_name: '平均订单金额', current_value: 333000, predicted_value: 365000, change_rate: 9.6 }
  ]
};

store.audioUploads = [];
store.audioQueue = [];
store.callAnalyses = [
  {
    id: 1,
    job_id: 'seed-call-1',
    customer_id: 1,
    user_id: 3,
    audio: { filename: 'demo-sales-call.wav', duration_seconds: 518 },
    transcript: [
      { speaker: 'sales', text: 'We can migrate your CRM data in phases and keep the current workflow running.' },
      { speaker: 'customer', text: 'Data security and implementation risk are our main concerns before renewal.' },
      { speaker: 'sales', text: 'I will send the security checklist and a two-week implementation plan today.' }
    ],
    analysis: {
      intent_level: 'high',
      intent_score: 86,
      demand_tags: ['CRM upgrade', 'data migration', 'security audit'],
      pain_points: ['implementation risk', 'permission audit', 'legacy data quality'],
      competitors: ['legacy vendor'],
      sentiment: { overall: 'positive', customer: 'cautious', sales: 'confident' },
      action_suggestions: ['Send security checklist', 'Schedule technical workshop', 'Prepare phased rollout plan'],
      summary: 'Customer has clear renewal intent but needs risk controls and security proof before signing.'
    },
    status: 'completed',
    created_at: daysAgo(1),
    completed_at: daysAgo(1)
  }
];

function loadPersistentStore() {
  if (!fs.existsSync(STORE_FILE)) {
    return;
  }

  try {
    const persisted = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    PERSISTED_KEYS.forEach((key) => {
      if (Array.isArray(persisted[key])) {
        store[key] = persisted[key];
      }
    });
    console.log(`已加载本地数据: ${STORE_FILE}`);
  } catch (error) {
    console.warn(`本地数据加载失败，将使用默认演示数据: ${error.message}`);
  }
}

function savePersistentStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const snapshot = PERSISTED_KEYS.reduce((result, key) => {
      result[key] = store[key];
      return result;
    }, {});

    fs.writeFileSync(STORE_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error(`本地数据保存失败: ${error.message}`);
  }
}

loadPersistentStore();

const seededCustomer = store.customers.find(customer => customer.id === 1);
if (seededCustomer && !Array.isArray(seededCustomer.ai_timeline)) {
  seededCustomer.intent_score = 86;
  seededCustomer.ai_tags = ['CRM upgrade', 'data migration', 'security audit'];
  seededCustomer.ai_timeline = [
    { type: 'call_analysis', analysis_id: 1, intent_score: 86, created_at: daysAgo(1), summary: 'Customer needs security proof before renewal.' }
  ];
}

function getUserProfile(user) {
  const userRoles = roles.filter(role => user.roleCodes.includes(role.code));
  const permissionSet = new Set(user.roleCodes.flatMap(roleCode => rolePermissionMap[roleCode] || []));
  const userPermissions = permissions.filter(permission => permissionSet.has(permission.code));
  return { ...user, roles: userRoles, permissions: userPermissions };
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar || ''
  };
}

function getAllowedMenuCodes(user) {
  if (!user || user.roleCodes.includes('ADMIN')) {
    return null;
  }

  return new Set(user.roleCodes.flatMap(roleCode => roleMenuMap[roleCode] || []));
}

function buildMenuTree(user, parentId = 0) {
  const allowedCodes = getAllowedMenuCodes(user);
  const isAllowed = (menu) => !allowedCodes || allowedCodes.has(menu.code);

  return menus
    .filter(menu => menu.parent_id === parentId && isAllowed(menu))
    .sort((a, b) => a.sort - b.sort)
    .map(menu => ({ ...menu, children: buildMenuTree(user, menu.id) }));
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find(item => item.id === payload.id);
    if (!user) return res.sendStatus(404);
    req.user = getUserProfile(user);
    next();
  } catch (error) {
    res.sendStatus(403);
  }
}

function hasPermission(permissionCode) {
  return (req, res, next) => {
    if (req.user.roles.some(role => role.code === 'ADMIN')) return next();
    if (req.user.permissions.some(permission => permission.code === permissionCode)) return next();
    res.status(403).json({ error: '权限不足' });
  };
}

function paginate(rows, page = 1, limit = 10) {
  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 10;
  const start = (numericPage - 1) * numericLimit;
  return {
    data: rows.slice(start, start + numericLimit),
    total: rows.length,
    page: numericPage,
    limit: numericLimit
  };
}

function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

function withCreator(rows) {
  return rows.map(row => ({
    ...row,
    creator_name: users.find(user => user.id === row.created_by)?.name || ''
  }));
}

function isAdmin(user) {
  return user.roles.some(role => role.code === 'ADMIN');
}

function isSalesManager(user) {
  return user.roles.some(role => role.code === 'SALES_MANAGER');
}

function isViewer(user) {
  return user.roles.some(role => role.code === 'VIEWER');
}

function getAccessibleOwnerIds(user) {
  if (isAdmin(user) || isViewer(user)) {
    return null;
  }

  if (isSalesManager(user)) {
    return users
      .filter(item => item.id === user.id || item.manager_id === user.id)
      .map(item => item.id);
  }

  return [user.id];
}

function filterRowsForUser(rows, user) {
  const ownerIds = getAccessibleOwnerIds(user);
  if (!ownerIds) return rows;
  return rows.filter(row => ownerIds.includes(Number(row.created_by)));
}

function canAccessRow(row, user) {
  return filterRowsForUser([row], user).length > 0;
}

function getAccessibleCustomer(customerId, user) {
  const customer = store.customers.find(row => row.id === Number(customerId));
  if (!customer) return null;
  return canAccessRow(customer, user) ? customer : false;
}

function normalizeAudioUpload(req) {
  const isJson = req.is('application/json');
  const body = isJson && req.body ? req.body : {};
  const fileBuffer = Buffer.isBuffer(req.body) ? req.body : null;

  return {
    customer_id: Number(body.customer_id || req.headers['x-customer-id'] || req.query.customer_id),
    filename: body.filename || req.headers['x-file-name'] || 'call-recording.bin',
    duration_seconds: Number(body.duration_seconds || req.headers['x-duration-seconds'] || 0),
    channel: body.channel || req.headers['x-audio-channel'] || 'app',
    transcript: body.transcript || '',
    metadata: body.metadata || {},
    file_size: fileBuffer ? fileBuffer.length : Number(body.file_size || 0),
    storage_key: fileBuffer ? `memory://${Date.now()}-${Math.random().toString(36).slice(2)}` : body.audio_url || body.storage_key || null
  };
}

function extractJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (error) {
    return null;
  }
}

async function transcribeAudio(upload) {
  if (upload.transcript) {
    return String(upload.transcript)
      .split('\n')
      .filter(Boolean)
      .map((line, index) => {
        const match = line.match(/^(sales|customer|销售|客户)[:：]\s*(.+)$/i);
        if (!match) {
          return { speaker: index % 2 === 0 ? 'sales' : 'customer', text: line.trim() };
        }
        return {
          speaker: /sales|销售/i.test(match[1]) ? 'sales' : 'customer',
          text: match[2].trim()
        };
      });
  }

  if (process.env.ASR_API_URL && process.env.ASR_API_KEY) {
    const response = await fetch(process.env.ASR_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ASR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        storage_key: upload.storage_key,
        filename: upload.filename,
        duration_seconds: upload.duration_seconds
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.segments)) return data.segments;
      if (data.text) return [{ speaker: 'customer', text: data.text }];
    }
  }

  return [
    { speaker: 'sales', text: 'I reviewed your current sales workflow and the team can launch the first phase in two weeks.' },
    { speaker: 'customer', text: 'We care most about data migration risk, user training, and whether the price can fit this quarter budget.' },
    { speaker: 'sales', text: 'I will send a phased migration plan, training schedule, and a revised quote before Friday.' }
  ];
}

function buildFallbackAnalysis(transcript) {
  const text = transcript.map(segment => segment.text).join(' ').toLowerCase();
  const score = text.includes('budget') || text.includes('quote') ? 82 : 68;

  return {
    intent_level: score >= 80 ? 'high' : 'medium',
    intent_score: score,
    demand_tags: ['data migration', 'user training', 'budget fit'],
    pain_points: ['migration risk', 'adoption cost', 'implementation timeline'],
    competitors: text.includes('competitor') ? ['competitor mentioned'] : [],
    sentiment: { overall: 'positive', customer: 'cautious', sales: 'proactive' },
    action_suggestions: ['Send revised quote', 'Schedule implementation workshop', 'Share migration risk checklist'],
    summary: 'Customer shows active buying intent and needs a concrete rollout plan plus budget confirmation.'
  };
}

async function analyzeTranscriptWithDeepSeek(transcript) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return buildFallbackAnalysis(transcript);
  }

  const prompt = [
    'Analyze this sales call transcript and return strict JSON with keys:',
    'intent_level, intent_score, demand_tags, pain_points, competitors, sentiment, action_suggestions, summary.',
    JSON.stringify(transcript)
  ].join('\n');

  const response = await fetch(process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a CRM sales-call analyst. Return JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    return buildFallbackAnalysis(transcript);
  }

  const data = await response.json();
  return extractJsonObject(data.choices?.[0]?.message?.content) || buildFallbackAnalysis(transcript);
}

function persistCallAnalysis(upload, transcript, analysis) {
  const record = {
    id: nextId(store.callAnalyses),
    job_id: upload.job_id,
    customer_id: upload.customer_id,
    user_id: upload.user_id,
    audio: {
      filename: upload.filename,
      duration_seconds: upload.duration_seconds,
      storage_key: upload.storage_key,
      file_size: upload.file_size
    },
    transcript,
    analysis,
    status: 'completed',
    created_at: upload.created_at,
    completed_at: now()
  };

  store.callAnalyses.unshift(record);

  const customer = store.customers.find(row => row.id === upload.customer_id);
  if (customer) {
    customer.intent_score = analysis.intent_score;
    customer.ai_tags = Array.from(new Set([...(customer.ai_tags || []), ...(analysis.demand_tags || [])]));
    customer.ai_timeline = [
      { type: 'call_analysis', analysis_id: record.id, intent_score: analysis.intent_score, summary: analysis.summary, created_at: record.completed_at },
      ...(customer.ai_timeline || [])
    ].slice(0, 20);
  }

  savePersistentStore();
  return record;
}

let audioQueueRunning = false;

async function processAudioQueue() {
  if (audioQueueRunning) return;
  audioQueueRunning = true;

  try {
    while (store.audioQueue.length > 0) {
      const job = store.audioQueue.shift();
      const upload = store.audioUploads.find(item => item.job_id === job.job_id);
      if (!upload) continue;

      upload.status = 'processing';
      try {
        const transcript = await transcribeAudio(upload);
        const analysis = await analyzeTranscriptWithDeepSeek(transcript);
        const record = persistCallAnalysis(upload, transcript, analysis);
        upload.status = 'completed';
        upload.analysis_id = record.id;
        upload.completed_at = record.completed_at;
      } catch (error) {
        upload.status = 'failed';
        upload.error = error.message || 'analysis failed';
      }
    }
  } finally {
    audioQueueRunning = false;
  }
}

function enqueueAudioUpload(upload) {
  store.audioQueue.push({ job_id: upload.job_id });
  setTimeout(processAudioQueue, 0);
}

function buildCustomerInsights(customerId) {
  const analyses = store.callAnalyses
    .filter(record => Number(record.customer_id) === Number(customerId))
    .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at));

  return {
    latest: analyses[0] || null,
    analyses,
    trend: analyses
      .slice()
      .reverse()
      .map(record => ({
        date: record.completed_at || record.created_at,
        intent_score: record.analysis?.intent_score || 0,
        intent_level: record.analysis?.intent_level || 'unknown'
      })),
    suggested_actions: analyses[0]?.analysis?.action_suggestions || []
  };
}

function enrichCustomers(rows) {
  return withCreator(rows).map(customer => ({
    ...customer,
    lead_name: store.leads.find(lead => lead.id === Number(customer.lead_id))?.name || null
  }));
}

function enrichQuotes(rows) {
  return withCreator(rows).map(quote => ({
    ...quote,
    customer_name: store.customers.find(customer => customer.id === Number(quote.customer_id))?.name || null
  }));
}

function enrichContracts(rows) {
  return withCreator(rows).map(contract => ({
    ...contract,
    customer_name: store.customers.find(customer => customer.id === Number(contract.customer_id))?.name || null,
    quote_amount: store.quotes.find(quote => quote.id === Number(contract.quote_id))?.amount || null
  }));
}

function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  return {
    today_leads: store.leads.filter(lead => String(lead.created_at).startsWith(today)).length,
    total_customers: store.customers.length,
    pending_contracts: store.contracts.filter(contract => contract.status === '待签署').length,
    pending_leads: store.leads.filter(lead => lead.status === '新线索').length,
    total_sales: store.contracts
      .filter(contract => contract.status === '已签署')
      .reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
  };
}

function buildReport() {
  const labels = ['第1周', '第2周', '第3周', '第4周'];
  const salesData = [180000, 260000, 320000, 420000];
  const countLeads = (status) => store.leads.filter(lead => lead.status === status).length;
  const countContracts = (status) => store.contracts.filter(contract => contract.status === status).length;
  const totalLeads = store.leads.length;
  const converted = countLeads('已转化');

  return {
    salesLabels: labels,
    salesData,
    conversionLabels: ['已转化', '跟进中', '新线索'],
    conversionData: [converted, countLeads('跟进中'), countLeads('新线索')],
    contractLabels: ['已签署', '待签署', '草稿'],
    contractData: [countContracts('已签署'), countContracts('待签署'), store.quotes.filter(quote => quote.status === '草稿').length],
    rankingLabels: store.teamPerformance.map(item => item.member_name),
    rankingData: store.teamPerformance.map(item => item.weekly_sales),
    reportData: labels.map((label, index) => ({
      date: label,
      sales: salesData[index],
      newCustomers: [1, 1, 1, 1][index],
      conversionRate: totalLeads ? Math.round((converted / totalLeads) * 100) : 0,
      contracts: [0, 1, 1, 1][index]
    }))
  };
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(item => item.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const profile = getUserProfile(user);
  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: publicUser(user),
    roles: profile.roles,
    permissions: profile.permissions,
    menus: buildMenuTree(profile)
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: publicUser(req.user),
    roles: req.user.roles,
    permissions: req.user.permissions
  });
});

app.get('/api/auth/menus', authenticateToken, (req, res) => {
  res.json(buildMenuTree(req.user));
});

app.get('/api/stats/dashboard', authenticateToken, (req, res) => {
  res.json(getDashboardStats());
});

app.get('/api/dashboard/full', authenticateToken, (req, res) => {
  res.json({
    stats: getDashboardStats(),
    reminders: store.reminders,
    teamPerformance: store.teamPerformance,
    dealNews: store.dealNews,
    highPotentialCustomers: store.highPotentialCustomers,
    marketingTips: store.marketingTips,
    salesForecast: store.salesForecast
  });
});

app.get('/api/dashboard/alerts', authenticateToken, (req, res) => res.json(store.reminders));
app.get('/api/dashboard/team-performance', authenticateToken, (req, res) => res.json(store.teamPerformance));
app.get('/api/dashboard/deal-news', authenticateToken, (req, res) => res.json(store.dealNews));
app.get('/api/dashboard/high-potential-customers', authenticateToken, (req, res) => res.json(store.highPotentialCustomers));
app.get('/api/dashboard/marketing-tips', authenticateToken, (req, res) => res.json(store.marketingTips));
app.get('/api/dashboard/sales-forecast', authenticateToken, (req, res) => res.json(store.salesForecast));

app.get('/api/reports', authenticateToken, hasPermission('REPORT_READ'), (req, res) => {
  res.json(buildReport(req.query.period || 'month'));
});

app.get('/api/ai/insights', authenticateToken, (req, res) => {
  res.json({
    insights: [
      { type: 'warning', title: '签署风险', content: '星河医疗集团二期合同停留在法务确认阶段超过 3 天，建议由销售经理介入推动。' },
      { type: 'info', title: '高潜机会', content: '远山装备售后服务平台预算明确，预计本周适合安排方案演示。' },
      { type: 'info', title: '转化建议', content: '青橙零售对私域运营 ROI 敏感，建议补充同业转化数据和成本测算。' }
    ],
    strategies: [
      { title: '制造业售后场景推进策略', steps: ['确认设备档案和工单系统现状', '演示移动工单闭环流程', '提供 30 天上线计划和预算拆分'] },
      { title: '医疗集团续购策略', steps: ['邀请客户成功团队复盘一期效果', '提交数据安全和权限审计说明', '将二期合同拆分为基础包和增购包'] }
    ]
  });
});

function registerResourceRoutes(resource, permissionPrefix, enrich = withCreator) {
  app.get(`/api/${resource}`, authenticateToken, hasPermission(`${permissionPrefix}_READ`), (req, res) => {
    const rows = filterRowsForUser(store[resource], req.user);
    res.json(paginate(enrich(rows), req.query.page, req.query.limit));
  });

  app.get(`/api/${resource}/:id`, authenticateToken, hasPermission(`${permissionPrefix}_READ`), (req, res) => {
    const id = Number(req.params.id);
    const item = store[resource].find(row => row.id === id);
    if (!item) return res.status(404).json({ error: '数据不存在' });
    if (!canAccessRow(item, req.user)) return res.status(403).json({ error: '权限不足' });
    res.json(enrich([item])[0]);
  });

  app.post(`/api/${resource}`, authenticateToken, hasPermission(`${permissionPrefix}_CREATE`), (req, res) => {
    const row = {
      id: nextId(store[resource]),
      ...req.body,
      created_by: req.user.id,
      created_at: now()
    };
    if (resource === 'quotes' && Array.isArray(row.items)) row.items = JSON.stringify(row.items);
    store[resource].unshift(row);
    savePersistentStore();
    res.status(201).json(row);
  });

  app.put(`/api/${resource}/:id`, authenticateToken, hasPermission(`${permissionPrefix}_EDIT`), (req, res) => {
    const id = Number(req.params.id);
    const index = store[resource].findIndex(row => row.id === id);
    if (index === -1) return res.status(404).json({ error: '数据不存在' });
    if (!canAccessRow(store[resource][index], req.user)) return res.status(403).json({ error: '权限不足' });
    store[resource][index] = { ...store[resource][index], ...req.body, id };
    if (resource === 'quotes' && Array.isArray(store[resource][index].items)) {
      store[resource][index].items = JSON.stringify(store[resource][index].items);
    }
    savePersistentStore();
    res.json(store[resource][index]);
  });

  app.delete(`/api/${resource}/:id`, authenticateToken, hasPermission(`${permissionPrefix}_DELETE`), (req, res) => {
    const id = Number(req.params.id);
    const index = store[resource].findIndex(row => row.id === id);
    if (index === -1) return res.status(404).json({ error: '数据不存在' });
    if (!canAccessRow(store[resource][index], req.user)) return res.status(403).json({ error: '权限不足' });
    store[resource].splice(index, 1);
    savePersistentStore();
    res.json({ message: '删除成功' });
  });
}

registerResourceRoutes('leads', 'LEAD', withCreator);
registerResourceRoutes('customers', 'CUSTOMER', enrichCustomers);
registerResourceRoutes('quotes', 'QUOTE', enrichQuotes);
registerResourceRoutes('contracts', 'CONTRACT', enrichContracts);

app.post('/api/export/:resource', authenticateToken, (req, res) => {
  const resource = req.params.resource;
  const exportPermissionMap = {
    leads: 'LEAD_EXPORT',
    customers: 'CUSTOMER_EXPORT',
    quotes: 'QUOTE_EXPORT',
    contracts: 'CONTRACT_EXPORT'
  };

  if (!exportPermissionMap[resource]) {
    return res.status(404).json({ error: '不支持的导出资源' });
  }

  if (!req.user.permissions.some(permission => permission.code === exportPermissionMap[resource])) {
    return res.status(403).json({ error: '权限不足' });
  }

  const rows = filterRowsForUser(store[resource], req.user);
  const columns = Object.keys(rows[0] || {});
  const csv = [
    columns.join(','),
    ...rows.map(row => columns.map(column => {
      const value = row[column] == null ? '' : String(row[column]).replace(/"/g, '""');
      return `"${value}"`;
    }).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${resource}.csv"`);
  res.send('\ufeff' + csv);
});

app.post('/api/ai/analyze', authenticateToken, hasPermission('AI_ANALYZE'), (req, res) => {
  res.json({
    insights: ['该线索行业匹配度高，预计转化周期 2-3 周。', '建议补充 ROI 测算和同业案例。'],
    suggestions: ['安排产品演示', '发送行业解决方案', '邀请销售经理共同跟进']
  });
});

app.post(
  '/api/audio/upload',
  authenticateToken,
  hasPermission('AUDIO_UPLOAD'),
  express.raw({ type: ['audio/*', 'application/octet-stream'], limit: '30mb' }),
  (req, res) => {
    if (req.is('multipart/form-data')) {
      return res.status(415).json({
        error: 'multipart/form-data is not enabled in this lightweight runtime; use application/json or audio/octet-stream with metadata headers'
      });
    }

    const payload = normalizeAudioUpload(req);
    if (!payload.customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const customer = getAccessibleCustomer(payload.customer_id, req.user);
    if (customer === null) return res.status(404).json({ error: 'customer not found' });
    if (customer === false) return res.status(403).json({ error: 'permission denied' });

    const upload = {
      ...payload,
      job_id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: req.user.id,
      status: 'queued',
      created_at: now()
    };

    store.audioUploads.unshift(upload);
    enqueueAudioUpload(upload);

    res.status(202).json({
      job_id: upload.job_id,
      status: upload.status,
      customer_id: upload.customer_id,
      queue_size: store.audioQueue.length
    });
  }
);

app.get('/api/audio/jobs/:jobId', authenticateToken, hasPermission('AUDIO_UPLOAD'), (req, res) => {
  const upload = store.audioUploads.find(item => item.job_id === req.params.jobId);
  if (!upload) return res.status(404).json({ error: 'job not found' });

  const customer = getAccessibleCustomer(upload.customer_id, req.user);
  if (customer === false) return res.status(403).json({ error: 'permission denied' });

  res.json(upload);
});

app.get('/api/customers/:id/ai-insights', authenticateToken, hasPermission('CUSTOMER_READ'), (req, res) => {
  const customer = getAccessibleCustomer(req.params.id, req.user);
  if (customer === null) return res.status(404).json({ error: 'customer not found' });
  if (customer === false) return res.status(403).json({ error: 'permission denied' });

  res.json({
    customer: {
      id: customer.id,
      name: customer.name,
      intent_score: customer.intent_score || 0,
      ai_tags: customer.ai_tags || [],
      ai_timeline: customer.ai_timeline || []
    },
    ...buildCustomerInsights(customer.id)
  });
});

app.get('/api/roles', authenticateToken, hasPermission('ROLE_MANAGE'), (req, res) => res.json(roles));
app.get('/api/permissions', authenticateToken, hasPermission('ROLE_MANAGE'), (req, res) => res.json(permissions));
app.get('/api/users', authenticateToken, hasPermission('USER_MANAGE'), (req, res) => {
  res.json(users.map(user => ({ ...publicUser(user), roles: getUserProfile(user).roles })));
});

app.get('/', (req, res) => {
  res.json({ message: 'AI 销售管理系统 API 服务运行中' });
});

const server = app.listen(PORT, () => {
  console.log(`AI 销售管理系统后端服务运行在 http://localhost:${PORT}`);
  console.log('测试账号: admin / admin123');
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
