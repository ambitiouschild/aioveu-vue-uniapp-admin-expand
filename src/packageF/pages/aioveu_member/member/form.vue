<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 会员卡号 -->
      <view class="form-item">
        <text class="form-label">会员卡号</text>
        <input
            type="text"
            class="form-input"
            placeholder="请输入会员卡号"
            v-model="formData.memberNo"
        />
      </view>

      <!-- 会员姓名 -->
      <view class="form-item">
        <text class="form-label">会员姓名</text>
        <input
            type="text"
            class="form-input"
            placeholder="请输入会员姓名"
            v-model="formData.name"
        />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input
            type="tel"
            class="form-input"
            placeholder="请输入手机号"
            v-model="formData.phone"
        />
      </view>

      <!-- 身份证号 -->
      <view class="form-item">
        <text class="form-label">身份证号</text>
        <input
            type="text"
            class="form-input"
            placeholder="请输入身份证号"
            v-model="formData.idCard"
        />
      </view>

      <!-- 会员等级 -->
      <view class="form-item">
        <text class="form-label">会员等级</text>
        <picker
            class="form-picker"
            mode="selector"
            :range="memberLevelOptions"
            range-key="levelName"
            :value="levelIndex"
            @change="onLevelChange"
        >
          <view class="picker-view">
            {{ levelIndex >= 0 ? memberLevelOptions[levelIndex].levelName : '请选择会员等级' }}
          </view>
        </picker>
      </view>

      <!-- 入会时间 -->
      <view class="form-item">
        <text class="form-label">入会时间</text>
        <picker
            mode="datetime"
            :value="formData.joinDate"
            @change="onJoinDateChange"
        >
          <view class="picker-view">
            {{ formData.joinDate || '请选择入会时间' }}
          </view>
        </picker>
      </view>

      <!-- 累计消费金额 -->
      <view class="form-item">
        <text class="form-label">累计消费金额</text>
        <input
            type="number"
            class="form-input"
            placeholder="请输入累计消费金额"
            v-model="formData.totalConsumption"
        />
      </view>

      <!-- 最后到店时间 -->
      <view class="form-item">
        <text class="form-label">最后到店时间</text>
        <picker
            mode="datetime"
            :value="formData.lastVisit"
            @change="onLastVisitChange"
        >
          <view class="picker-view">
            {{ formData.lastVisit || '请选择最后到店时间' }}
          </view>
        </picker>
      </view>

      <!-- 状态 -->
      <view class="form-item">
        <text class="form-label">状态</text>
        <picker
            class="form-picker"
            mode="selector"
            :range="memberStatusOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? memberStatusOptions[statusIndex].label : '请选择状态' }}
          </view>
        </picker>
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="form-btn cancel" @click="handleCancel">取消</button>
      <button class="form-btn confirm" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuMemberAPI from "@/packageF/api/aioveuMember/aioveu-member";
