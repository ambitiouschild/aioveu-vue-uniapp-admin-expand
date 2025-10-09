<template>
  <view class="app-container">
    <!-- 筛选区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 设备ID -->
        <view class="filter-item">
          <text class="filter-label">设备ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入设备ID"
            v-model="queryParams.id"
            @confirm="handleQuery"
          />
        </view>

        <!-- 资产编号 -->
        <view class="filter-item">
          <text class="filter-label">资产编号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入资产编号"
            v-model="queryParams.assetNo"
            @confirm="handleQuery"
          />
        </view>

        <!-- 设备名称 -->
        <view class="filter-item">
          <text class="filter-label">设备名称</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入设备名称"
            v-model="queryParams.name"
            @confirm="handleQuery"
          />
        </view>

        <!-- 设备分类 -->
        <view class="filter-item">
          <text class="filter-label">设备分类</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="categoryOptions"
            range-key="categoryName"
            :value="categoryIndex"
            @change="onCategoryChange"
          >
            <view class="picker-view">
              {{ categoryIndex >= 0 ? categoryOptions[categoryIndex].categoryName : '请选择设备分类' }}
            </view>
          </picker>
        </view>

        <!-- 序列号 -->
        <view class="filter-item">
          <text class="filter-label">序列号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入序列号"
            v-model="queryParams.serialNo"
            @confirm="handleQuery"
          />
        </view>

        <!-- 责任人 -->
        <view class="filter-item">
          <text class="filter-label">责任人</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="employeeName"
            :value="employeeIndex"
            @change="onEmployeeChange"
          >
            <view class="picker-view">
              {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择责任人' }}
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
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? statusOptions[statusIndex].label : '请选择状态' }}
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
        :v-has-perm="['aioveuEquipment:aioveuProcurement-equipment:add']"
        class="action-btn add"
        @click="handleOpenFormPage()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuEquipment:aioveuProcurement-equipment:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 设备列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无设备数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="equipment-card"
      >
        <view class="card-header">
          <text class="equipment-id">ID: {{ item.id }}</text>
          <text class="equipment-name">{{ item.name }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">资产编号:</text>
            <text class="info-value">{{ item.assetNo }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">设备分类:</text>
            <text class="info-value">{{ item.categoryName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">型号:</text>
            <text class="info-value">{{ item.model }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">序列号:</text>
            <text class="info-value">{{ item.serialNo }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">所属部门:</text>
            <text class="info-value">{{ item.departmentName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">责任人:</text>
            <text class="info-value">{{ item.responsiblePersonName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">采购日期:</text>
            <text class="info-value">{{ item.purchaseDate }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">状态:</text>
            <text class="info-value">{{ getStatusLabel(item.status) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ item.createTime }}</text>
            <text>更新: {{ item.updateTime }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuEquipment:aioveuProcurement-equipment:edit']"
              class="action-btn edit"
              @click="handleOpenFormPage(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuEquipment:aioveuProcurement-equipment:delete']"
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
import AioveuEquipmentAPI, {
  AioveuEquipmentPageVO,
  AioveuEquipmentPageQuery,
} from "@/packageD/api/aioveuEquipment/aioveu-equipment";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageD/api/aioveuEmployee/aioveu-employee";
import AioveuCategoryAPI, { CategoryOptionVO } from '@/packageD/api/aioveuCategory/aioveu-category';
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuEquipmentPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuEquipmentPageVO[]>([]);
const categoryOptions = ref<CategoryOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const statusOptions = ref<DictItemOption[]>([]);

const categoryIndex = ref(-1);
const employeeIndex = ref(-1);
const statusIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingEquipmentId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 分类选择变化
const onCategoryChange = (e: any) => {
  const index = e.detail.value;
  categoryIndex.value = index;
  if (categoryOptions.value[index]) {
    queryParams.categoryName = categoryOptions.value[index].categoryName;
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    queryParams.responsiblePersonName = employeeOptions.value[index].employeeName;
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

// 查询设备
const handleQuery = () => {
  loading.value = true;
  AioveuEquipmentAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询设备失败:', error);
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
  queryParams.assetNo = '';
  queryParams.name = '';
  queryParams.categoryName = '';
  queryParams.serialNo = '';
  queryParams.responsiblePersonName = '';
  queryParams.status = undefined;

  categoryIndex.value = -1;
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
const handleSelectionChange = (selection: AioveuEquipmentPageVO[]) => {
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
const handleOpenFormPage = (id?: number) => {

  needRefresh.value = true; // 标记需要刷新
  // 存储ID
  editingEquipmentId.value = id;

  let url = '/packageD/pages/aioveu_material/equipment/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  uni.navigateTo({ url });
};

// 删除设备
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的设备",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的设备吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuEquipmentAPI.deleteByIds(ids.join(","))
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
  return item ? item.label : '未知状态';
};

// 加载分类选项
const loadCategoryOptions = () => {
  AioveuCategoryAPI.getAllCategoryOptions()
    .then(response => {
      if (Array.isArray(response)) {
        categoryOptions.value = response.map(cat => ({
          categoryId: Number(cat.categoryId),
          categoryName: cat.categoryName
        }));
      }
    })
    .catch(error => {
      console.error('加载分类选项失败:', error);
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

// 加载状态选项
const loadStatusOptions = () => {
  DictAPI.getDictItems('equipment_status')
    .then(response => {
      statusOptions.value = response;
    })
    .catch(error => {
      console.error('加载状态选项失败:', error);
    });
};

onMounted(() => {
  handleQuery();
  loadCategoryOptions();
  loadEmployeeOptions();
  loadStatusOptions();
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

/* 设备列表 */
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

.equipment-card {
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

  .equipment-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .equipment-name {
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
