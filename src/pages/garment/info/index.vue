<template>
  <view class="garment-info-page">
    <!-- 头部导航 -->
    <wd-navbar title="衣物信息" left-arrow @click-left="goBack" />

    <view class="container p-4">
      <!-- 衣物基本信息 -->
      <wd-card>
        <template #title>
          <view class="flex items-center">
            <image class="w-40rpx h-40rpx mr-2" src="/static/icons/garment.png" />
            <text class="font-bold">衣物信息</text>
          </view>
        </template>

        <view class="info-grid">
          <view class="info-item">
            <text class="label">衣物编码:</text>
            <text class="value">{{ garmentInfo.garmentCode }}</text>
          </view>

          <view class="info-item">
            <text class="label">当前状态:</text>
            <text class="value status-badge" :class="getStatusClass(garmentInfo.currentStatus)">
              {{ garmentInfo.currentStatus }}
            </text>
          </view>

          <view class="info-item">
            <text class="label">衣物类型:</text>
            <text class="value">{{ garmentInfo.garmentType }}</text>
          </view>

          <view class="info-item">
            <text class="label">洗涤价格:</text>
            <text class="value">¥{{ garmentInfo.washPrice }}</text>
          </view>

          <view class="info-item">
            <text class="label">特殊说明:</text>
            <text class="value">{{ garmentInfo.specialInstructions || '无' }}</text>
          </view>
        </view>
      </wd-card>

      <!-- 订单信息 -->
      <wd-card class="mt-4">
        <template #title>
          <view class="flex items-center">
            <image class="w-40rpx h-40rpx mr-2" src="/static/icons/order.png" />
            <text class="font-bold">订单信息</text>
          </view>
        </template>

        <view class="info-grid">
          <view class="info-item">
            <text class="label">订单号:</text>
            <text class="value">{{ garmentInfo.orderNo }}</text>
          </view>

          <view class="info-item">
            <text class="label">下单时间:</text>
            <text class="value">{{ formatDate(garmentInfo.orderTime) }}</text>
          </view>

          <view class="info-item">
            <text class="label">总金额:</text>
            <text class="value">¥{{ garmentInfo.totalAmount }}</text>
          </view>
        </view>
      </wd-card>

      <!-- 客户信息 -->
      <wd-card class="mt-4">
        <template #title>
          <view class="flex items-center">
            <image class="w-40rpx h-40rpx mr-2" src="/static/icons/customer.png" />
            <text class="font-bold">客户信息</text>
          </view>
        </template>

        <view class="info-grid">
          <view class="info-item">
            <text class="label">姓名:</text>
            <text class="value">{{ garmentInfo.customerName }}</text>
          </view>

          <view class="info-item">
            <text class="label">电话:</text>
            <text class="value">{{ garmentInfo.customerPhone }}</text>
          </view>

          <view class="info-item">
            <text class="label">地址:</text>
            <text class="value">{{ garmentInfo.customerAddress }}</text>
          </view>
        </view>
      </wd-card>

      <!-- 状态更新区域 -->
      <wd-card class="mt-4">
        <template #title>
          <view class="flex items-center">
            <image class="w-40rpx h-40rpx mr-2" src="/static/icons/update.png" />
            <text class="font-bold">更新状态</text>
          </view>
        </template>

        <view class="p-4">
          <wd-form ref="form" :model="statusForm">
            <wd-form-item prop="newStatus" label="新状态" required>
              <wd-select
                v-model="statusForm.newStatus"
                placeholder="请选择新状态"
                :options="statusOptions"
              />
            </wd-form-item>

            <wd-form-item prop="note" label="备注">
              <wd-textarea
                v-model="statusForm.note"
                placeholder="请输入备注信息"
                maxlength="200"
                show-word-limit
              />
            </wd-form-item>
          </wd-form>

          <wd-button
            type="primary"
            block
            class="mt-4"
            @click="updateStatus"
          >
            更新状态
          </wd-button>
        </view>
      </wd-card>

      <!-- 状态历史记录 -->
      <wd-card class="mt-4">
        <template #title>
          <view class="flex items-center">
            <image class="w-40rpx h-40rpx mr-2" src="/static/icons/history.png" />
            <text class="font-bold">状态历史</text>
          </view>
        </template>

        <view class="p-4">
          <wd-steps direction="vertical" :active="statusHistory.length">
            <wd-step
              v-for="(history, index) in statusHistory"
              :key="index"
              :title="history.status"
              :content="formatHistoryContent(history)"
            />
          </wd-steps>
        </view>
      </wd-card>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuQRCodeAPI from '@/api/system/aioveuQRCode'; // 请根据实际路径调整
import { dayjs } from 'wot-design-uni';

// 衣物信息
const garmentInfo = ref<any>({});
const statusHistory = ref<any[]>([]);

// 状态更新表单
const statusForm = ref({
  newStatus: '',
  note: ''
});

// 状态选项
const statusOptions = ref([
  { value: '待清洗', label: '待清洗' },
  { value: '清洗中', label: '清洗中' },
  { value: '清洗完成', label: '清洗完成' },
  { value: '质检中', label: '质检中' },
  { value: '质检完成', label: '质检完成' },
  { value: '待取件', label: '待取件' },
  { value: '已取件', label: '已取件' }
]);

// 页面加载时获取参数
onLoad((options) => {
  if (options.garmentInfo) {
    garmentInfo.value = JSON.parse(decodeURIComponent(options.garmentInfo));
    loadStatusHistory();
  }
});

// 加载状态历史记录
const loadStatusHistory = async () => {
  try {
    const response = await AioveuQRCodeAPI.getStatusHistory({
      garmentCode: garmentInfo.value.garmentCode
    });
    statusHistory.value = response.data;
  } catch (error) {
    console.error('加载历史记录失败:', error);
  }
};

// 更新状态
const updateStatus = async () => {
  try {
    await AioveuQRCodeAPI.updateStatus({
      garmentCode: garmentInfo.value.garmentCode,
      newStatus: statusForm.value.newStatus,
      operatorId: 1, // 操作员ID
      note: statusForm.value.note
    });

    uni.showToast({
      title: '状态更新成功',
      icon: 'success'
    });

    // 刷新状态历史
    loadStatusHistory();

    // 更新当前状态显示
    garmentInfo.value.currentStatus = statusForm.value.newStatus;

    // 重置表单
    statusForm.value = {
      newStatus: '',
      note: ''
    };
  } catch (error) {
    console.error('状态更新失败:', error);
    uni.showToast({
      title: '状态更新失败',
      icon: 'error'
    });
  }
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 格式化历史记录内容
const formatHistoryContent = (history: any) => {
  return `${formatDate(history.updateTime)} | 操作员: ${history.operatorName}\n${history.note || '无备注'}`;
};

// 获取状态样式类
const getStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    '待清洗': 'status-pending',
    '清洗中': 'status-in-progress',
    '清洗完成': 'status-completed',
    '质检中': 'status-in-progress',
    '质检完成': 'status-completed',
    '待取件': 'status-pending',
    '已取件': 'status-completed'
  };

  return statusClasses[status] || '';
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
.garment-info-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.label {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.value {
  color: #333;
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.status-pending {
  background-color: #ffc107;
  color: #333;
}

.status-in-progress {
  background-color: #0dcaf0;
  color: white;
}

.status-completed {
  background-color: #198754;
  color: white;
}
</style>