import AioveuMemberLevelAPI from "@/packageF/api/aioveuMemberLevel/aioveu-member-level";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuMemberForm",
  setup() {
    const formTitle = ref('新增会员');
    const memberId = ref(undefined);

    const formData = reactive({
      memberNo: '',
      name: '',
      phone: '',
      idCard: '',
      levelId: undefined,
      joinDate: '',
      totalConsumption: undefined,
      lastVisit: '',
      status: undefined
    });

    const memberLevelOptions = ref([]);
    const memberStatusOptions = ref([]);

    const levelIndex = ref(-1);
    const statusIndex = ref(-1);

    const loading = ref(true);

    onLoad((options) => {
      // 加载会员等级选项
      loadMemberLevelOptions();
      // 加载状态选项
      loadStatusOptions();

      if (options.id) {
        memberId.value = Number(options.id);
        formTitle.value = '编辑会员';
        loadMemberData();
      } else {
        formTitle.value = '新增会员';
        loading.value = false;
      }
    });

    // 加载会员数据
    const loadMemberData = async () => {
      if (!memberId.value) return;

      try {
        loading.value = true;
        const data = await AioveuMemberAPI.getFormData(memberId.value);
        Object.assign(formData, data);

        // 设置会员等级索引
        if (formData.levelId !== undefined) {
          const index = memberLevelOptions.value.findIndex(
              item => item.id === formData.levelId
          );
          levelIndex.value = index;
        }

        // 设置状态索引
        if (formData.status !== undefined) {
          const index = memberStatusOptions.value.findIndex(
              item => Number(item.value) === formData.status
          );
          statusIndex.value = index;
        }
      } catch (error) {
        console.error('加载会员数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    // 加载会员等级选项
    const loadMemberLevelOptions = async () => {
      try {
        const response = await AioveuMemberLevelAPI.getAllMemberLevelsOptions();
        if (Array.isArray(response)) {
          memberLevelOptions.value = response;
        }
      } catch (error) {
        console.error('加载会员等级选项失败:', error);
        uni.showToast({
          title: '加载会员等级选项失败',
          icon: 'none'
        });
      }
    };

    // 加载状态选项
    const loadStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('member_status');
        memberStatusOptions.value = response;
      } catch (error) {
        console.error('加载状态选项失败:', error);
        uni.showToast({
          title: '加载状态选项失败',
          icon: 'none'
        });
      }
    };

    // 会员等级选择变化
    const onLevelChange = (e) => {
      const index = e.detail.value;
      levelIndex.value = index;
      if (memberLevelOptions.value[index]) {
        formData.levelId = memberLevelOptions.value[index].id;
      }
    };

    // 状态选择变化
    const onStatusChange = (e) => {
      const index = e.detail.value;
      statusIndex.value = index;
      if (memberStatusOptions.value[index]) {
        formData.status = Number(memberStatusOptions.value[index].value);
      }
    };

    // 入会时间选择
    const onJoinDateChange = (e) => {
      const value = e.detail.value;
      // 格式化为 YYYY-MM-DD HH:mm:ss
      formData.joinDate = formatDateTime(value);
    };

    // 最后到店时间选择
    const onLastVisitChange = (e) => {
      const value = e.detail.value;
      // 格式化为 YYYY-MM-DD HH:mm:ss
      formData.lastVisit = formatDateTime(value);
    };

    // 日期时间格式化函数
    const formatDateTime = (dateString) => {
      if (!dateString) return '';

      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        if (memberId.value) {
          // 更新会员
          await AioveuMemberAPI.update(memberId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增会员
          await AioveuMemberAPI.add(formData);
          uni.showToast({
            title: "新增成功",
            icon: "success"
          });
        }

        // 返回列表页
        uni.navigateBack();
      } catch (error) {
        console.error('提交表单失败:', error);
        uni.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        uni.hideLoading();
      }
    };

    // 表单验证
    const validateForm = () => {
      if (!formData.memberNo) {
        uni.showToast({
          title: "请输入会员卡号",
          icon: "none"
        });
        return false;
      }

      if (!formData.name) {
        uni.showToast({
          title: "请输入会员姓名",
          icon: "none"
        });
        return false;
      }

      if (!formData.phone) {
        uni.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }

      if (formData.levelId === undefined) {
        uni.showToast({
          title: "请选择会员等级",
          icon: "none"
        });
        return false;
      }

      return true;
    };

    // 取消
    const handleCancel = () => {
      uni.navigateBack();
    };

    return {
      formTitle,
      formData,
      memberLevelOptions,
      memberStatusOptions,
      levelIndex,
      statusIndex,
      onLevelChange,
      onStatusChange,
      onJoinDateChange,
      onLastVisitChange,
      handleSubmit,
      handleCancel
    };
  }
};
</script>

<style lang="scss">
.form-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.form-header {
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;

  .form-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
  }
}

.form-body {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  padding: 24rpx;
  max-height: 70vh;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input, .form-picker, .form-textarea {
  width: 100%;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
}

.picker-view {
  height: 44rpx;
  line-height: 44rpx;
}

/* 表单底部按钮容器 */
.form-footer {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  background: #f8f9fa;
  gap: 24rpx;
  margin-top: 24rpx;
  border-top: 1rpx solid #eaeaea;

  .form-btn {
    flex: 1;
    padding: 20rpx 0;
    border-radius: 12rpx;
    font-size: 30rpx;
    border: none;

    &.cancel {
      background: #f5f5f5;
      color: #666;
    }

    &.confirm {
      background: #5e72e4;
      color: white;
    }
  }
}
</style>
