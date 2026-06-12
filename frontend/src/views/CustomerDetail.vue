<template>
  <div class="customer-detail-container">
    <div class="detail-header">
      <div class="back-button" @click="$router.go(-1)">
        ← 返回
      </div>
      <div class="customer-info" v-if="customer">
        <div class="customer-avatar">{{ getInitials(customer.name) }}</div>
        <div class="info-text">
          <h1>{{ customer.name }}</h1>
          <p>{{ customer.contactPerson || '' }} • {{ getCustomerTypeLabel(customer.type) }}</p>
        </div>
      </div>
      <div class="header-actions" v-if="customer">
        <button class="btn btn-secondary" @click="editCustomer">
          <span class="btn-icon">✏️</span>
          编辑客户
        </button>
        <button class="btn btn-primary" @click="contactCustomer">
          <span class="btn-icon">📞</span>
          联系客户
        </button>
      </div>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="error" v-else-if="error">{{ error }}</div>
    <template v-else-if="customer">
      <div class="detail-tabs">
        <button :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">客户概览</button>
        <button :class="{ active: activeTab === 'ai' }" @click="activeTab = 'ai'">AI 洞察</button>
      </div>

    <div class="detail-content" v-if="activeTab === 'overview'">
      <div class="left-panel">
        <div class="section-card">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>客户类型</label>
              <span>{{ getCustomerTypeLabel(customer.type) }}</span>
            </div>
            <div class="info-item">
              <label>所属行业</label>
              <span>{{ getIndustryLabel(customer.industry) }}</span>
            </div>
            <div class="info-item">
              <label>客户状态</label>
              <span class="status-badge" :class="customer.status">{{ customer.status }}</span>
            </div>
            <div class="info-item">
              <label>联系电话</label>
              <span>{{ customer.phone }}</span>
            </div>
            <div class="info-item">
              <label>电子邮箱</label>
              <span>{{ customer.email }}</span>
            </div>
            <div class="info-item">
              <label>地址</label>
              <span>{{ customer.address || '未填写' }}</span>
            </div>
            <div class="info-item">
              <label>成立日期</label>
              <span>{{ customer.foundedDate || '未填写' }}</span>
            </div>
            <div class="info-item">
              <label>员工数量</label>
              <span>{{ customer.employeeCount || '未填写' }}</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h2>业务统计</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">¥{{ formatCurrency(customer.totalDealValue || 0) }}</div>
              <div class="stat-label">总交易额</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ customer.contractCount || 0 }}</div>
              <div class="stat-label">合同数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ customer.quoteCount || 0 }}</div>
              <div class="stat-label">报价数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ customer.orderCount || 0 }}</div>
              <div class="stat-label">订单数量</div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="section-card">
          <div class="section-header">
            <h2>最近活动</h2>
            <button class="btn btn-small btn-outline" @click="addActivity">
              添加活动
            </button>
          </div>
          <div class="activity-timeline" v-if="activities.length">
            <div class="activity-item" v-for="(activity, index) in activities" :key="index">
              <div class="activity-date">{{ formatDate(activity.date) }}</div>
              <div class="activity-content">
                <div class="activity-icon" :class="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-details">
                  <h4>{{ activity.title }}</h4>
                  <p>{{ activity.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>暂无活动记录</div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h2>关联报价单</h2>
            <button class="btn btn-small btn-outline" @click="createQuote">
              创建报价
            </button>
          </div>
          <div class="list-table">
            <div class="table-header">
              <div class="col-id">编号</div>
              <div class="col-date">日期</div>
              <div class="col-amount">金额</div>
              <div class="col-status">状态</div>
              <div class="col-action">操作</div>
            </div>
            <div 
              class="table-row" 
              v-for="quote in quotes" 
              :key="quote.id"
              @click="viewQuote(quote.id)">
              <div class="col-id">#{{ quote.id }}</div>
              <div class="col-date">{{ formatDate(quote.date) }}</div>
              <div class="col-amount">¥{{ formatCurrency(quote.amount) }}</div>
              <div class="col-status">
                <span class="status-badge small" :class="quote.status">{{ quote.status }}</span>
              </div>
              <div class="col-action">
                <button class="btn btn-xs btn-outline" @click.stop="viewQuote(quote.id)">查看</button>
              </div>
            </div>
            <div class="empty-state" v-if="quotes.length === 0">
              暂无关联报价单
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h2>关联合同</h2>
            <button class="btn btn-small btn-outline" @click="createContract">
              创建合同
            </button>
          </div>
          <div class="list-table">
            <div class="table-header">
              <div class="col-id">编号</div>
              <div class="col-date">签订日期</div>
              <div class="col-amount">金额</div>
              <div class="col-status">状态</div>
              <div class="col-action">操作</div>
            </div>
            <div 
              class="table-row" 
              v-for="contract in contracts" 
              :key="contract.id"
              @click="viewContract(contract.id)">
              <div class="col-id">#{{ contract.id }}</div>
              <div class="col-date">{{ formatDate(contract.signDate) }}</div>
              <div class="col-amount">¥{{ formatCurrency(contract.amount) }}</div>
              <div class="col-status">
                <span class="status-badge small" :class="contract.status">{{ contract.status }}</span>
              </div>
              <div class="col-action">
                <button class="btn btn-xs btn-outline" @click.stop="viewContract(contract.id)">查看</button>
              </div>
            </div>
            <div class="empty-state" v-if="contracts.length === 0">
              暂无关联合同
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ai-insights-content" v-else>
      <div class="section-card ai-summary-card">
        <div class="section-header">
          <h2>AI 洞察</h2>
          <button class="btn btn-small btn-outline" @click="loadAiInsights">刷新</button>
        </div>
        <div class="ai-score-row">
          <div class="ai-score">
            <span>{{ aiCustomer.intent_score || 0 }}</span>
            <label>意向评分</label>
          </div>
          <div class="ai-tags">
            <span v-for="tag in aiCustomer.ai_tags || []" :key="tag">{{ tag }}</span>
            <em v-if="!aiCustomer.ai_tags || aiCustomer.ai_tags.length === 0">暂无标签</em>
          </div>
        </div>
      </div>

      <div class="section-card" v-if="latestAnalysis">
        <h2>最近分析结果</h2>
        <p class="ai-summary">{{ latestAnalysis.analysis.summary }}</p>
        <div class="insight-grid">
          <div>
            <label>意向等级</label>
            <strong>{{ latestAnalysis.analysis.intent_level }}</strong>
          </div>
          <div>
            <label>客户情绪</label>
            <strong>{{ latestAnalysis.analysis.sentiment.customer }}</strong>
          </div>
          <div>
            <label>销售状态</label>
            <strong>{{ latestAnalysis.analysis.sentiment.sales }}</strong>
          </div>
        </div>
        <div class="insight-columns">
          <div>
            <h3>需求标签</h3>
            <ul>
              <li v-for="tag in latestAnalysis.analysis.demand_tags" :key="tag">{{ tag }}</li>
            </ul>
          </div>
          <div>
            <h3>痛点</h3>
            <ul>
              <li v-for="point in latestAnalysis.analysis.pain_points" :key="point">{{ point }}</li>
            </ul>
          </div>
          <div>
            <h3>竞品</h3>
            <ul>
              <li v-for="competitor in latestAnalysis.analysis.competitors" :key="competitor">{{ competitor }}</li>
              <li v-if="latestAnalysis.analysis.competitors.length === 0">未提及</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h2>建议动作</h2>
        <div class="action-list" v-if="suggestedActions.length">
          <div class="action-item" v-for="action in suggestedActions" :key="action">{{ action }}</div>
        </div>
        <div class="empty-state" v-else>暂无建议动作</div>
      </div>

      <div class="section-card">
        <h2>意向趋势</h2>
        <div class="trend-list" v-if="intentTrend.length">
          <div class="trend-item" v-for="point in intentTrend" :key="point.date">
            <span>{{ formatDate(point.date) }}</span>
            <div class="trend-bar"><i :style="{ width: `${point.intent_score}%` }"></i></div>
            <strong>{{ point.intent_score }}</strong>
          </div>
        </div>
        <div class="empty-state" v-else>暂无趋势数据</div>
      </div>

      <div class="section-card">
        <h2>分析历史</h2>
        <div class="analysis-history" v-if="aiAnalyses.length">
          <div class="history-item" v-for="record in aiAnalyses" :key="record.id">
            <div>
              <strong>{{ formatDate(record.completed_at || record.created_at) }}</strong>
              <p>{{ record.analysis.summary }}</p>
            </div>
            <span>{{ record.analysis.intent_score }}分</span>
          </div>
        </div>
        <div class="empty-state" v-else>暂无通话分析记录</div>
      </div>
    </div>
    </template>
  </div>
</template>

<script>
import { api } from '../utils/api';

export default {
  name: 'CustomerDetail',
  data() {
    return {
      loading: true,
      error: '',
      customer: null,
      activeTab: 'overview',
      aiCustomer: {},
      latestAnalysis: null,
      aiAnalyses: [],
      intentTrend: [],
      suggestedActions: [],
      activities: [],
      quotes: [],
      contracts: []
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = '';
      try {
        const customerId = this.$route.params.id;
        // 从后端 API 加载客户详情
        const [customerResponse, quotesResponse, contractsResponse, aiResponse] = await Promise.all([
          api.customers.getById(customerId),
          api.quotes.getAll(1, 100),
          api.contracts.getAll(1, 100),
          api.customers.getAiInsights(customerId)
        ]);

        if (customerResponse && customerResponse.ok) {
          const customer = await customerResponse.json();
          const quotesData = quotesResponse && quotesResponse.ok ? await quotesResponse.json() : { data: [] };
          const contractsData = contractsResponse && contractsResponse.ok ? await contractsResponse.json() : { data: [] };
          const aiData = aiResponse && aiResponse.ok ? await aiResponse.json() : null;

          this.customer = customer;
          this.applyAiInsights(aiData);
          this.quotes = (quotesData.data || []).filter(quote => Number(quote.customer_id) === Number(customerId));
          this.contracts = (contractsData.data || []).filter(contract => Number(contract.customer_id) === Number(customerId));
          this.activities = [
            {
              type: 'call',
              title: '客户跟进',
              description: `${customer.contactPerson || customer.name} 已确认下一步沟通安排`,
              date: customer.created_at || new Date().toISOString()
            },
            ...this.quotes.slice(0, 2).map(quote => ({
              type: 'email',
              title: '报价沟通',
              description: `报价 #${quote.id}，金额 ¥${this.formatCurrency(quote.amount)}`,
              date: quote.created_at || new Date().toISOString()
            }))
          ];
        } else {
          this.error = '加载数据失败';
        }
      } catch (err) {
        this.error = '加载数据失败';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async loadAiInsights() {
      if (!this.customer) return;
      const response = await api.customers.getAiInsights(this.customer.id);
      if (response && response.ok) {
        this.applyAiInsights(await response.json());
      }
    },
    applyAiInsights(data) {
      this.aiCustomer = data?.customer || {};
      this.latestAnalysis = data?.latest || null;
      this.aiAnalyses = data?.analyses || [];
      this.intentTrend = data?.trend || [];
      this.suggestedActions = data?.suggested_actions || [];
    },
    getInitials(name) {
      if (!name) return '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    getCustomerTypeLabel(type) {
      const types = {
        enterprise: '企业客户',
        government: '政府机构',
        education: '教育机构',
        individual: '个人客户'
      };
      return types[type] || type;
    },
    getIndustryLabel(industry) {
      const industries = {
        tech: '科技',
        finance: '金融',
        healthcare: '医疗',
        education: '教育',
        retail: '零售',
        energy: '能源',
        other: '其他'
      };
      return industries[industry] || industry;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    formatCurrency(amount) {
      return Number(amount || 0).toLocaleString('zh-CN');
    },
    getActivityIcon(type) {
      const icons = {
        call: '📞',
        meeting: '👥',
        email: '📧',
        signing: '✍️',
        visit: '🏢',
        task: '✅'
      };
      return icons[type] || '📝';
    },
    editCustomer() {
      if (this.customer) {
        this.$router.push(`/customers/edit/${this.customer.id}`);
      }
    },
    contactCustomer() {
      alert(`正在联系客户 ${this.customer?.name || ''}`);
    },
    addActivity() {
      alert('添加活动功能');
    },
    createQuote() {
      if (this.customer) {
        this.$router.push(`/quotes/add?customerId=${this.customer.id}`);
      }
    },
    createContract() {
      if (this.customer) {
        this.$router.push(`/contracts/add?customerId=${this.customer.id}`);
      }
    },
    viewQuote(quoteId) {
      this.$router.push(`/quotes/${quoteId}`);
    },
    viewContract(contractId) {
      this.$router.push(`/contracts/${contractId}`);
    }
  }
}
</script>

<style scoped>
.customer-detail-container {
  padding: 0;
  width: 100%;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.back-button {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #f8f9fa;
  color: #4361ee;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.customer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
}

.info-text h1 {
  margin: 0 0 5px 0;
  color: #212529;
  font-size: 1.5rem;
}

.info-text p {
  margin: 0;
  color: #6c757d;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.detail-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  border-bottom: 1px solid #dee2e6;
}

.detail-tabs button {
  border: 0;
  background: transparent;
  padding: 12px 18px;
  color: #6c757d;
  cursor: pointer;
  font-weight: 600;
  border-bottom: 3px solid transparent;
}

.detail-tabs button.active {
  color: #4361ee;
  border-bottom-color: #4361ee;
}

.ai-insights-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

.ai-score-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.ai-score {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee, #4cc9f0);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-score span {
  font-size: 2rem;
  font-weight: 800;
}

.ai-score label {
  font-size: 0.8rem;
}

.ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-tags span {
  padding: 6px 10px;
  background: #eef2ff;
  color: #3446c5;
  border-radius: 16px;
  font-size: 0.85rem;
}

.ai-tags em {
  color: #6c757d;
  font-style: normal;
}

.ai-summary {
  color: #495057;
  line-height: 1.7;
  margin: 12px 0 18px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.insight-grid div {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
}

.insight-grid label {
  display: block;
  color: #6c757d;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.insight-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.insight-columns h3 {
  margin: 0 0 10px;
  font-size: 0.95rem;
  color: #212529;
}

.insight-columns ul {
  margin: 0;
  padding-left: 18px;
  color: #495057;
}

.action-list {
  display: grid;
  gap: 10px;
}

.action-item {
  padding: 12px 14px;
  border-left: 4px solid #4361ee;
  background: #f8f9fa;
  border-radius: 8px;
}

.trend-list,
.analysis-history {
  display: grid;
  gap: 12px;
}

.trend-item,
.history-item {
  display: grid;
  grid-template-columns: 120px 1fr 52px;
  align-items: center;
  gap: 12px;
}

.trend-bar {
  height: 10px;
  background: #e9ecef;
  border-radius: 999px;
  overflow: hidden;
}

.trend-bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #4cc9f0);
}

.history-item {
  grid-template-columns: 1fr 64px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.history-item p {
  margin: 4px 0 0;
  color: #6c757d;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-card h2 {
  margin: 0;
  color: #212529;
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-item span {
  color: #212529;
  font-size: 0.95rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.prospect {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.sent {
  background: #cce5ff;
  color: #004085;
}

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.expired {
  background: #fff3cd;
  color: #856404;
}

.status-badge.small {
  padding: 2px 8px;
  font-size: 0.7rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  background: #f8f9fa;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4361ee;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
}

.activity-date {
  width: 80px;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
  padding-top: 5px;
}

.activity-content {
  display: flex;
  gap: 10px;
  flex: 1;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-icon.call {
  background: rgba(67, 97, 238, 0.2);
  color: #4361ee;
}

.activity-icon.meeting {
  background: rgba(76, 201, 240, 0.2);
  color: #4cc9f0;
}

.activity-icon.email {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.activity-icon.signing {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.activity-details h4 {
  margin: 0 0 5px 0;
  color: #212529;
  font-size: 1rem;
}

.activity-details p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.list-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  background: #f8f9fa;
  padding: 12px 15px;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  border-bottom: 1px solid #e9ecef;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background 0.3s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #f8f9fa;
}

.col-id, .col-date, .col-amount, .col-status, .col-action {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #212529;
}

.col-action {
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-size: 0.9rem;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.btn-small {
  padding: 6px 10px;
  font-size: 0.85rem;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover {
  background: #3a0ca3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ced4da;
  color: #495057;
}

.btn-outline:hover {
  background: #f8f9fa;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "id date"
      "amount status"
      "action action";
  }
  
  .col-id { grid-area: id; }
  .col-date { grid-area: date; }
  .col-amount { grid-area: amount; }
  .col-status { grid-area: status; }
  .col-action { grid-area: action; }
}

@media (max-width: 768px) {
  .customer-detail-container {
    padding: 10px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    text-align: center;
  }
  
  .customer-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .activity-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .activity-date {
    width: auto;
    text-align: left;
  }
  
  .activity-content {
    flex-direction: column;
    gap: 5px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .table-header,
  .table-row {
    font-size: 0.85em;
  }
  
  .btn {
    padding: 6px 10px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .detail-header {
    padding: 15px;
  }
  
  .customer-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .info-text h1 {
    font-size: 1.2rem;
  }
  
  .section-card {
    padding: 20px;
  }
  
  .section-card h2 {
    font-size: 1.1rem;
  }
  
  .stat-number {
    font-size: 1.2rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .table-header,
  .table-row {
    font-size: 0.8em;
    padding: 10px;
  }
  
  .btn {
    padding: 5px 8px;
    font-size: 12px;
  }
  
  .btn-xs {
    padding: 3px 6px;
    font-size: 0.75rem;
  }
  
  .activity-details h4 {
    font-size: 0.95rem;
  }
  
  .activity-details p {
    font-size: 0.85rem;
  }
}
</style>
