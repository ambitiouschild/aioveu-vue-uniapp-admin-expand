<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 出库ID -->
        <view class="filter-item">
          <text class="filter-label">出库ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入出库ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 出库单号 -->
        <view class="filter-item">
          <text class="filter-label">出库单号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入出库单号"
            v-model="queryParams.outboundNo"
            @confirm="handleQuery"
          />
        </view>

        <!-- 物资 -->
        <view class="filter-item">
          <text class="filter-label">物资</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="materialOptions"
            range-key="text"
            :value="materialIndex"
            @change="onMaterialChange"
          >
            <view class="picker-view">
              {{ materialIndex >= 0 ? materialOptions[materialIndex].text : '请选择物资' }}
            </view>
          </picker>
        </view>

        <!-- 仓库 -->
        <view class="filter-item">
          <text class="filter-label">仓库</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="warehouseOptions"
            range-key="text"
            :value="warehouseIndex"
            @change="onWarehouseChange"
          >
            <view class="picker-view">
              {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].text : '请选择仓库' }}
            </view>
          </picker>
        </view>

        <!-- 领用人 -->
        <view class="filter-item">
          <text class="filter-label">领用人</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="text"
            :value="employeeIndex"
            @change="onEmployeeChange"
          >
            <view class="picker-view">
              {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].text : '请选择领用人' }}
            </view>
          </picker>
        </view>

        <!-- 状态 -->
        <view class="filter-item">
          <text class="filter-label">状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="statusOptions"
            range-key="text"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? statusOptions[statusIndex].text : '请选择状态' }}
            </view>
          </picker>
        </view>

        <view class="filter-buttons">
          <button class="filter-btn reset" @click="handleResetQuery">重置</button>
          <button class="filter-btn confirm" @click="handleQuery">搜索</button>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-buttons">
      <button
        :v-has-perm="['aioveuOutbound:aioveu-outbound:add']"
        class="action-btn add"
        @click="handleOpenFormPage()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuOutbound:aioveu-outbound:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 出库记录列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无出库数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="outbound-card"
      >
        <view class="card-header">
          <text class="outbound-id">ID: {{ item.id }}</text>
          <text class="outbound-no">{{ item.outboundNo }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">物资:</text>
            <text class="info-value">{{ item.materialName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">仓库:</text>
            <text class="info-value">{{ item.warehouseName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">出库数量:</text>
            <text class="info-value">{{ item.quantity }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">批次号:</text>
            <text class="info-value">{{ item.batchNumber }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">出库时间:</text>
            <text class="info-value">{{ formatDate(item.outTime) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">操作员:</text>
            <text class="info-value">{{ item.operatorName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">领用人:</text>
            <text class="info-value">{{ item.recipientName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">领用部门:</text>
            <text class="info-value">{{ item.departmentName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">用途说明:</text>
            <text class="info-value">{{ item.purpose }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">关联项目ID:</text>
            <text class="info-value">{{ item.projectId }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">状态:</text>
            <text class="info-value">{{ getStatusText(item.status) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ formatDate(item.createTime) }}</text>
            <text>更新: {{ formatDate(item.updateTime) }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuOutbound:aioveu-outbound:edit']"
              class="action-btn edit"
              @click="handleOpenFormPage(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuOutbound:aioveu-outbound:delete']"
              class="action-btn delete"
              @click="handleDelete(item.id)"
            >
              <text>🗑️</text>
              <text>删除</text>
            </button>
          </view>
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuOutboundAPI, {
  AioveuOutboundPageVO,
  AioveuOutboundPageQuery
} from '@/packageD/api/aioveuOutbound/aioveu-outbound';

import DictAPI, { DictItemOption } from '@/api/system/dict';
import AioveuMaterialAPI, { MaterialOptionVO } from '@/packageD/api/aioveuMaterial/aioveu-material';
import AioveuWarehouseAPI, { WarehouseOptionVO } from '@/packageD/api/aioveuWarehouse/aioveu-warehouse';
import AioveuDepartmentAPI, { DeptOptionVO } from '@/packageD/api/aioveuDepartment/aioveu-department';
import AioveuEmployeeAPI, { EmployeeOptionVO } from '@/packageD/api/aioveuEmployee/aioveu-employee';

// 搜索区域显示状态
const showFilter = ref(false);
// 加载状态
const loading = ref(false);
// 选中ID集合
const removeIds = ref<number[]>([]);
// 总条数
const total = ref(0);

// 查询参数
const queryParams = reactive<AioveuOutboundPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 列表数据
const pageData = ref<AioveuOutboundPageVO[]>([]);

// 选项
const statusOptions = ref<{value: number, text: string}[]>([]);
const materialOptions = ref<{value: string, text: string}[]>([]);
const warehouseOptions = ref<{value: string, text: string}[]>([]);
const deptOptions = ref<{value: string, text: string}[]>([]);
const employeeOptions = ref<{value: string, text: string}[]>([]);

// 当前选中索引
const materialIndex = ref(-1);
const warehouseIndex = ref(-1);
const employeeIndex = ref(-1);
const statusIndex = ref(-1);

// 存储当前编辑的ID
const editingOutboundId = ref<number | undefined>(undefined);

onLoad(() => {
  // 加载选项数据
  loadStatusOptions();
  loadMaterialOptions();
  loadWarehouseOptions();
  loadDeptOptions();
  loadEmployeeOptions();

  // 初始加载数据
  handleQuery();
});

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 物资选择变化
const onMaterialChange = (e: any) => {
  const index = e.detail.value;
  materialIndex.value = index;
  if (materialOptions.value[index]) {
    queryParams.materialName = materialOptions.value[index].value;
  }
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    queryParams.warehouseName = warehouseOptions.value[index].value;
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    queryParams.recipientName = employeeOptions.value[index].value;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (statusOptions.value[index]) {
    queryParams.status = statusOptions.value[index].value;
  }
};

// 查询出库记录
const handleQuery = () => {
  loading.value = true;
  AioveuOutboundAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list || [];
      total.value = data.total || 0;
    })
    .catch(error => {
      console.error('查询出库记录失败:', error);
      uni.showToast({
        title: '获取数据失败',
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
  queryParams.outboundNo = '';
  queryParams.materialName = '';
  queryParams.warehouseName = '';
  queryParams.recipientName = '';
  queryParams.status = undefined;

  materialIndex.value = -1;
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
const handleSelectionChange = (selection: any) => {
  removeIds.value = selection.map((item: any) => item.id);
};


const needRefresh = ref(false);

onShow(() => {
  if (needRefresh.value) {
    handleQuery();
    needRefresh.value = false;
  }
});

// 打开表单页面
const handleOpenFormPage = (id?: number) => {

  needRefresh.value = true; // 标记需要刷新

  // 存储ID
  editingOutboundId.value = id;

  let url = '/packageD/pages/aioveu_material/outbound/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除出库记录
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;
  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的出库记录",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的出库记录吗？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        loading.value = true;
        AioveuOutboundAPI.deleteByIds(ids.join(","))
          .then(() => {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            handleQuery();
          })
          .catch(error => {
            console.error('删除失败:', error);
            uni.showToast({
              title: '删除失败',
              icon: 'none'
            });
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }
  });
};

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return dateString.substring(0, 10);
};

// 获取状态文本
const getStatusText = (value: number) => {
  const status = statusOptions.value.find(item => item.value === value);
  return status ? status.text : '未知状态';
};

// 加载字典
const loadStatusOptions = () => {
  DictAPI.getDictItems('outbound_status').then(response => {
    statusOptions.value = response.map(item => ({
      value: Number(item.value),
      text: item.label
    }));
  });
};

// 加载选项
const loadMaterialOptions = () => {
  AioveuMaterialAPI.getAllMaterialOptions().then(response => {
    materialOptions.value = response.map(item => ({
      value: item.materialName,
      text: item.materialName
    }));
  });
};

const loadWarehouseOptions = () => {
  AioveuWarehouseAPI.getAllWarehouseOptions().then(response => {
    warehouseOptions.value = response.map(item => ({
      value: item.warehouseName,
      text: item.warehouseName
    }));
  });
};

const loadDeptOptions = () => {
  AioveuDepartmentAPI.getAllDepartmentOptions().then(response => {
    deptOptions.value = response.map(item => ({
      value: item.deptName,
      text: item.deptName
    }));
  });
};

const loadEmployeeOptions = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions().then(response => {
    employeeOptions.value = response.map(item => ({
      value: item.employeeName,
      text: item.employeeName
    }));
  });
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 搜索区域 */
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
  padding: 20rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
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

/* 出库记录列表 */
.list-container {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 400rpx;
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

.outbound-card {
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

  .outbound-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .outbound-no {
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
