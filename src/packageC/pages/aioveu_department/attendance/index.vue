<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 考勤ID -->
        <view class="filter-item">
          <text class="filter-label">考勤ID</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入考勤ID"
            v-model="queryParams.attendanceId"
            @confirm="handleQuery"
          />
        </view>

        <!-- 员工姓名 -->
        <view class="filter-item">
          <text class="filter-label">员工姓名</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="employeeName"
            :value="employeeIndex"
            @change="onEmployeeChange"
          >
            <view class="picker-view">
              {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择员工' }}
            </view>
          </picker>
        </view>

<!--        &lt;!&ndash; 日期范围 &ndash;&gt;-->
<!--        <view class="filter-item">-->
<!--          <text class="filter-label">日期范围</text>-->
<!--          <picker-->
<!--            class="filter-picker"-->
<!--            mode="date"-->
<!--            :start="startDate"-->
<!--            :end="endDate"-->
<!--            :value="dateRange"-->
<!--            @change="onDateChange"-->
<!--          >-->
<!--            <view class="picker-view">-->
<!--              {{ dateRange || '请选择日期范围' }}-->
<!--            </view>-->
<!--          </picker>-->
<!--        </view>-->

        <!-- 工作时长 -->
        <view class="filter-item">
          <text class="filter-label">工作时长(小时)</text>
          <input
            type="number"
            class="filter-input"
            placeholder="请输入工作时长"
            v-model="queryParams.workHours"
            @confirm="handleQuery"
          />
        </view>

        <!-- 考勤状态 -->
        <view class="filter-item">
          <text class="filter-label">考勤状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="attendanceStatusOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? attendanceStatusOptions[statusIndex].label : '请选择状态' }}
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
        :v-has-perm="['aioveuAttendance:aioveuProcurement-attendance:add']"
        class="action-btn add"
        @click="handleOpenDialog()"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuAttendance:aioveuProcurement-attendance:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete()"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 考勤列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无考勤数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.attendanceId"
        class="attendance-card"
      >
        <view class="card-header">
          <text class="attendance-id">考勤ID: {{ item.attendanceId }}</text>
          <text class="date">{{ item.date }}</text>
        </view>

        <view class="card-content">
          <view class="info-item">
            <text class="info-label">员工姓名:</text>
            <text class="info-value">{{ item.employeeName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">上班打卡:</text>
            <text class="info-value">{{ item.checkinTime || '未打卡' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">下班打卡:</text>
            <text class="info-value">{{ item.checkoutTime || '未打卡' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">工作时长:</text>
            <text class="info-value">{{ item.workHours }} 小时</text>
          </view>
          <view class="info-item">
            <text class="info-label">考勤状态:</text>
            <text class="info-value">{{ getStatusLabel(item.status) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <button
            :v-has-perm="['aioveuAttendance:aioveuProcurement-attendance:edit']"
            class="action-btn edit"
            @click="handleOpenDialog(item.attendanceId)"
          >
            <text>✏️</text>
            <text>编辑</text>
          </button>
          <button
            :v-has-perm="['aioveuAttendance:aioveuProcurement-attendance:delete']"
            class="action-btn delete"
            @click="handleDelete(item.attendanceId)"
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
import AioveuAttendanceAPI, {
  AioveuAttendancePageVO,
  AioveuAttendancePageQuery
} from "@/packageC/api/aioveuAttendance/aioveu-attendance";
import AioveuEmployeeAPI, {  EmployeeOptionVO } from "@/packageC/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);
const showFilter = ref(false);

const queryParams = reactive<AioveuAttendancePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<AioveuAttendancePageVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const attendanceStatusOptions = ref<DictItemOption[]>([]);

const employeeIndex = ref(-1);
const statusIndex = ref(-1);
const dateRange = ref('');

// 切换筛选显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    queryParams.employeeName = employeeOptions.value[index].employeeName;
  }
};

// // 日期选择变化
// const onDateChange = (e: any) => {
//   dateRange.value = e.detail.value;
//   // 解析日期范围
//   const dates = e.detail.value.split(' - ');
//   if (dates.length === 2) {
//     queryParams.startDate = dates[0];
//     queryParams.endDate = dates[1];
//   }
// };

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (attendanceStatusOptions.value[index]) {
    queryParams.status = Number(attendanceStatusOptions.value[index].value);
  }
};

// 查询考勤
const handleQuery = () => {
  loading.value = true;
  AioveuAttendanceAPI.getPage(queryParams)
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
  queryParams.attendanceId = undefined;
  queryParams.employeeName = '';
  queryParams.workHours = undefined;
  queryParams.status = undefined;

  employeeIndex.value = -1;
  statusIndex.value = -1;
  dateRange.value = '';

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
const handleSelectionChange = (selection: AioveuAttendancePageVO[]) => {
  removeIds.value = selection
    .map(item => item.attendanceId)
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
const handleOpenDialog = (attendanceId?: number) => {
  needRefresh.value = true; // 标记需要刷新

  let url = '/packageC/pages/aioveu_department/attendance/form';

  if (attendanceId !== undefined) {
    url += `?attendanceId=${attendanceId}`;
  }
  console.log("跳转URL:", url);
  uni.navigateTo({ url });
};

// 删除考勤
const handleDelete = (attendanceId?: number) => {
  const ids = attendanceId ? [attendanceId] : removeIds.value;

  if (ids.length === 0) {
    uni.showToast({
      title: "请选择要删除的考勤记录",
      icon: "none"
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认删除选中的考勤记录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        AioveuAttendanceAPI.deleteByIds(ids.join(","))
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

// 获取状态标签
const getStatusLabel = (status: number) => {
  const item = attendanceStatusOptions.value.find(i => i.value === status.toString());
  return item ? item.label : '未知状态';
};

// 加载员工选项
const loadEmployees = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions()
    .then(response => {
      if (Array.isArray(response)) {
        employeeOptions.value = response.map(emp => ({
          employeeId: Number(emp.employeeId),
          employeeName: emp.employeeName
        }));
      }
    });
};

// 加载考勤状态选项
const loadAttendanceStatus = () => {
  DictAPI.getDictItems('attendance_status')
    .then(response => {
      attendanceStatusOptions.value = response;
    });
};

onMounted(() => {
  handleQuery();
  loadEmployees();
  loadAttendanceStatus();
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

/* 考勤列表 */
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

.attendance-card {
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

  .attendance-id {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  .date {
    font-size: 28rpx;
    color: #666;
  }
}

.card-content {
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 28rpx;

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
