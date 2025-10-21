<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <uni-nav-bar
      title="衣物详情"
      left-icon="back"
      @clickLeft="handleBack"
      right-text="编辑"
      @clickRight="toggleEditMode"
    />

    <!-- 衣物信息卡片 -->
    <view class="garment-card">
      <!-- 二维码图片 -->
      <image
        :src="garmentInfo.qrCodePath"
        class="qr-code"
        mode="aspectFit"
      />

      <!-- 基本信息 -->
      <view class="info-section">
        <text class="title">衣物信息</text>
        <uni-list>
          <uni-list-item
            title="衣物编码"
            :rightText="garmentInfo.garmentCode"
            :showArrow="false"
          />
          <uni-list-item
            title="衣物类型"
            :rightText="garmentInfo.garmentType"
            :showArrow="false"
          />
          <uni-list-item
            title="问题描述"
            :rightText="garmentInfo.problemDesc"
            :showArrow="false"
          />
          <uni-list-item
            title="处理状态"
            :rightText="getProcessStatusText(garmentInfo.processStatus)"
            :showArrow="false"
          />
          <uni-list-item
            title="基础价格"
            :rightText="`¥${garmentInfo.basePrice}`"
            :showArrow="false"
          />
          <uni-list-item
            title="处理时间"
            :rightText="`${garmentInfo.processingTime}分钟`"
            :showArrow="false"
          />
        </uni-list>
      </view>

      <!-- 订单信息 -->
      <view class="info-section">
        <text class="title">订单信息</text>
        <uni-list>
          <uni-list-item
            title="订单号"
            :rightText="garmentInfo.orderNo"
            :showArrow="false"
          />
          <uni-list-item
            title="订单状态"
            :rightText="getOrderStatusText(garmentInfo.orderStatus)"
            :showArrow="false"
          />
          <uni-list-item
            title="下单时间"
            :rightText="garmentInfo.orderTime"
            :showArrow="false"
          />
        </uni-list>
      </view>

      <!-- 客户信息 -->
      <view class="info-section">
        <text class="title">客户信息</text>
        <uni-list>
          <uni-list-item
            title="会员号"
            :rightText="garmentInfo.memberNo"
            :showArrow="false"
          />
          <uni-list-item
            title="姓名"
            :rightText="garmentInfo.name"
            :showArrow="false"
          />
          <uni-list-item
            title="电话"
            :rightText="garmentInfo.phone"
            :showArrow="false"
          />
        </uni-list>
      </view>
    </view>

    <!-- 编辑表单弹窗 -->
    <uni-popup ref="editPopup" type="bottom">
      <view class="edit-form">
        <text class="form-title">编辑衣物信息</text>

        <uni-forms :modelValue="editForm" label-position="top">
          <uni-forms-item label="问题描述">
            <uni-easyinput
              v-model="editForm.problemDesc"
              placeholder="请输入问题描述"
            />
          </uni-forms-item>

          <uni-forms-item label="处理状态">
            <uni-data-select
              v-model="editForm.processStatus"
              :localdata="processStatusOptions"
            />
          </uni-forms-item>

          <uni-forms-item label="订单状态">
            <uni-data-select
              v-model="editForm.orderStatus"
              :localdata="orderStatusOptions"
            />
          </uni-forms-item>

          <uni-forms-item label="基础价格">
            <uni-easyinput
              v-model="editForm.basePrice"
              type="digit"
              placeholder="请输入基础价格"
            />
          </uni-forms-item>

          <uni-forms-item label="处理时间(分钟)">
            <uni-easyinput
              v-model="editForm.processingTime"
              type="number"
              placeholder="请输入处理时间"
            />
          </uni-forms-item>
        </uni-forms>

        <view class="form-buttons">
          <button class="cancel-btn" @click="closeEditPopup">取消</button>
          <button class="save-btn" @click="saveGarmentInfo">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue';
// 正确方式
import { onLoad, onUnload } from '@dcloudio/uni-app';


// 衣物信息
const garmentInfo  = ref({});


// 编辑表单
const editForm = ref({});
const editPopup = ref(null);

