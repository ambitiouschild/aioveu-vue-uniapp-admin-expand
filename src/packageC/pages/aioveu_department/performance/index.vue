<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 绩效记录ID -->
        <view class="filter-item">
          <text class="filter-label">绩效记录ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入绩效记录ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 员工 -->
        <view class="filter-item">
          <text class="filter-label">员工</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="employeeName"
            :value="employeeIndex"
            @change="onEmployeeChange"
          >
            <view class="picker-view">
              {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择员工' }}
            </view>
          </picker>
        </view>

        <!-- 考核年份 -->
        <view class="filter-item">
          <text class="filter-label">考核年份</text>
          <input
            type="number"
            class="filter-input"
            placeholder="请输入考核年份"
            v-model="queryParams.periodYear"
            @confirm="handleQuery"
          />
        </view>

        <!-- 考核季度 -->
        <view class="filter-item">
          <text class="filter-label">考核季度</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="periodQuarterOptions"
            range-key="label"
            :value="quarterIndex"
            @change="onQuarterChange"
          >
            <view class="picker-view">
              {{ quarterIndex >= 0 ? periodQuarterOptions[quarterIndex].label : '请选择季度' }}
            </view>
          </picker>
        </view>

        <!-- KPI评分 -->
        <view class="filter-item">
          <text class="filter-label">KPI评分</text>
          <input
            type="number"
            class="filter-input"
            placeholder="请输入KPI评分(1-100)"
            v-model="queryParams.kpiScore"
            @confirm="handleQuery"
          />
        </view>

        <!-- 绩效等级 -->
        <view class="filter-item">
          <text class="filter-label">绩效等级</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="performanceGradeOptions"
            range-key="label"
            :value="gradeIndex"
            @change="onGradeChange"
          >
            <view class="picker-view">
              {{ gradeIndex >= 0 ? performanceGradeOptions[gradeIndex].label : '请选择绩效等级' }}
            </view>
          </picker>
        </view>

        <view class="filter-buttons">
          <button class="filter-btn reset" @click="handleResetQuery">重置</button>
          <button class="filter-btn confirm" @click="handleQuery">搜索</button>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button
        :v-has-perm="['aioveuPerformance:aioveuProcurement-performance:add']"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuPerformance:aioveuProcurement-performance:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 绩效列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无绩效数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="performance-card"
      >
        <view class="card-header">
          <text class="performance-id">ID: {{ item.id }}</text>
          <text class="employee-name">{{ item.employeeName }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">考核年份:</text>
            <text class="info-value">{{ item.periodYear }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">考核季度:</text>
            <text class="info-value">{{ getQuarterLabel(item.periodQuarter) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">KPI评分:</text>
            <text class="info-value">{{ item.kpiScore }}分</text>
          </view>

          <view class="info-row">
            <text class="info-label">生产率:</text>
            <text class="info-value">{{ item.productivity }}%</text>
          </view>

          <view class="info-row">
            <text class="info-label">绩效等级:</text>
            <text class="info-value">{{ getGradeLabel(item.performanceGrade) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">主管评语:</text>
            <text class="info-value">{{ item.review || '无' }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ item.createTime }}</text>
            <text>更新: {{ item.updateTime }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuPerformance:aioveuProcurement-performance:edit']"
              class="action-btn edit"
              @click="handleOpenDialog(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuPerformance:aioveuProcurement-performance:delete']"
              class="action-btn delete"
              @click="handleDelete(item.id)"
            >
              <text>🗑️</text>
              <text>删除</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view class="pagination" v-if="total > 0">
        <button
          class="pagination-btn"
          :disabled="queryParams.pageNum <= 1"
          @click="prevPage"
        >
          上一页
        </button>
        <text class="page-info">
          {{ queryParams.pageNum }} / {{ Math.ceil(total / queryParams.pageSize) }}
        </text>
        <button
          class="pagination-btn"
          :disabled="queryParams.pageNum * queryParams.pageSize >= total"
          @click="nextPage"
        >
          下一页
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AioveuPerformanceAPI, {
  AioveuPerformancePageVO,
  AioveuPerformancePageQuery
} from "@/packageC/api/aioveuPerformance/aioveu-performance";
import AioveuEmployeeAPI,{  EmployeeOptionVO } from "@/packageC/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuPerformancePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuPerformancePageVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const periodQuarterOptions = ref<DictItemOption[]>([]);
const performanceGradeOptions = ref<DictItemOption[]>([]);

const employeeIndex = ref(-1);
const quarterIndex = ref(-1);
const gradeIndex = ref(-1);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    queryParams.employeeName = employeeOptions.value[index].employeeName;
  }
};

// 季度选择变化
const onQuarterChange = (e: any) => {
  const index = e.detail.value;
  quarterIndex.value = index;
  if (periodQuarterOptions.value[index]) {
    queryParams.periodQuarter = Number(periodQuarterOptions.value[index].value);
  }
};

// 绩效等级选择变化
const onGradeChange = (e: any) => {
  const index = e.detail.value;
  gradeIndex.value = index;
  if (performanceGradeOptions.value[index]) {
    queryParams.performanceGrade =  performanceGradeOptions.value[index].value.toString() ;
  }
};

// 查询绩效
const handleQuery = () => {
  loading.value = true;
  AioveuPerformanceAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 重置查询
const handleResetQuery = () => {
  queryParams.pageNum = 1;
  queryParams.employeeName = '';
  queryParams.periodQuarter = undefined;
  queryParams.performanceGrade = '';

  employeeIndex.value = -1;
  quarterIndex.value = -1;
  gradeIndex.value = -1;

  pageData.value = [];
  handleQuery();
};

// 上一页
const prevPage = () => {
  if (queryParams.pageNum > 1) {
    queryParams.pageNum--;
    handleQuery();
  }
};

// 下一页
const nextPage = () => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    queryParams.pageNum++;
    handleQuery();
  }
};

// 行选择变化
const handleSelectionChange = (selection: AioveuPerformancePageVO[]) => {
  removeIds.value = selection
    .map(item => item.id)
    .filter((id): id is number => id !== undefined && id !== null) as number[];
};

const needRefresh = ref(false);

onShow(() => {
  if (needRefresh.value) {
    handleQuery();
    needRefresh.value = false;
  }
});

// 打开表单页
const handleOpenDialog = (id?: number) => {
  needRefresh.value = true; // 标记需要刷新
  let url = '/packageC/pages/aioveu_department/performance/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }
  console.log('跳转到:', url);
  uni.navigateTo({ url });
};

// 删除绩效
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的绩效记录",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的绩效记录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuPerformanceAPI.deleteByIds(ids.join(","))
          .then(() => {
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
            handleResetQuery();
          })
          .finally(() => uni.hideLoading());
      }
    }
  });
};

