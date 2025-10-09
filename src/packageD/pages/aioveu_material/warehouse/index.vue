<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 仓库ID -->
        <view class="filter-item">
          <text class="filter-label">仓库ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入仓库ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 仓库名称 -->
        <view class="filter-item">
          <text class="filter-label">仓库名称</text>
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

        <!-- 仓库编码 -->
        <view class="filter-item">
          <text class="filter-label">仓库编码</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入仓库编码"
            v-model="queryParams.code"
            @confirm="handleQuery"
          />
        </view>

        <!-- 仓库位置 -->
        <view class="filter-item">
          <text class="filter-label">仓库位置</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入仓库位置"
            v-model="queryParams.location"
            @confirm="handleQuery"
          />
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

        <!-- 启用状态 -->
        <view class="filter-item">
          <text class="filter-label">启用状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="isActiveOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? isActiveOptions[statusIndex].label : '请选择状态' }}
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
        :v-has-perm="['aioveuWarehouse:aioveuProcurement-warehouse:add']"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuWarehouse:aioveuProcurement-warehouse:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 仓库列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无仓库数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="warehouse-card"
      >
        <view class="card-header">
          <text class="warehouse-id">ID: {{ item.id }}</text>
          <text class="warehouse-name">{{ item.name }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">编码:</text>
            <text class="info-value">{{ item.code }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">位置:</text>
            <text class="info-value">{{ item.location }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">面积:</text>
            <text class="info-value">{{ item.area }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">容量:</text>
            <text class="info-value">{{ item.capacity }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">负责人:</text>
            <text class="info-value">{{ item.managerName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">联系电话:</text>
            <text class="info-value">{{ item.contactPhone }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">状态:</text>
            <text class="info-value">{{ getStatusLabel(item.isActive) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ item.createTime }}</text>
            <text>更新: {{ item.updateTime }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuWarehouse:aioveuProcurement-warehouse:edit']"
              class="action-btn edit"
              @click="handleOpenDialog(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuWarehouse:aioveuProcurement-warehouse:delete']"
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
import AioveuWarehouseAPI, {
  AioveuWarehousePageVO,
  AioveuWarehousePageQuery,
  WarehouseOptionVO
} from "@/packageD/api/aioveuWarehouse/aioveu-warehouse";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageD/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuWarehousePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuWarehousePageVO[]>([]);
const warehouseOptions = ref<WarehouseOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const isActiveOptions = ref<DictItemOption[]>([]);

const warehouseIndex = ref(-1);
const employeeIndex = ref(-1);
const statusIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingWarehouseId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    queryParams.name = warehouseOptions.value[index].warehouseName;
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    queryParams.managerName = employeeOptions.value[index].employeeName;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (isActiveOptions.value[index]) {
    queryParams.isActive = Number(isActiveOptions.value[index].value);
  }
};

// 查询仓库
const handleQuery = () => {
  loading.value = true;
  AioveuWarehouseAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询仓库失败:', error);
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
  queryParams.name = '';
  queryParams.code = '';
  queryParams.location = '';
  queryParams.managerName = '';
  queryParams.isActive = undefined;

  warehouseIndex.value = -1;
  employeeIndex.value = -1;
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
const handleSelectionChange = (selection: AioveuWarehousePageVO[]) => {
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
  editingWarehouseId.value = id;

  let url = '/packageD/pages/aioveu_material/warehouse/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除仓库
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的仓库",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的仓库吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuWarehouseAPI.deleteByIds(ids.join(","))
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
  const item = isActiveOptions.value.find(i => Number(i.value) === status);
  return item ? item.label : '未知状态';
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
    })
    .catch(error => {
      console.error('加载仓库选项失败:', error);
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

// 加载启用状态选项
const loadIsActiveOptions = () => {
  DictAPI.getDictItems('warehouse_is_active')
    .then(response => {
      isActiveOptions.value = response;
    })
    .catch(error => {
      console.error('加载状态选项失败:', error);
    });
};

onMounted(() => {
  handleQuery();
  loadWarehouseOptions();
  loadEmployeeOptions();
  loadIsActiveOptions();
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

/* 仓库列表 */
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

.warehouse-card {
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

  .warehouse-id {
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