// 状态选项
const processStatusOptions = ref([
  { value: 1, text: "待接收" },
  { value: 2, text: "清洗中" },
  { value: 3, text: "质检中" },
  { value: 4, text: "待取件" },
  { value: 5, text: "已完成" },
  { value: 6, text: "问题处理" }
]);

const orderStatusOptions = ref([
  { value: 1, text: "待支付" },
  { value: 2, text: "已支付" },
  { value: 3, text: "处理中" },
  { value: 4, text: "已完成" },
  { value: 5, text: "已取消" }
]);

// 页面加载时获取参数
onLoad(() => {

  // 从本地存储获取衣物信息
  // 在赋值前使用深拷贝
  const data = uni.getStorageSync('currentGarmentInfo');

  console.log('本地存储信息 data:', data);

  if (data) {
    try {
      // 安全赋值：确保所有字段都被正确设置  确保正确的响应式赋值
      garmentInfo.value = data;
      console.log('赋值后的衣物信息:', garmentInfo.value);
      console.log('赋值后的衣物信息:', garmentInfo.value.customerPhone);
      console.log('赋值后的衣物信息:', garmentInfo.value.garmentCode);
    } catch (e) {
      console.error('解析衣物信息失败:', e);
      uni.showToast({
        title: '数据解析失败',
        icon: 'error'
      });

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);

    }
  }
});

//添加页面卸载时清理逻辑
onUnload(() => {
  // 清理本地存储
  uni.removeStorageSync('currentGarmentInfo');
});

// 获取处理状态文本
const getProcessStatusText = (status) => {
  const option = processStatusOptions.value.find(item => item.value === status);
  return option ? option.text : "未知状态";
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const option = orderStatusOptions.value.find(item => item.value === status);
  return option ? option.text : "未知状态";
};

// 切换编辑模式
const toggleEditMode = () => {
  // 初始化编辑表单
  editForm.value = {
    id: garmentInfo.value.id,
    problemDesc: garmentInfo.value.problemDesc,
    processStatus: garmentInfo.value.processStatus,
    orderStatus: garmentInfo.value.orderStatus,
    basePrice: garmentInfo.value.basePrice,
    processingTime: garmentInfo.value.processingTime
  };

  // 打开编辑弹窗
  editPopup.value.open();
};

// 关闭编辑弹窗
const closeEditPopup = () => {
  editPopup.value.close();
};

// 保存衣物信息
const saveGarmentInfo = async () => {
  try {
    // 显示加载提示
    uni.showLoading({
      title: '保存中...',
      mask: true
    });

    // 调用API更新衣物信息
    const response = await uni.request({
      url: '/api/garment/update',
      method: 'POST',
      data: editForm.value,
      header: {
        'Content-Type': 'application/json'
      }
    });

    // 隐藏加载提示
    uni.hideLoading();

    if (response.statusCode === 200 && response.data.code === '00000') {
      // 更新本地数据
      garmentInfo.value = {
        ...garmentInfo.value,
        ...editForm.value
      };

      // 关闭弹窗
      closeEditPopup();

      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } else {
      throw new Error(response.data.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'error'
    });
  }
};

// 返回上一页
const handleBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.garment-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-top: 20rpx;
}

.qr-code {
  width: 300rpx;
  height: 300rpx;
  display: block;
  margin: 0 auto 40rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
}

.info-section {
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-left: 20rpx;
  border-left: 6rpx solid #007aff;
}

.edit-form {
  background-color: #fff;
  padding: 40rpx;
  border-radius: 24rpx 24rpx 0 0;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
  color: #333;
}

.form-buttons {
  display: flex;
  margin-top: 40rpx;
}

.cancel-btn {
  flex: 1;
  background-color: #f5f5f5;
  color: #333;
  margin-right: 20rpx;
}

.save-btn {
  flex: 1;
  background-color: #007aff;
  color: #fff;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }

  .garment-card {
    display: flex;
    flex-wrap: wrap;
  }

  .info-section {
    flex: 1;
    min-width: 300rpx;
    margin-right: 30rpx;
  }

  .info-section:last-child {
    margin-right: 0;
  }
}

.uni-list-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

</style>
