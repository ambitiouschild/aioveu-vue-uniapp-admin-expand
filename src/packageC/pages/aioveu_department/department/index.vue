<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 部门ID -->
        <view class="filter-item">
          <text class="filter-label">部门ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入部门ID"
            v-model="queryParams.deptId"
            @confirm="handleQuery"
          />
        </view>

        <!-- 部门名称 -->
        <view class="filter-item">
          <text class="filter-label">部门名称</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="deptOptions"
            range-key="deptName"
            :value="deptIndex"
            @change="onDeptChange"
          >
            <view class="picker-view">
              {{ deptIndex >= 0 ? deptOptions[deptIndex].deptName : '请选择部门名称' }}
            </view>
          </picker>
        </view>

        <!-- 上级部门 -->
        <view class="filter-item">
          <text class="filter-label">上级部门</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="parentDeptOptions"
            range-key="deptName"
            :value="parentDeptIndex"
            @change="onParentDeptChange"
          >
            <view class="picker-view">
              {{ parentDeptIndex >= 0 ? parentDeptOptions[parentDeptIndex].deptName : '请选择上级部门' }}
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
        :v-has-perm="(['aioveuDepartment:aioveu-department:add'])"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="(['aioveuDepartment:aioveu-department:delete'])"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 部门列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">🏢</text>
        <text class="empty-text">暂无部门数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.deptId"
        class="department-card"
      >
        <view class="card-header">
          <text class="dept-id">ID: {{ item.deptId }}</text>
          <text class="dept-name">{{ item.deptName }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">上级部门:</text>
            <text class="info-value">{{ item.parentDeptName || '无' }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">创建时间:</text>
            <text class="info-value">{{ item.createTime }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">更新时间:</text>
            <text class="info-value">{{ item.updateTime }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="action-buttons">
            <button
              :v-has-perm="(['aioveuDepartment:aioveu-department:edit'])"
              class="action-btn edit"
              @click="handleOpenDialog(item.deptId)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="(['aioveuDepartment:aioveu-department:delete'])"
              class="action-btn delete"
              @click="handleDelete(item.deptId)"
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
import AioveuDepartmentAPI, {
  AioveuDepartmentPageVO,
  AioveuDepartmentPageQuery,
  DeptOptionVO
} from "@/packageC/api/aioveuDepartment/aioveu-department";

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuDepartmentPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuDepartmentPageVO[]>([]);
const deptOptions = ref<DeptOptionVO[]>([]);
const parentDeptOptions = ref<DeptOptionVO[]>([]);

const deptIndex = ref(-1);
const parentDeptIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingDeptId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 部门选择变化
const onDeptChange = (e: any) => {
  const index = e.detail.value;
  deptIndex.value = index;
  if (deptOptions.value[index]) {
    queryParams.deptName = deptOptions.value[index].deptName;
  }
};

// 上级部门选择变化
const onParentDeptChange = (e: any) => {
  const index = e.detail.value;
  parentDeptIndex.value = index;
  if (parentDeptOptions.value[index]) {
    queryParams.parentDeptName = parentDeptOptions.value[index].deptName;
  }
};

// 查询部门
const handleQuery = () => {
  loading.value = true;
  AioveuDepartmentAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询部门失败:', error);
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
  // queryParams.deptId = '';
  queryParams.deptName = '';
  queryParams.parentDeptName = '';

  deptIndex.value = -1;
  parentDeptIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuDepartmentPageVO[]) => {
  removeIds.value = selection
    .map(item => item.deptId)
    .filter((id): id is number => id !== undefined && id !== null) as number[];
};

//为了避免不必要的重复加载，可以添加一个刷新标志位
const needRefresh = ref(false);
// 打开表单页
const handleOpenDialog = (deptId?: number) => {
  // 存储ID
  editingDeptId.value = deptId;

  let url = '/packageC/pages/aioveu_department/department/form';

  if (deptId !== undefined) {
    url += `?id=${deptId}`;
  }

  needRefresh.value = true; // 标记需要刷新
  uni.navigateTo({ url });
};

onShow(() => {
  if (needRefresh.value) {
    handleQuery();
    needRefresh.value = false;
  }
});

// 删除部门
const handleDelete = (deptId?: number) => {
  const ids = deptId ? [deptId] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的部门",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的部门吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuDepartmentAPI.deleteByIds(ids.join(","))
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

// 加载部门选项
const loadDeptOptions = () => {
  AioveuDepartmentAPI.getAllDepartmentOptions()
    .then(response => {
      if (Array.isArray(response)) {
        deptOptions.value = response.map(dept => ({
          deptId: Number(dept.deptId),
          deptName: dept.deptName
        }));
        // 上级部门选项与部门选项相同
        parentDeptOptions.value = [...deptOptions.value];
      }
    })
    .catch(error => {
      console.error('加载部门选项失败:', error);
      uni.showToast({
        title: '加载部门列表失败',
        icon: 'none'
      });
    });
};

onMounted(() => {
  handleQuery();
  loadDeptOptions();
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

/* 部门列表 */
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

.department-card {
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

  .dept-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .dept-name {
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
