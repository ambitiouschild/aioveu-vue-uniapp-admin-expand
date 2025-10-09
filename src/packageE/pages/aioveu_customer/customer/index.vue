<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 客户ID -->
        <view class="filter-item">
          <text class="filter-label">客户ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入客户ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 客户编号 -->
        <view class="filter-item">
          <text class="filter-label">客户编号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入客户编号"
            v-model="queryParams.customerNo"
            @confirm="handleQuery"
          />
        </view>

        <!-- 客户名称 -->
        <view class="filter-item">
          <text class="filter-label">客户名称</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="customerOptions"
            range-key="customerName"
            :value="customerIndex"
            @change="onCustomerChange"
          >
            <view class="picker-view">
              {{ customerIndex >= 0 ? customerOptions[customerIndex].customerName : '请选择客户' }}
            </view>
          </picker>
        </view>

        <!-- 客户类型 -->
        <view class="filter-item">
          <text class="filter-label">客户类型</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="typeOptions"
            range-key="label"
            :value="typeIndex"
            @change="onTypeChange"
          >
            <view class="picker-view">
              {{ typeIndex >= 0 ? typeOptions[typeIndex].label : '请选择类型' }}
            </view>
          </picker>
        </view>

        <!-- 信用等级 -->
        <view class="filter-item">
          <text class="filter-label">信用等级</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="creditRatingOptions"
            range-key="label"
            :value="creditRatingIndex"
            @change="onCreditRatingChange"
          >
            <view class="picker-view">
              {{ creditRatingIndex >= 0 ? creditRatingOptions[creditRatingIndex].label : '请选择等级' }}
            </view>
          </picker>
        </view>

        <!-- 客户状态 -->
        <view class="filter-item">
          <text class="filter-label">客户状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="customerStatusOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? customerStatusOptions[statusIndex].label : '请选择状态' }}
            </view>
          </picker>
        </view>

        <!-- 所在城市 -->
        <view class="filter-item">
          <text class="filter-label">所在城市</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入所在城市"
            v-model="queryParams.city"
            @confirm="handleQuery"
          />
        </view>

        <!-- 所在省份 -->
        <view class="filter-item">
          <text class="filter-label">所在省份</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入所在省份"
            v-model="queryParams.province"
            @confirm="handleQuery"
          />
        </view>

        <!-- 联系电话 -->
        <view class="filter-item">
          <text class="filter-label">联系电话</text>
          <input
            type="tel"
            class="filter-input"
            placeholder="请输入联系电话"
            v-model="queryParams.phone"
            @confirm="handleQuery"
          />
        </view>

        <!-- 客户来源 -->
        <view class="filter-item">
          <text class="filter-label">客户来源</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="sourceOptions"
            range-key="label"
            :value="sourceIndex"
            @change="onSourceChange"
          >
            <view class="picker-view">
              {{ sourceIndex >= 0 ? sourceOptions[sourceIndex].label : '请选择来源' }}
            </view>
          </picker>
        </view>

        <!-- 负责人 -->
        <view class="filter-item">
          <text class="filter-label">负责人</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="employeeName"
            :value="employeeIndex"
            @change="onEmployeeChange"
          >
            <view class="picker-view">
              {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择负责人' }}
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
        :v-has-perm ="(['aioveuCustomer:aioveu-customer:add'])"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm ="(['aioveuCustomer:aioveu-customer:delete'])"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 客户列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">👤</text>
        <text class="empty-text">暂无客户数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="customer-card"
      >
        <view class="card-header">
          <text class="customer-id">ID: {{ item.id }}</text>
          <text class="customer-name">{{ item.name }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">编号:</text>
            <text class="info-value">{{ item.customerNo }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">类型:</text>
            <text class="info-value">{{ getTypeLabel(item.type) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">信用等级:</text>
            <text class="info-value">{{ getCreditRatingLabel(item.creditRating) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">状态:</text>
            <text class="info-value">{{ getStatusLabel(item.customerStatus) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">城市:</text>
            <text class="info-value">{{ item.city }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">省份:</text>
            <text class="info-value">{{ item.province }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">电话:</text>
            <text class="info-value">{{ item.phone }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">来源:</text>
            <text class="info-value">{{ getSourceLabel(item.source) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">负责人:</text>
            <text class="info-value">{{ item.salesRepName }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ item.createTime }}</text>
            <text>更新: {{ item.updateTime }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm ="['aioveuCustomer:aioveu-customer:edit']"
              class="action-btn edit"
              @click="handleOpenDialog(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm ="['aioveuCustomer:aioveu-customer:delete']"
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
import { onLoad } from '@dcloudio/uni-app';
import AioveuCustomerAPI, {
  AioveuCustomerPageVO,
  AioveuCustomerPageQuery,
  CustomerOptionVO
} from "@/packageE/api/aioveuCustomer/aioveu-customer";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageE/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuCustomerPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuCustomerPageVO[]>([]);
const customerOptions = ref<CustomerOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const typeOptions = ref<DictItemOption[]>([]);
const creditRatingOptions = ref<DictItemOption[]>([]);
const customerStatusOptions = ref<DictItemOption[]>([]);
const sourceOptions = ref<DictItemOption[]>([]);

const customerIndex = ref(-1);
const employeeIndex = ref(-1);
const typeIndex = ref(-1);
const creditRatingIndex = ref(-1);
const statusIndex = ref(-1);
const sourceIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingCustomerId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 客户选择变化
const onCustomerChange = (e: any) => {
  const index = e.detail.value;
  customerIndex.value = index;
  if (customerOptions.value[index]) {
    queryParams.name = customerOptions.value[index].customerName;
  }
};

// 类型选择变化
const onTypeChange = (e: any) => {
  const index = e.detail.value;
  typeIndex.value = index;
  if (typeOptions.value[index]) {
    queryParams.type = Number(typeOptions.value[index].value);
  }
};

// 信用等级选择变化
const onCreditRatingChange = (e: any) => {
  const index = e.detail.value;
  creditRatingIndex.value = index;
  if (creditRatingOptions.value[index]) {
    queryParams.creditRating = Number(creditRatingOptions.value[index].value);
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (customerStatusOptions.value[index]) {
    queryParams.customerStatus = Number(customerStatusOptions.value[index].value);
  }
};

// 来源选择变化
const onSourceChange = (e: any) => {
  const index = e.detail.value;
  sourceIndex.value = index;
  if (sourceOptions.value[index]) {
    queryParams.source = Number(sourceOptions.value[index].value);
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    queryParams.salesRepName = employeeOptions.value[index].employeeName;
  }
};

// 查询客户
const handleQuery = () => {
  loading.value = true;
  AioveuCustomerAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询客户失败:', error);
      uni.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    })
    .finally(() => {
      loading.value = false;
    });
};

// 重置查询
const handleResetQuery = () => {
  queryParams.pageNum = 1;
  // queryParams.id = '';
  queryParams.customerNo = '';
  queryParams.name = '';
  queryParams.type = undefined;
  queryParams.creditRating = undefined;
  queryParams.customerStatus = undefined;
  queryParams.city = '';
  queryParams.province = '';
  queryParams.phone = '';
  queryParams.source = undefined;
  queryParams.salesRepName = '';

  customerIndex.value = -1;
  employeeIndex.value = -1;
  typeIndex.value = -1;
  creditRatingIndex.value = -1;
  statusIndex.value = -1;
  sourceIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuCustomerPageVO[]) => {
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

  // 存储ID
  editingCustomerId.value = id;

  let url = '/packageE/pages/aioveu_customer/customer/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除客户
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的客户",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的客户吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuCustomerAPI.deleteByIds(ids.join(","))
          .then(() => {
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
            handleResetQuery();
          })
          .catch(error => {
            console.error('删除失败:', error);
            uni.showToast({
              title: "删除失败",
              icon: "none"
            });
          })
          .finally(() => uni.hideLoading());
      }
    }
  });
};

// 获取类型标签
const getTypeLabel = (type: number) => {
  const item = typeOptions.value.find(i => Number(i.value) === type);
  return item ? item.label : '未知类型';
};

// 获取信用等级标签
const getCreditRatingLabel = (rating: number) => {
  const item = creditRatingOptions.value.find(i => Number(i.value) === rating);
  return item ? item.label : '未知等级';
};

// 获取状态标签
const getStatusLabel = (status: number) => {
  const item = customerStatusOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知状态';
};

// 获取来源标签
const getSourceLabel = (source: number) => {
  const item = sourceOptions.value.find(i => Number(i.value) === source);
  return item ? item.label : '未知来源';
};

// 加载客户选项
const loadCustomerOptions = () => {
  AioveuCustomerAPI.getAllCustomerOptions()
    .then(response => {
      if (Array.isArray(response)) {
        customerOptions.value = response.map(cust => ({
          customerId: Number(cust.customerId),
          customerName: cust.customerName
        }));
      }
    })
    .catch(error => {
      console.error('加载客户选项失败:', error);
    });
};

// 加载员工选项
const loadEmployeeOptions = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions()
    .then(response => {
      if (Array.isArray(response)) {
        employeeOptions.value = response.map(emp => ({
          employeeId: Number(emp.employeeId),
          employeeName: emp.employeeName
        }));
      }
    })
    .catch(error => {
      console.error('加载员工选项失败:', error);
    });
};

// 加载字典选项
const loadDictOptions = () => {
  DictAPI.getDictItems('customer_customer_type').then(response => {
    typeOptions.value = response;
  });

  DictAPI.getDictItems('customer_credit_rating').then(response => {
    creditRatingOptions.value = response;
  });

  DictAPI.getDictItems('customer_status').then(response => {
    customerStatusOptions.value = response;
  });

  DictAPI.getDictItems('customer_source').then(response => {
    sourceOptions.value = response;
  });
};

onMounted(() => {
  handleQuery();
  loadCustomerOptions();
  loadEmployeeOptions();
  loadDictOptions();
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

/* 客户列表 */
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

.customer-card {
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

  .customer-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .customer-name {
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
      flex: 1;
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