// 获取季度标签
const getQuarterLabel = (quarter: number) => {
  const item = periodQuarterOptions.value.find(i => Number(i.value) === quarter);
  return item ? item.label : '未知季度';
};

// 获取绩效等级标签
const getGradeLabel = (grade: string) => {
  const item = performanceGradeOptions.value.find(i => i.value === grade);
  return item ? item.label : '未知等级';
};

// 加载员工选项
const loadEmployees = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions()
    .then(response => {
      if (Array.isArray(response)) {
        employeeOptions.value = response.map(emp => ({
          employeeId: Number(emp.employeeId),
          employeeName: emp.employeeName
        }));
      }
    });
};

// 加载季度选项
const loadPeriodQuarterOptions = () => {
  DictAPI.getDictItems('performance_period_quarter')
    .then(response => {
      periodQuarterOptions.value = response;
    });
};

// 加载绩效等级选项
const loadPerformanceGradeOptions = () => {
  DictAPI.getDictItems('performance_grade')
    .then(response => {
      performanceGradeOptions.value = response;
    });
};

onMounted(() => {
  handleQuery();
  loadEmployees();
  loadPeriodQuarterOptions();
  loadPerformanceGradeOptions();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 筛选区域 */
.search-container {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #eaeaea;
}

.filter-content {
  padding: 24rpx;
}

.filter-item {
  margin-bottom: 32rpx;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.filter-input, .filter-picker {
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  width: 100%;
  background-color: white;
}

.picker-view {
  height: 44rpx;
  line-height: 44rpx;
}

.filter-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
}

.filter-btn {
  flex: 1;
  margin: 0 12rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
  padding: 20rpx 0;
  border: none;

  &.reset {
    background-color: #f5f5f5;
    color: #666;
  }

  &.confirm {
    background-color: #5e72e4;
    color: white;
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;

  &.add {
    background: #2dce89;
    color: white;
  }

  &.delete {
    background: #f5365c;
    color: white;

    &[disabled] {
      background: #cccccc;
      opacity: 0.7;
    }
  }
}

/* 绩效列表 */
.list-container {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-state {
  padding: 60rpx;
  text-align: center;
  color: #666;
  font-size: 28rpx;
}

.empty-state {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #666;

  .empty-icon {
    font-size: 100rpx;
    color: #cbd5e0;
    margin-bottom: 24rpx;
    display: block;
  }

  .empty-text {
    font-size: 32rpx;
  }
}

.performance-card {
  border-bottom: 1rpx solid #f1f1f1;
  padding: 32rpx;

  &:last-child {
    border-bottom: none;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .performance-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .employee-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a1a1a;
  }
}

.card-content {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 30rpx;

  .info-label {
    color: #666;
    width: 180rpx;
    font-weight: 500;
  }

  .info-value {
    color: #333;
    flex: 1;
  }
}

.card-footer {
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f1f1;

  .time-info {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .action-buttons {
    display: flex;
    gap: 24rpx;
    margin: 0;

    .action-btn {
      padding: 16rpx 0;
      font-size: 26rpx;
    }
  }
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-top: 1rpx solid #f1f1f1;

  .pagination-btn {
    flex: 1;
    margin: 0 16rpx;
    padding: 20rpx 0;
    border-radius: 12rpx;
    font-size: 28rpx;
    background: #f8f9fa;
    color: #333;

    &[disabled] {
      opacity: 0.5;
    }
  }

  .page-info {
    font-size: 28rpx;
    color: #666;
  }
}
</style>
