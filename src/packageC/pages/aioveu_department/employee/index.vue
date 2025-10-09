<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 筛选条件项 -->
        <view class="filter-item">
          <text class="filter-label">员工ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入员工ID"
            v-model="queryParams.employeeId"
            @confirm="handleQuery"
          />
        </view>

        <view class="filter-item">
          <text class="filter-label">员工编号</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入员工编号"
            v-model="queryParams.empCode"
            @confirm="handleQuery"
          />
        </view>

        <view class="filter-item">
          <text class="filter-label">姓名</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="employeeName"
            :value="nameIndex"
            @change="onNameChange"
          >
            <view class="picker-view">
              {{ nameIndex >= 0 ? employeeOptions[nameIndex].employeeName : '请选择姓名' }}
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">性别</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="genderOptions"
            range-key="label"
            :value="genderIndex"
            @change="onGenderChange"
          >
            <view class="picker-view">
              {{ genderIndex >= 0 ? genderOptions[genderIndex].label : '请选择性别' }}
            </view>
          </picker>
        </view>

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
              {{ deptIndex >= 0 ? deptOptions[deptIndex].deptName : '请选择部门' }}
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">所属岗位</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="positionOptions"
            range-key="positionName"
            :value="positionIndex"
            @change="onPositionChange"
          >
            <view class="picker-view">
              {{ positionIndex >= 0 ? positionOptions[positionIndex].positionName : '请选择岗位' }}
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="statusOptions"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? statusOptions[statusIndex] : '请选择状态' }}
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
        :v-has-perm="['aioveuEmployee:aioveuProcurement-employee:add']"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuEmployee:aioveuProcurement-employee:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 员工列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无员工数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.employeeId"
        class="employee-card"
      >
        <view class="card-header">
          <text class="employee-name">{{ item.name }}</text>
          <text class="employee-id">ID: {{ item.employeeId }}</text>
        </view>

        <view class="card-content">
          <view class="info-item">
            <text class="info-label">员工编号:</text>
            <text class="info-value">{{ item.empCode }}</text>
          </view>
