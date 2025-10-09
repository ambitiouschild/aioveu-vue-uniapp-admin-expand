<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 库存ID -->
        <view class="filter-item">
          <text class="filter-label">库存ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入库存ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 仓库 -->
        <view class="filter-item">
          <text class="filter-label">仓库</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="warehouseOptions"
            range-key="warehouseName"
            :value="warehouseIndex"
            @change="onWarehouseChange"
          >
            <view class="picker-view">
              {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].warehouseName : '请选择仓库' }}
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

        <view class="filter-buttons">
          <button class="filter-btn reset" @click="handleResetQuery">重置</button>
          <button class="filter-btn confirm" @click="handleQuery">搜索</button>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button
        :v-has-perm="['aioveuInventory:aioveuProcurement-inventory:add']"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuInventory:aioveuProcurement-inventory:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 库存列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无库存数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="inventory-card"
      >
        <view class="card-header">
          <text class="inventory-id">ID: {{ item.id }}</text>
          <text class="warehouse-name">{{ item.warehouseName }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">物资:</text>
            <text class="info-value">{{ item.materialName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">库存量:</text>
            <text class="info-value">{{ item.quantity }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">批次号:</text>
            <text class="info-value">{{ item.batchNumber || '无' }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">生产日期:</text>
            <text class="info-value">{{ item.productionDate || '无' }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">有效期至:</text>
            <text class="info-value">{{ item.expiryDate || '无' }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">最后入库:</text>
            <text class="info-value">{{ item.lastInbound || '无' }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">最后出库:</text>
            <text class="info-value">{{ item.lastOutbound || '无' }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ item.createTime }}</text>
            <text>更新: {{ item.updateTime }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuInventory:aioveuProcurement-inventory:edit']"
              class="action-btn edit"
              @click="handleOpenDialog(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuInventory:aioveuProcurement-inventory:delete']"
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
import AioveuInventoryAPI, {
  AioveuInventoryPageVO,
  AioveuInventoryPageQuery
} from "@/packageD/api/aioveuInventory/aioveu-inventory";
import AioveuWarehouseAPI, { WarehouseOptionVO } from "@/packageD/api/aioveuWarehouse/aioveu-warehouse";
import AioveuMaterialAPI, { MaterialOptionVO } from "@/packageD/api/aioveuMaterial/aioveu-material";

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuInventoryPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuInventoryPageVO[]>([]);
const warehouseOptions = ref<WarehouseOptionVO[]>([]);
const materialOptions = ref<MaterialOptionVO[]>([]);

const warehouseIndex = ref(-1);
const materialIndex = ref(-1);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    queryParams.warehouseName = warehouseOptions.value[index].warehouseName;
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

// 查询库存
const handleQuery = () => {
  loading.value = true;
  AioveuInventoryAPI.getPage(queryParams)
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
  // queryParams.id = '';
  queryParams.warehouseName = '';
  queryParams.materialName = '';

  warehouseIndex.value = -1;
  materialIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuInventoryPageVO[]) => {
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
  let url = '/packageD/pages/aioveu_material/inventory/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除库存
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的库存记录",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的库存记录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuInventoryAPI.deleteByIds(ids.join(","))
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

// 加载仓库选项
const loadWarehouseOptions = () => {
  AioveuWarehouseAPI.getAllWarehouseOptions()
    .then(response => {
      if (Array.isArray(response)) {
        warehouseOptions.value = response.map(wh => ({
          warehouseId: Number(wh.warehouseId),
          warehouseName: wh.warehouseName
        }));
      }
    });
};

// 加载物资选项
const loadMaterialOptions = () => {
  AioveuMaterialAPI.getAllMaterialOptions()
    .then(response => {
      if (Array.isArray(response)) {
        materialOptions.value = response.map(mat => ({
          materialId: Number(mat.materialId),
          materialName: mat.materialName
        }));
      }
    });
};

onMounted(() => {
  handleQuery();
  loadWarehouseOptions();
  loadMaterialOptions();
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

/* 库存列表 */
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

.inventory-card {
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

  .inventory-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .warehouse-name {
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
