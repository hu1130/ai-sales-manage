<template>
  <div class="reports-container">
    <div class="reports-header">
      <h1>报表中心</h1>
      <div class="date-filter">
        <select v-model="selectedPeriod">
          <option value="today">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="quarter">本季度</option>
          <option value="year">本年</option>
        </select>
      </div>
    </div>

    <div class="loading" v-if="loading">加载数据中...</div>
    <div class="error" v-else-if="error">{{ error }}</div>
    <div v-else>
      <div class="reports-grid">
        <div class="report-card">
          <h3>销售额趋势</h3>
          <div class="chart-container">
            <canvas ref="salesChart"></canvas>
          </div>
        </div>

        <div class="report-card">
          <h3>客户转化率</h3>
          <div class="chart-container">
            <canvas ref="conversionChart"></canvas>
          </div>
        </div>

        <div class="report-card">
          <h3>合同完成情况</h3>
          <div class="chart-container">
            <canvas ref="contractChart"></canvas>
          </div>
        </div>

        <div class="report-card">
          <h3>团队业绩排名</h3>
          <div class="chart-container">
            <canvas ref="rankingChart"></canvas>
          </div>
        </div>
      </div>

      <div class="data-table-section">
        <h3>详细数据</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>销售额</th>
              <th>新增客户</th>
              <th>转化率</th>
              <th>合同数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData" :key="item.date">
              <td>{{ item.date }}</td>
              <td>¥{{ Number(item.sales || 0).toLocaleString() }}</td>
              <td>{{ item.newCustomers }}</td>
              <td>{{ item.conversionRate }}%</td>
              <td>{{ item.contracts }}</td>
            </tr>
            <tr v-if="reportData.length === 0">
              <td colspan="5" class="empty-cell">暂无报表数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { api } from '../utils/api';

Chart.register(...registerables);

export default {
  name: 'Reports',
  data() {
    return {
      selectedPeriod: 'month',
      loading: true,
      error: '',
      reportData: [],
      salesChart: null,
      conversionChart: null,
      contractChart: null,
      rankingChart: null
    };
  },
  async mounted() {
    await this.loadData();
  },
  beforeUnmount() {
    this.clearCharts();
  },
  watch: {
    selectedPeriod() {
      this.loadData();
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = '';
      try {
        const response = await api.reports.get(this.selectedPeriod);
        if (!response || !response.ok) {
          throw new Error('加载报表数据失败');
        }

        const data = await response.json();
        this.reportData = data.reportData || [];
        this.$nextTick(() => this.initCharts(data));
      } catch (err) {
        this.error = err.message || '加载报表数据失败';
        this.initCharts({});
      } finally {
        this.loading = false;
      }
    },
    initCharts(data = {}) {
      this.clearCharts();
      this.createSalesChart(data.salesLabels || [], data.salesData || []);
      this.createConversionChart(data.conversionLabels || [], data.conversionData || []);
      this.createContractChart(data.contractLabels || [], data.contractData || []);
      this.createRankingChart(data.rankingLabels || [], data.rankingData || []);
    },
    createSalesChart(labels, values) {
      const ctx = this.$refs.salesChart?.getContext('2d');
      if (!ctx) return;
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '销售额',
            data: values,
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            tension: 0.35,
            fill: true
          }]
        },
        options: this.chartOptions(false)
      });
    },
    createConversionChart(labels, values) {
      const ctx = this.$refs.conversionChart?.getContext('2d');
      if (!ctx) return;
      this.conversionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['已转化', '跟进中', '新线索'],
          datasets: [{
            data: values.length ? values : [0, 0, 0],
            backgroundColor: ['#4cc9f0', '#4361ee', '#f72585']
          }]
        },
        options: this.chartOptions(true)
      });
    },
    createContractChart(labels, values) {
      const ctx = this.$refs.contractChart?.getContext('2d');
      if (!ctx) return;
      this.contractChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['已签署', '待签署', '草稿'],
          datasets: [{
            label: '合同数',
            data: values.length ? values : [0, 0, 0],
            backgroundColor: ['#4cc9f0', '#4361ee', '#3a0ca3']
          }]
        },
        options: this.chartOptions(false)
      });
    },
    createRankingChart(labels, values) {
      const ctx = this.$refs.rankingChart?.getContext('2d');
      if (!ctx) return;
      this.rankingChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '业绩',
            data: values,
            backgroundColor: '#4361ee'
          }]
        },
        options: {
          ...this.chartOptions(false),
          indexAxis: 'y'
        }
      });
    },
    chartOptions(showLegend) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'bottom'
          }
        },
        scales: showLegend ? undefined : {
          y: {
            beginAtZero: true
          }
        }
      };
    },
    clearCharts() {
      for (const key of ['salesChart', 'conversionChart', 'contractChart', 'rankingChart']) {
        if (this[key]) {
          this[key].destroy();
          this[key] = null;
        }
      }
    }
  }
};
</script>

<style scoped>
.reports-container {
  padding: 20px;
  width: 100%;
  min-height: 100%;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #dc3545;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.reports-header h1 {
  margin: 0;
  color: #212529;
  font-size: 1.8rem;
}

.date-filter select {
  padding: 8px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.report-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.report-card h3 {
  margin: 0 0 20px;
  color: #212529;
  font-size: 1.2rem;
}

.chart-container {
  height: 250px;
  position: relative;
}

.data-table-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.data-table-section h3 {
  margin: 0 0 20px;
  color: #212529;
  font-size: 1.2rem;
}

.empty-cell {
  text-align: center;
  color: #6c757d;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .reports-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .date-filter select {
    align-self: flex-end;
  }
}
</style>
