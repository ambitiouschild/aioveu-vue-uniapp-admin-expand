<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 明细ID -->
        <view class="filter-item">
          <text class="filter-label">明细ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入明细ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 订单 -->
        <view class="filter-item">
          <text class="filter-label">订单</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="salesOrderOptions"
            range-key="salesOrderNo"
            :value="salesOrderIndex"
            @change="onSalesOrderChange"
          >
            <view class="picker-view">
              {{ salesOrderIndex >= 0 ? salesOrderOptions[salesOrderIndex].salesOrderNo : '请选择订单' }}
            </view>
          </picker>
        </view>

        <!-- 物资 -->
        <view class="filter-item">
          <text class="filter-label">物资</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="materialOptions"
            range-key="materialName"
            :value="materialIndex"
            @change="onMaterialChange"
          >
            <view class="picker-view">
              {{ materialIndex >= 0 ? materialOptions[materialIndex].materialName : '请选择物资' }}
            </view>
          </picker>
        </view>

        <!-- 发货仓库 -->
        <view class="filter-item">
          <text class="filter-label">发货仓库</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="warehouseOptions"
            range-key="warehouseName"
            :value="warehouseIndex"
            @change="onWarehouseChange"
          >
            <view class="picker-view">
              {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].warehouseName : '请选择发货仓库' }}
            </view>
          </picker>
        </view>

        <!-- 明细状态 -->
        <view class="filter-item">
          <text class="filter-label">明细状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="statusOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? statusOptions[statusIndex].label : '请选择明细状态' }}
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
        :v-has-perm="(['aioveuSalesOrderDetail:aioveu-sales-order-detail:add'])"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="(['aioveuSalesOrderDetail:aioveu-sales-order-detail:delete'])"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 订单明细列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单明细数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="detail-card"
      >
        <view class="card-header">
          <text class="detail-id">ID: {{ item.id }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">订单:</text>
            <text class="info-value">{{ item.salesOrderNo }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">物资:</text>
            <text class="info-value">{{ item.materialName }}</text>
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
          <text class="info-label">小计:</text>
          <text class="info-value">{{ item.subtotal }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">税额:</text>
          <text class="info-value">{{ item.taxAmount }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">总金额:</text>
          <text class="info-value">{{ item.totalPrice }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">批次号:</text>
            <text class="info-value">{{ item.batchNumber }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">要求交货日期:</text>
          <text class="info-value">{{ item.deliveryDate }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">发货仓库:</text>
          <text class="info-value">{{ item.warehouseName }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">明细状态:</text>
          <text class="info-value">{{ getStatusLabel(item.status) }}</text>
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
            :v-has-perm="(['aioveuSalesOrderDetail:aioveu-sales-order-detail:edit'])"
            class="action-btn edit"
            @click="handleOpenDialog(item.id)"
          >
            <text>✏️</text>
            <text>编辑</text>
          </button>
          <button
            :v-has-perm="(['aioveuSalesOrderDetail:aioveu-sales-order-detail:delete'])"
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
import AioveuSalesOrderDetailAPI, {
  AioveuSalesOrderDetailPageVO,
  AioveuSalesOrderDetailPageQuery
} from "@/packageE/api/aioveuSalesOrderDetail/aioveu-sales-order-detail";
import AioveuSalesOrderAPI, { SalesOrderOptionVO } from "@/packageE/api/aioveuSalesOrder/aioveu-sales-order";
import AioveuMaterialAPI, { MaterialOptionVO } from "@/packageE/api/aioveuMaterial/aioveu-material";
import AioveuWarehouseAPI, { WarehouseOptionVO } from "@/packageE/api/aioveuWarehouse/aioveu-warehouse";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuSalesOrderDetailPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuSalesOrderDetailPageVO[]>([]);
const salesOrderOptions = ref<SalesOrderOptionVO[]>([]);
const materialOptions = ref<MaterialOptionVO[]>([]);
const warehouseOptions = ref<WarehouseOptionVO[]>([]);
const statusOptions = ref<DictItemOption[]>([]);

const salesOrderIndex = ref(-1);
const materialIndex = ref(-1);
const warehouseIndex = ref(-1);
const statusIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingSalesOrderDetailId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 订单选择变化
const onSalesOrderChange = (e: any) => {
  const index = e.detail.value;
  salesOrderIndex.value = index;
  if (salesOrderOptions.value[index]) {
    queryParams.orderName = salesOrderOptions.value[index].salesOrderNo;
  }
};

// 物资选择变化
const onMaterialChange = (e: any) => {
  const index = e.detail.value;
  materialIndex.value = index;
  if (materialOptions.value[index]) {
    queryParams.materialName = materialOptions.value[index].materialName;
  }
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    queryParams.warehouseName = warehouseOptions.value[index].warehouseName;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (statusOptions.value[index]) {
    queryParams.status = Number(statusOptions.value[index].value);
  }
};

// 查询订单明细
const handleQuery = () => {
  loading.value = true;
  AioveuSalesOrderDetailAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询订单明细失败:', error);
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
  queryParams.orderName = '';
  queryParams.materialName = '';
  queryParams.warehouseName = '';
  queryParams.status = undefined;

  salesOrderIndex.value = -1;
  materialIndex.value = -1;
  warehouseIndex.value = -1;
  statusIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuSalesOrderDetailPageVO[]) => {
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
  editingSalesOrderDetailId.value = id;

  let url = '/packageE/pages/aioveu_customer/sales_order_detail/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除订单明细
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的订单明细",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的订单明细吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuSalesOrderDetailAPI.deleteByIds(ids.join(","))
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

// 获取状态标签
const getStatusLabel = (status: number) => {
  const item = statusOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知';
};

// 加载销售订单选项
const loadSalesOrderOptions = () => {
  AioveuSalesOrderAPI.getAllSalesOrderOptions()
    .then(response => {
      if (Array.isArray(response)) {
        salesOrderOptions.value = response.map(order => ({
          salesOrderId: Number(order.salesOrderId),
          salesOrderNo: order.salesOrderNo
        }));
      }
    })
    .catch(error => {
      console.error('加载销售订单选项失败:', error);
    });
};

// 加载物资选项
const loadMaterialOptions = () => {
  AioveuMaterialAPI.getAllMaterialOptions()
    .then(response => {
      if (Array.isArray(response)) {
        materialOptions.value = response.map(material => ({
          materialId: Number(material.materialId),
          materialName: material.materialName
        }));
      }
    })
    .catch(error => {
      console.error('加载物资选项失败:', error);
    });
};

// 加载仓库选项
const loadWarehouseOptions = () => {
  AioveuWarehouseAPI.getAllWarehouseOptions()
    .then(response => {
      if (Array.isArray(response)) {
        warehouseOptions.value = response.map(warehouse => ({
          warehouseId: Number(warehouse.warehouseId),
          warehouseName: warehouse.warehouseName
        }));
      }
    })
    .catch(error => {
      console.error('加载仓库选项失败:', error);
    });
};

// 加载字典选项
const loadDictOptions = () => {
  DictAPI.getDictItems('salesOrderDetail_status').then(response => {
    statusOptions.value = response;
  });
};

onMounted(() => {
  handleQuery();
  loadSalesOrderOptions();
  loadMaterialOptions();
  loadWarehouseOptions();
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

/* 订单明细列表 */
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

.detail-card {
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

  .detail-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
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