<!--          <view class="info-item">-->
<!--            <text class="info-label">性别:</text>-->
<!--            <text class="info-value">{{ item.gender }}</text>-->
<!--          </view>-->

          <view class="info-item">
            <text class="info-label">性别:</text>
            <text class="info-value">{{ getGenderLabel(item.gender) }}</text>
          </view>

          <view class="info-item">
            <text class="info-label">手机号码:</text>
            <text class="info-value">{{ item.phone }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">部门:</text>
            <text class="info-value">{{ item.deptName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">岗位:</text>
            <text class="info-value">{{ item.positionName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">状态:</text>
            <text class="info-value">{{ getStatusText(item.status) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <button
            :v-has-perm="['aioveuEmployee:aioveuProcurement-employee:edit']"
            class="action-btn edit"
            @click="handleOpenDialog(item.employeeId)"
          >
            <text>✏️</text>
            <text>编辑</text>
          </button>
          <button
            :v-has-perm="['aioveuEmployee:aioveuProcurement-employee:delete']"
            class="action-btn delete"
            @click="handleDelete(item.employeeId)"
          >
            <text>🗑️</text>
            <text>删除</text>
          </button>
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
import  AioveuEmployeeAPI, {
  AioveuEmployeePageVO,
  AioveuEmployeePageQuery,
  EmployeeOptionVO
} from "@/packageC/api/aioveuEmployee/aioveu-employee";
import AioveuDepartmentAPI, { DeptOptionVO } from "@/packageC/api/aioveuDepartment/aioveu-department";
import AioveuPositionAPI, { PositionOptionVO } from "@/packageC/api/aioveuPosition/aioveu-position";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuEmployeePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuEmployeePageVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const deptOptions = ref<DeptOptionVO[]>([]);
const positionOptions = ref<PositionOptionVO[]>([]);

const nameIndex = ref(-1);
const genderIndex = ref(-1);
const deptIndex = ref(-1);
const positionIndex = ref(-1);
const statusIndex = ref(-1);

const genderOptions = ref<DictItemOption[]>([]);
const statusOptions = ['离职', '在职', '休假', '实习'];

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 姓名选择变化
const onNameChange = (e: any) => {
  const index = e.detail.value;
  nameIndex.value = index;
  queryParams.name = employeeOptions.value[index]?.employeeName || '';
};

// 性别选择变化
const onGenderChange = (e: any) => {
  const index = e.detail.value;
  genderIndex.value = index;
  queryParams.gender = index;
};

// 部门选择变化
const onDeptChange = (e: any) => {
  const index = e.detail.value;
  deptIndex.value = index;
  if (deptOptions.value[index]) {
    queryParams.deptId = deptOptions.value[index].deptId;
  }
};

// 岗位选择变化
const onPositionChange = (e: any) => {
  const index = e.detail.value;
  positionIndex.value = index;
  if (positionOptions.value[index]) {
    queryParams.positionId = positionOptions.value[index].positionId;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  queryParams.status = index;
};

// 查询员工
const handleQuery = () => {
  loading.value = true;
  AioveuEmployeeAPI.getPage(queryParams)
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
  queryParams.employeeId = undefined;
  queryParams.empCode = '';
  queryParams.name = '';
  queryParams.gender = undefined;
  queryParams.deptId = undefined;
  queryParams.positionId = undefined;
  queryParams.status = undefined;

  nameIndex.value = -1;
  genderIndex.value = -1;
  deptIndex.value = -1;
  positionIndex.value = -1;
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
const handleSelectionChange = (selection: AioveuEmployeePageVO[]) => {
  removeIds.value = selection
    .map(item => item.employeeId)
    .filter((id): id is number => id !== undefined && id !== null) as number[];
};

// // 导航到表单页
// const navigateToForm = (employeeId?: number) => {
//   // 构建跳转路径
//   const url = `/pages/aioveu_department/employee/form?employeeId=${employeeId || ''}`;
//
//   // 使用正确的跳转方法
//   uni.navigateTo({
//     url: url,
//     success: () => console.log('跳转成功'),
//     fail: (err) => console.error('跳转失败:', err)
//   });
// };

const needRefresh = ref(false);

onShow(() => {
  if (needRefresh.value) {
    handleQuery();
    needRefresh.value = false;
  }
});


// 打开弹窗
const handleOpenDialog = (employeeId?: number) => {
  needRefresh.value = true; // 标记需要刷新
  // 确保路径与pages.json中注册的完全一致
  const path = "packageC/pages/aioveu_department/employee/form";

  let url = `/${path}`;
  if (employeeId) {
    url += `?employeeId=${employeeId}`;
  }

  console.log("跳转URL:", url);
  uni.navigateTo({ url });
};


// 删除员工
const handleDelete = (employeeId?: number) => {
  const ids = employeeId ? [employeeId] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的员工",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的员工吗？',
    success: (res) => {
      if (res.confirm) {
        loading.value = true;
        AioveuEmployeeAPI.deleteByIds(ids.join(","))
          .then(() => {
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
            handleResetQuery();
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }
  });
};

// 获取状态文本
const getStatusText = (status: number) => {
  return statusOptions[status] || '未知状态';
};

// 获取性别状态标签
const getGenderLabel = (gender: number) => {
  const item = genderOptions.value.find(i => Number(i.value) === gender);
  return item ? item.label : '未知状态';
};


// 加载部门选项
const loadDepartments = () => {
  AioveuDepartmentAPI.getAllDepartmentOptions()
    .then(response => {
      if (Array.isArray(response)) {
        deptOptions.value = response.map(dept => ({
          deptId: Number(dept.deptId),
          deptName: dept.deptName
        }));
      }
    });
};

// 加载岗位选项
const loadPositions = () => {
  AioveuPositionAPI.getAllPositionOptions()
    .then(response => {
      if (Array.isArray(response)) {
        positionOptions.value = response.map(position => ({
          positionId: Number(position.positionId),
          positionName: position.positionName
        }));
      }
    });
};

// 加载员工选项
const loadEmployeeOptions = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions()
    .then(response => {
      if (Array.isArray(response)) {
        employeeOptions.value = response;
      }
    });
};

// 加载性别状态选项
const loadGenderOptions = () => {
  DictAPI.getDictItems('gender')
    .then(response => {
      genderOptions.value = response;
    })
    .catch(error => {
      console.error('加载性别状态选项失败:', error);
    });
};

onMounted(() => {
  handleQuery();
  loadDepartments();
  loadPositions();
  loadEmployeeOptions();
  loadGenderOptions();
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
  border-radius: 12rpx;
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
  border-radius: 8rpx;
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
  border-radius: 8rpx;
  padding: 20rpx 0;
  border: none;

  &.reset {
    background: #f5f5f5;
    color: #666;
  }

  &.confirm {
    background: #5e72e4;
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

/* 员工列表 */
.list-container {
  background: white;
  border-radius: 12rpx;
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

.employee-card {
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

  .employee-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .employee-id {
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

.info-item {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f1f1;

  .action-btn {
    flex: 1;
    margin: 0 8rpx;
    padding: 16rpx 0;
    font-size: 26rpx;
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
