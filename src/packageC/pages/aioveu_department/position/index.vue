<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 岗位ID -->
        <view class="filter-item">
          <text class="filter-label">岗位ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入岗位ID"
            v-model="queryParams.positionId"
            @confirm="handleQuery"
          />
        </view>

        <!-- 岗位名称 -->
        <view class="filter-item">
          <text class="filter-label">岗位名称</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="positionOptions"
            range-key="positionName"
            :value="positionIndex"
            @change="onPositionChange"
          >
            <view class="picker-view">
              {{ positionIndex >= 0 ? positionOptions[positionIndex].positionName : '请选择岗位名称' }}
            </view>
          </picker>
        </view>

        <!-- 所属部门 -->
        <view class="filter-item">
          <text class="filter-label">所属部门</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="deptOptions"
            range-key="deptName"
            :value="deptIndex"
            @change="onDeptChange"
          >
            <view class="picker-view">
              {{ deptIndex >= 0 ? deptOptions[deptIndex].deptName : '请选择所属部门' }}
            </view>
          </picker>
        </view>

        <!-- 职级 -->
        <view class="filter-item">
          <text class="filter-label">职级</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="positionLevelOptions"
            range-key="label"
            :value="levelIndex"
            @change="onLevelChange"
          >
            <view class="picker-view">
              {{ levelIndex >= 0 ? positionLevelOptions[levelIndex].label : '请选择职级' }}
            </view>
          </picker>
        </view>

        <!-- 岗位描述 -->
        <view class="filter-item">
          <text class="filter-label">岗位描述</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入岗位描述"
            v-model="queryParams.description"
            @confirm="handleQuery"
          />
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
        :v-has-perm="(['aioveuPosition:aioveu-position:add'])"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="(['aioveuPosition:aioveu-position:delete'])"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 岗位列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">👔</text>
        <text class="empty-text">暂无岗位数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.positionId"
        class="position-card"
      >
        <view class="card-header">
          <text class="position-id">ID: {{ item.positionId }}</text>
          <text class="position-name">{{ item.positionName }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">所属部门:</text>
            <text class="info-value">{{ item.deptName }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">职级:</text>
            <text class="info-value">{{ getLevelLabel(item.positionLevel) }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">岗位描述:</text>
            <text class="info-value">{{ item.description || '-' }}</text>
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
              :v-has-perm="(['aioveuPosition:aioveu-position:edit'])"
              class="action-btn edit"
              @click="handleOpenDialog(item.positionId)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="(['aioveuPosition:aioveu-position:delete'])"
              class="action-btn delete"
              @click="handleDelete(item.positionId)"
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
import AioveuPositionAPI, {
  AioveuPositionPageVO,
  AioveuPositionPageQuery,
  PositionOptionVO
} from "@/packageC/api/aioveuPosition/aioveu-position";
import AioveuDepartmentAPI, { DeptOptionVO } from "@/packageC/api/aioveuDepartment/aioveu-department";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuPositionPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuPositionPageVO[]>([]);
const positionOptions = ref<PositionOptionVO[]>([]);
const deptOptions = ref<DeptOptionVO[]>([]);
const positionLevelOptions = ref<DictItemOption[]>([]);

const positionIndex = ref(-1);
const deptIndex = ref(-1);
const levelIndex = ref(-1);

// 在组件中添加一个变量存储当前编辑的ID
const editingPositionId = ref<number | undefined>(undefined);

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 岗位选择变化
const onPositionChange = (e: any) => {
  const index = e.detail.value;
  positionIndex.value = index;
  if (positionOptions.value[index]) {
    queryParams.positionName = positionOptions.value[index].positionName;
  }
};

// 部门选择变化
const onDeptChange = (e: any) => {
  const index = e.detail.value;
  deptIndex.value = index;
  if (deptOptions.value[index]) {
    queryParams.deptId = deptOptions.value[index].deptId;
  }
};

// 职级选择变化
const onLevelChange = (e: any) => {
  const index = e.detail.value;
  levelIndex.value = index;
  if (positionLevelOptions.value[index]) {
    queryParams.positionLevel = Number(positionLevelOptions.value[index].value);
  }
};

// 查询岗位
const handleQuery = () => {
  loading.value = true;
  AioveuPositionAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .catch(error => {
      console.error('查询岗位失败:', error);
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
  // queryParams.positionId = '';
  queryParams.positionName = '';
  queryParams.deptId = undefined;
  queryParams.positionLevel = undefined;
  queryParams.description = '';

  positionIndex.value = -1;
  deptIndex.value = -1;
  levelIndex.value = -1;

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
const handleSelectionChange = (selection: AioveuPositionPageVO[]) => {
  removeIds.value = selection
    .map(item => item.positionId)
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
  editingPositionId.value = id;

  let url = '/packageC/pages/aioveu_department/position/form';

  if (id !== undefined) {
    url += `?id=${id}`;
  }

  console.log('跳转到:', url);
  uni.navigateTo({ url });
};

// 删除岗位
const handleDelete = (id?: number) => {
  const ids = id ? [id] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的岗位",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的岗位吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuPositionAPI.deleteByIds(ids.join(","))
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

// 获取职级标签
const getLevelLabel = (level: number) => {
  const item = positionLevelOptions.value.find(i => Number(i.value) === level);
  return item ? item.label : '未知';
};

// 加载岗位选项
const loadPositionOptions = () => {
  AioveuPositionAPI.getAllPositionOptions()
    .then(response => {
      if (Array.isArray(response)) {
        positionOptions.value = response.map(pos => ({
          positionId: Number(pos.positionId),
          positionName: pos.positionName
        }));
      }
    })
    .catch(error => {
      console.error('加载岗位选项失败:', error);
      uni.showToast({
        title: '加载岗位列表失败',
        icon: 'none'
      });
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

// 加载字典选项
const loadDictOptions = () => {
  DictAPI.getDictItems('position_level').then(response => {
    positionLevelOptions.value = response;
  });
};

onMounted(() => {
  handleQuery();
  loadPositionOptions();
  loadDeptOptions();
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

/* 岗位列表 */
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

.position-card {
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

  .position-id {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }

  .position-name {
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
