<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 订单ID -->
        <view class="filter-item">
          <text class="filter-label">订单ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入订单ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 订单编号 -->
        <view class="filter-item">
          <text class="filter-label">订单编号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入订单编号"
            v-model="queryParams.orderNo"
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

<!--        &lt;!&ndash; 联系人 &ndash;&gt;-->
<!--        <view class="filter-item">-->
<!--          <text class="filter-label">联系人</text>-->
<!--          <picker-->
<!--            class="filter-picker"-->
<!--            mode="selector"-->
<!--            :range="contactOptions"-->
<!--            range-key="contactName"-->
<!--            :value="contactIndex"-->
<!--            @change="onContactChange"-->
<!--          >-->
<!--            <view class="picker-view">-->
<!--              {{ contactIndex >= 0 ? contactOptions[contactIndex].contactName : '请选择联系人' }}-->
<!--            </view>-->
<!--          </picker>-->
<!--        </view>-->

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

        <!-- 订单状态 -->
        <view class="filter-item">
          <text class="filter-label">订单状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="orderStatusOptions"
            range-key="label"
            :value="orderStatusIndex"
            @change="onOrderStatusChange"
          >
            <view class="picker-view">
              {{ orderStatusIndex >= 0 ? orderStatusOptions[orderStatusIndex].label : '请选择订单状态' }}
            </view>
          </picker>
        </view>

        <!-- 运输方式 -->
        <view class="filter-item">
          <text class="filter-label">运输方式</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="shippingMethodOptions"
            range-key="label"
            :value="shippingMethodIndex"
            @change="onShippingMethodChange"
          >
            <view class="picker-view">
              {{ shippingMethodIndex >= 0 ? shippingMethodOptions[shippingMethodIndex].label : '请选择运输方式' }}
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
        :v-has-perm="(['aioveuSalesOrder:aioveu-sales-order:add'])"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="(['aioveuSalesOrder:aioveu-sales-order:delete'])"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 销售订单列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无销售订单数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="sales-order-card"
      >
        <view class="card-header">
          <text class="order-id">ID: {{ item.id }}</text>
          <text class="order-no">{{ item.orderNo }}</text>
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
            <text class="info-label">下单时间:</text>
            <text class="info-value">{{ item.orderDate }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">预计交货:</text>
            <text class="info-value">{{ item.expectedDelivery }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">实际交货:</text>
            <text class="info-value">{{ item.actualDelivery }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">订单金额:</text>
            <text class="info-value">{{ item.totalAmount }} {{ item.currency }}</text>
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
            <text class="info-label">总额:</text>
            <text class="info-value">{{ item.grandTotal }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">支付状态:</text>
            <text class="info-value">{{ getPaymentStatusLabel(item.paymentStatus) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">订单状态:</text>
            <text class="info-value">{{ getOrderStatusLabel(item.orderStatus) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">收货地址:</text>
            <text class="info-value">{{ item.shippingAddress }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">运输方式:</text>
            <text class="info-value">{{ getShippingMethodLabel(item.shippingMethod) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">物流单号:</text>
            <text class="info-value">{{ item.trackingNo }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">负责人:</text>
            <text class="info-value">{{ item.salesRepName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">操作员:</text>
            <text class="info-value">{{ item.operatorName }}</text>
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
              :v-has-perm="(['aioveuSalesOrder:aioveu-sales-order:edit'])"
              class="action-btn edit"
              @click="handleOpenDialog(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="(['aioveuSalesOrder:aioveu-sales-order:delete'])"
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
import AioveuSalesOrderAPI, {
  AioveuSalesOrderPageVO,
  AioveuSalesOrderPageQuery
} from "@/packageE/api/aioveuSalesOrder/aioveu-sales-order";
import AioveuCustomerAPI, { CustomerOptionVO } from "@/packageE/api/aioveuCustomer/aioveu-customer";
import AioveuContactAPI, { ContactOptionVO } from "@/packageE/api/aioveuContact/aioveu-contact";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageE/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuSalesOrderPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuSalesOrderPageVO[]>([]);
const customerOptions = ref<CustomerOptionVO[]>([]);
const contactOptions = ref<ContactOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const paymentStatusOptions = ref<DictItemOption[]>([]);
const orderStatusOptions = ref<DictItemOption[]>([]);
const shippingMethodOptions = ref<DictItemOption[]>([]);

const customerIndex = ref(-1);
const contactIndex = ref(-1);
const employeeIndex = ref(-1);
const paymentStatusIndex = ref(-1);
const orderStatusIndex = ref(-1);
const shippingMethodIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingSalesOrderId = ref<number | undefined>(undefined);

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
// const onContactChange = (e: any) => {
//   const index = e.detail.value;
//   contactIndex.value = index;
//   if (contactOptions.value[index]) {
//     queryParams.contactName = contactOptions.value[index].contactName;
//   }
// };

// 支付状态选择变化
const onPaymentStatusChange = (e: any) => {
  const index = e.detail.value;
  paymentStatusIndex.value = index;
  if (paymentStatusOptions.value[index]) {
    queryParams.paymentStatus = Number(paymentStatusOptions.value[index].value);
  }
};

// 订单状态选择变化
const onOrderStatusChange = (e: any) => {
  const index = e.detail.value;
  orderStatusIndex.value = index;
  if (orderStatusOptions.value[index]) {
    queryParams.orderStatus = Number(orderStatusOptions.value[index].value);
  }
};

// 运输方式选择变化
const onShippingMethodChange = (e: any) => {
  const index = e.detail.value;
  shippingMethodIndex.value = index;
  if (shippingMethodOptions.value[index]) {
    queryParams.shippingMethod = Number(shippingMethodOptions.value[index].value);
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

// 查询销售订单
const handleQuery = () => {
  loading.value = true;
  AioveuSalesOrderAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询销售订单失败:', error);
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
  queryParams.orderNo = '';
  queryParams.customerName = '';
  // queryParams.contactName = '';
  queryParams.paymentStatus = undefined;
  queryParams.orderStatus = undefined;
  queryParams.shippingMethod = undefined;
  queryParams.salesRepName = '';

  customerIndex.value = -1;
  contactIndex.value = -1;
  employeeIndex.value = -1;
  paymentStatusIndex.value = -1;
  orderStatusIndex.value = -1;
  shippingMethodIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuSalesOrderPageVO[]) => {
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
  editingSalesOrderId.value = id;

  let url = '/packageE/pages/aioveu_customer/sales_order/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除销售订单
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的销售订单",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的销售订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuSalesOrderAPI.deleteByIds(ids.join(","))
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

// 获取支付状态标签
const getPaymentStatusLabel = (status: number) => {
  const item = paymentStatusOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知';
};

// 获取订单状态标签
const getOrderStatusLabel = (status: number) => {
  const item = orderStatusOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知';
};

// 获取运输方式标签
const getShippingMethodLabel = (method: number) => {
  const item = shippingMethodOptions.value.find(i => Number(i.value) === method);
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
  DictAPI.getDictItems('salesOrder_payment_status').then(response => {
    paymentStatusOptions.value = response;
  });

  DictAPI.getDictItems('salesOrder_order_status').then(response => {
    orderStatusOptions.value = response;
  });

  DictAPI.getDictItems('salesOrder_shipping_method').then(response => {
    shippingMethodOptions.value = response;
  });
};

onMounted(() => {
  handleQuery();
  loadCustomerOptions();
  loadContactOptions();
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

/* 销售订单列表 */
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

.sales-order-card {
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

  .order-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .order-no {
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
