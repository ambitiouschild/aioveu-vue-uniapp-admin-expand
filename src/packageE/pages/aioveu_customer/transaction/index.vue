<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 交易ID -->
        <view class="filter-item">
          <text class="filter-label">交易ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入交易ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 交易编号 -->
        <view class="filter-item">
          <text class="filter-label">交易编号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入交易编号"
            v-model="queryParams.transactionNo"
            @confirm="handleQuery"
          />
        </view>

        <!-- 客户 -->
        <view class="filter-item">
          <text class="filter-label">客户</text>
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

        <!-- 联系人 -->
        <view class="filter-item">
          <text class="filter-label">联系人</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="contactOptions"
            range-key="contactName"
            :value="contactIndex"
            @change="onContactChange"
          >
            <view class="picker-view">
              {{ contactIndex >= 0 ? contactOptions[contactIndex].contactName : '请选择联系人' }}
            </view>
          </picker>
        </view>

        <!-- 支付方式 -->
        <view class="filter-item">
          <text class="filter-label">支付方式</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="paymentMethodOptions"
            range-key="label"
            :value="paymentMethodIndex"
            @change="onPaymentMethodChange"
          >
            <view class="picker-view">
              {{ paymentMethodIndex >= 0 ? paymentMethodOptions[paymentMethodIndex].label : '请选择支付方式' }}
            </view>
          </picker>
        </view>

        <!-- 支付状态 -->
        <view class="filter-item">
          <text class="filter-label">支付状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="paymentStatusOptions"
            range-key="label"
            :value="paymentStatusIndex"
            @change="onPaymentStatusChange"
          >
            <view class="picker-view">
              {{ paymentStatusIndex >= 0 ? paymentStatusOptions[paymentStatusIndex].label : '请选择支付状态' }}
            </view>
          </picker>
        </view>

        <!-- 交易类型 -->
        <view class="filter-item">
          <text class="filter-label">交易类型</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="transactionTypeOptions"
            range-key="label"
            :value="transactionTypeIndex"
            @change="onTransactionTypeChange"
          >
            <view class="picker-view">
              {{ transactionTypeIndex >= 0 ? transactionTypeOptions[transactionTypeIndex].label : '请选择交易类型' }}
            </view>
          </picker>
        </view>

        <!-- 交易状态 -->
        <view class="filter-item">
          <text class="filter-label">交易状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="transactionStatusOptions"
            range-key="label"
            :value="transactionStatusIndex"
            @change="onTransactionStatusChange"
          >
            <view class="picker-view">
              {{ transactionStatusIndex >= 0 ? transactionStatusOptions[transactionStatusIndex].label : '请选择交易状态' }}
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
        :v-has-perm="(['aioveuTransaction:aioveu-transaction:add'])"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="(['aioveuTransaction:aioveu-transaction:delete'])"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 交易记录列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">💰</text>
        <text class="empty-text">暂无交易记录</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="transaction-card"
      >
        <view class="card-header">
          <text class="transaction-id">ID: {{ item.id }}</text>
          <text class="transaction-no">{{ item.transactionNo }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">客户:</text>
            <text class="info-value">{{ item.customerName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">联系人:</text>
            <text class="info-value">{{ item.contactName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">交易日期:</text>
            <text class="info-value">{{ item.transactionDate }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">交易金额:</text>
            <text class="info-value">{{ item.amount }} {{ item.currency }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">支付方式:</text>
            <text class="info-value">{{ getPaymentMethodLabel(item.paymentMethod) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">支付状态:</text>
            <text class="info-value">{{ getPaymentStatusLabel(item.paymentStatus) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">交易类型:</text>
            <text class="info-value">{{ getTransactionTypeLabel(item.transactionType) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">发票号码:</text>
            <text class="info-value">{{ item.invoiceNo }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">产品ID:</text>
            <text class="info-value">{{ item.productId }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">数量:</text>
            <text class="info-value">{{ item.quantity }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">单价:</text>
            <text class="info-value">{{ item.unitPrice }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">折扣率:</text>
            <text class="info-value">{{ item.discount }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">税率:</text>
            <text class="info-value">{{ item.taxRate }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">税额:</text>
            <text class="info-value">{{ item.taxAmount }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">总金额:</text>
            <text class="info-value">{{ item.totalAmount }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">负责人:</text>
            <text class="info-value">{{ item.salesRepName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">交易状态:</text>
            <text class="info-value">{{ getTransactionStatusLabel(item.transactionStatus) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">备注:</text>
            <text class="info-value">{{ item.notes }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ item.createTime }}</text>
            <text>更新: {{ item.updateTime }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="(['aioveuTransaction:aioveu-transaction:edit'])"
              class="action-btn edit"
              @click="handleOpenDialog(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="(['aioveuTransaction:aioveu-transaction:delete'])"
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
import AioveuTransactionAPI, {
  AioveuTransactionPageVO,
  AioveuTransactionPageQuery
} from "@/packageE/api/aioveuTransaction/aioveu-transaction";
import AioveuCustomerAPI, { CustomerOptionVO } from "@/packageE/api/aioveuCustomer/aioveu-customer";
import AioveuContactAPI, { ContactOptionVO } from "@/packageE/api/aioveuContact/aioveu-contact";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuTransactionPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuTransactionPageVO[]>([]);
const customerOptions = ref<CustomerOptionVO[]>([]);
const contactOptions = ref<ContactOptionVO[]>([]);
const paymentMethodOptions = ref<DictItemOption[]>([]);
const paymentStatusOptions = ref<DictItemOption[]>([]);
const transactionTypeOptions = ref<DictItemOption[]>([]);
const transactionStatusOptions = ref<DictItemOption[]>([]);

const customerIndex = ref(-1);
const contactIndex = ref(-1);
const paymentMethodIndex = ref(-1);
const paymentStatusIndex = ref(-1);
const transactionTypeIndex = ref(-1);
const transactionStatusIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingTransactionId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 客户选择变化
const onCustomerChange = (e: any) => {
  const index = e.detail.value;
  customerIndex.value = index;
  if (customerOptions.value[index]) {
    queryParams.customerName = customerOptions.value[index].customerName;
  }
};

// 联系人选择变化
const onContactChange = (e: any) => {
  const index = e.detail.value;
  contactIndex.value = index;
  if (contactOptions.value[index]) {
    queryParams.contactName = contactOptions.value[index].contactName;
  }
};

// 支付方式选择变化
const onPaymentMethodChange = (e: any) => {
  const index = e.detail.value;
  paymentMethodIndex.value = index;
  if (paymentMethodOptions.value[index]) {
    queryParams.paymentMethod = Number(paymentMethodOptions.value[index].value);
  }
};

// 支付状态选择变化
const onPaymentStatusChange = (e: any) => {
  const index = e.detail.value;
  paymentStatusIndex.value = index;
  if (paymentStatusOptions.value[index]) {
    queryParams.paymentStatus = Number(paymentStatusOptions.value[index].value);
  }
};

// 交易类型选择变化
const onTransactionTypeChange = (e: any) => {
  const index = e.detail.value;
  transactionTypeIndex.value = index;
  if (transactionTypeOptions.value[index]) {
    queryParams.transactionType = Number(transactionTypeOptions.value[index].value);
  }
};

// 交易状态选择变化
const onTransactionStatusChange = (e: any) => {
  const index = e.detail.value;
  transactionStatusIndex.value = index;
  if (transactionStatusOptions.value[index]) {
    queryParams.transactionStatus = Number(transactionStatusOptions.value[index].value);
  }
};

// 查询交易记录
const handleQuery = () => {
  loading.value = true;
  AioveuTransactionAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询交易记录失败:', error);
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
  queryParams.transactionNo = '';
  queryParams.customerName = '';
  queryParams.contactName = '';
  queryParams.paymentMethod = undefined;
  queryParams.paymentStatus = undefined;
  queryParams.transactionType = undefined;
  queryParams.transactionStatus = undefined;

  customerIndex.value = -1;
  contactIndex.value = -1;
  paymentMethodIndex.value = -1;
  paymentStatusIndex.value = -1;
  transactionTypeIndex.value = -1;
  transactionStatusIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuTransactionPageVO[]) => {
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
  editingTransactionId.value = id;

  let url = '/packageE/pages/aioveu_customer/transaction/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除交易记录
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的交易记录",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的交易记录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuTransactionAPI.deleteByIds(ids.join(","))
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

// 获取支付方式标签
const getPaymentMethodLabel = (method: number) => {
  const item = paymentMethodOptions.value.find(i => Number(i.value) === method);
  return item ? item.label : '未知';
};

// 获取支付状态标签
const getPaymentStatusLabel = (status: number) => {
  const item = paymentStatusOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知';
};

// 获取交易类型标签
const getTransactionTypeLabel = (type: number) => {
  const item = transactionTypeOptions.value.find(i => Number(i.value) === type);
  return item ? item.label : '未知';
};

// 获取交易状态标签
const getTransactionStatusLabel = (status: number) => {
  const item = transactionStatusOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知';
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

// 加载联系人选项
const loadContactOptions = () => {
  AioveuContactAPI.getAllContactOptions()
    .then(response => {
      if (Array.isArray(response)) {
        contactOptions.value = response.map(contact => ({
          contactId: Number(contact.contactId),
          contactName: contact.contactName
        }));
      }
    })
    .catch(error => {
      console.error('加载联系人选项失败:', error);
    });
};

// 加载字典选项
const loadDictOptions = () => {
  DictAPI.getDictItems('transaction_payment_method').then(response => {
    paymentMethodOptions.value = response;
  });

  DictAPI.getDictItems('transaction_payment_status').then(response => {
    paymentStatusOptions.value = response;
  });

  DictAPI.getDictItems('transaction_type').then(response => {
    transactionTypeOptions.value = response;
  });

  DictAPI.getDictItems('transaction_status').then(response => {
    transactionStatusOptions.value = response;
  });
};

onMounted(() => {
  handleQuery();
  loadCustomerOptions();
  loadContactOptions();
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

/* 交易记录列表 */
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

.transaction-card {
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

  .transaction-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .transaction-no {
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
