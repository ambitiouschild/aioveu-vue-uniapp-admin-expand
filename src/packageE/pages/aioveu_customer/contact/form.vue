<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 客户 -->
      <view class="form-item">
        <text class="form-label">客户</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="customerOptions"
          range-key="customerName"
          :value="customerIndex"
          @change="onCustomerChange"
        >
          <view class="picker-view">
            {{ customerIndex >= 0 ? customerOptions[customerIndex].customerName : '请选择客户' }}
          </view>
        </picker>
      </view>

      <!-- 联系人姓名 -->
      <view class="form-item">
        <text class="form-label">联系人姓名</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入联系人姓名"
          v-model="formData.name"
        />
      </view>

      <!-- 职位 -->
      <view class="form-item">
        <text class="form-label">职位</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入职位"
          v-model="formData.position"
        />
      </view>

      <!-- 部门 -->
      <view class="form-item">
        <text class="form-label">部门</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入部门"
          v-model="formData.department"
        />
      </view>

      <!-- 手机号码 -->
      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input
          type="tel"
          class="form-input"
          placeholder="请输入手机号码"
          v-model="formData.mobile"
        />
      </view>

      <!-- 办公电话 -->
      <view class="form-item">
        <text class="form-label">办公电话</text>
        <input
          type="tel"
          class="form-input"
          placeholder="请输入办公电话"
          v-model="formData.phone"
        />
      </view>

      <!-- 电子邮箱 -->
      <view class="form-item">
        <text class="form-label">电子邮箱</text>
        <input
          type="email"
          class="form-input"
          placeholder="请输入电子邮箱"
          v-model="formData.email"
        />
      </view>

      <!-- 微信号 -->
      <view class="form-item">
        <text class="form-label">微信号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入微信号"
          v-model="formData.wechat"
        />
      </view>

      <!-- 主联系人 -->
      <view class="form-item">
        <text class="form-label">主联系人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="isPrimaryOptions"
          range-key="label"
          :value="isPrimaryIndex"
          @change="onIsPrimaryChange"
        >
          <view class="picker-view">
            {{ isPrimaryIndex >= 0 ? isPrimaryOptions[isPrimaryIndex].label : '请选择主联系人' }}
          </view>
        </picker>
      </view>

      <!-- 性别 -->
      <view class="form-item">
        <text class="form-label">性别</text>
        <picker
          class="form-picker"
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

      <!-- 生日 -->
      <view class="form-item">
        <text class="form-label">生日</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.birthday"
          @change="onBirthdayChange"
        >
          <view class="picker-view">
            {{ formData.birthday || '请选择生日' }}
          </view>
        </picker>
      </view>

      <!-- 兴趣爱好 -->
      <view class="form-item">
        <text class="form-label">兴趣爱好</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入兴趣爱好"
          v-model="formData.hobbies"
        />
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          placeholder="请输入备注"
          v-model="formData.notes"
        />
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="form-btn cancel" @click="handleCancel">取消</button>
      <button class="form-btn confirm" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuContactAPI, {
  AioveuContactForm
} from "@/packageE/api/aioveuContact/aioveu-contact";
import AioveuCustomerAPI, { CustomerOptionVO } from "@/packageE/api/aioveuCustomer/aioveu-customer";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增联系人');
const contactId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingContactId = ref<number | undefined>(undefined);

const formData = reactive<AioveuContactForm>({});

const customerOptions = ref<CustomerOptionVO[]>([]);
const isPrimaryOptions = ref<DictItemOption[]>([]);
const genderOptions = ref<DictItemOption[]>([]);

const customerIndex = ref(-1);
const isPrimaryIndex = ref(-1);
const genderIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadCustomerOptions();
  loadDictOptions();

  if (options.id) {
    contactId.value = Number(options.id);
    formTitle.value = '编辑联系人';
    loadContactData();
  } else {
    formTitle.value = '新增联系人';
  }

  // 存储编辑ID
  editingContactId.value = contactId.value;


});

// 加载联系人数据
const loadContactData = async () => {
  if (!contactId.value) return;

  try {
    loading.value = true;
    const data = await AioveuContactAPI.getFormData(contactId.value);
    Object.assign(formData, data);

    // 设置选项索引
    if (formData.customerName) {
      const custIdx = customerOptions.value.findIndex(cust => cust.customerName === formData.customerName);
      customerIndex.value = custIdx;
    }

    if (formData.isPrimary !== undefined) {
      const primaryIdx = isPrimaryOptions.value.findIndex(opt => Number(opt.value) === formData.isPrimary);
      isPrimaryIndex.value = primaryIdx;
    }

    if (formData.gender !== undefined) {
      const genderIdx = genderOptions.value.findIndex(opt => Number(opt.value) === formData.gender);
      genderIndex.value = genderIdx;
    }
  } catch (error) {
    console.error('加载联系人数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载客户选项
const loadCustomerOptions = async () => {
  try {
    const response = await AioveuCustomerAPI.getAllCustomerOptions();
    if (Array.isArray(response)) {
      customerOptions.value = response.map(cust => ({
        customerId: Number(cust.customerId),
        customerName: cust.customerName
      }));
    }
  } catch (error) {
    console.error('加载客户列表失败:', error);
    uni.showToast({
      title: '加载客户列表失败',
      icon: 'none'
    });
  }
};

// 加载字典选项
const loadDictOptions = async () => {
  try {
    const primaryResp = await DictAPI.getDictItems('contact_is_primary');
    isPrimaryOptions.value = primaryResp;

    const genderResp = await DictAPI.getDictItems('gender');
    genderOptions.value = genderResp;
  } catch (error) {
    console.error('加载字典选项失败:', error);
    uni.showToast({
      title: '加载选项失败',
      icon: 'none'
    });
  }
};

// 客户选择变化
const onCustomerChange = (e: any) => {
  const index = e.detail.value;
  customerIndex.value = index;
  if (customerOptions.value[index]) {
    formData.customerName = customerOptions.value[index].customerName;
  }
};

// 主联系人选择变化
const onIsPrimaryChange = (e: any) => {
  const index = e.detail.value;
  isPrimaryIndex.value = index;
  if (isPrimaryOptions.value[index]) {
    formData.isPrimary = Number(isPrimaryOptions.value[index].value);
  }
};

// 性别选择变化
const onGenderChange = (e: any) => {
  const index = e.detail.value;
  genderIndex.value = index;
  if (genderOptions.value[index]) {
    formData.gender = Number(genderOptions.value[index].value);
  }
};

// 生日选择变化
const onBirthdayChange = (e: any) => {
  formData.birthday = e.detail.value;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingContactId.value;

    if (id) {
      // 更新联系人
      await AioveuContactAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增联系人
      await AioveuContactAPI.add(formData);
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
  if (!formData.customerName) {
    uni.showToast({
      title: "请选择客户",
      icon: "none"
    });
    return false;
  }

  if (!formData.name) {
    uni.showToast({
      title: "请输入联系人姓名",
      icon: "none"
    });
    return false;
  }

  if (formData.isPrimary === undefined) {
    uni.showToast({
      title: "请选择是否是主联系人",
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
</script>

<style lang="scss" scoped>
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
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
  width: 100%;
  background-color: white;
}

.form-textarea {
  height: 200rpx;
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
    display: flex;
    align-items: center;
    justify-content: center;

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
