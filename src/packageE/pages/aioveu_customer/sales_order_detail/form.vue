<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 订单 -->
      <view class="form-item">
        <text class="form-label">订单</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="salesOrderOptions"
          range-key="salesOrderNo"
          :value="salesOrderIndex"
          @change="onSalesOrderChange"
        >
          <view class="picker-view">
            {{ salesOrderIndex >= 0 ? salesOrderOptions[salesOrderIndex].salesOrderNo : '请选择订单' }}
          </view>
        </picker>
      </view>

      <!-- 物资 -->
      <view class="form-item">
        <text class="form-label">物资</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="materialOptions"
          range-key="materialName"
          :value="materialIndex"
          @change="onMaterialChange"
        >
          <view class="picker-view">
            {{ materialIndex >= 0 ? materialOptions[materialIndex].materialName : '请选择物资' }}
          </view>
        </picker>
      </view>

      <!-- 数量 -->
      <view class="form-item">
        <text class="form-label">数量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入数量"
          v-model="formData.quantity"
        />
      </view>

      <!-- 单价 -->
      <view class="form-item">
        <text class="form-label">单价</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入单价"
          v-model="formData.unitPrice"
        />
      </view>

      <!-- 折扣率 -->
      <view class="form-item">
        <text class="form-label">折扣率</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入折扣率"
          v-model="formData.discount"
        />
      </view>

      <!-- 税率 -->
      <view class="form-item">
        <text class="form-label">税率</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入税率"
          v-model="formData.taxRate"
        />
      </view>

      <!-- 小计 -->
      <view class="form-item">
        <text class="form-label">小计</text>
        <input
          type="number"
          class="form-input"
          placeholder="自动计算"
          v-model="formData.subtotal"
          disabled
        />
      </view>

      <!-- 税额 -->
      <view class="form-item">
        <text class="form-label">税额</text>
        <input
          type="number"
          class="form-input"
          placeholder="自动计算"
          v-model="formData.taxAmount"
          disabled
        />
      </view>

      <!-- 总金额 -->
      <view class="form-item">
        <text class="form-label">总金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="自动计算"
          v-model="formData.totalPrice"
          disabled
        />
      </view>

      <!-- 批次号 -->
      <view class="form-item">
        <text class="form-label">批次号</text>
          <input
            type="text"
            class="form-input"
            placeholder="请输入批次号"
            v-model="formData.batchNumber"
          />
      </view>

      <!-- 要求交货日期 -->
      <view class="form-item">
        <text class="form-label">要求交货日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.deliveryDate"
          @change="onDeliveryDateChange"
        >
          <view class="picker-view">
            {{ formData.deliveryDate || '请选择要求交货日期' }}
          </view>
        </picker>
      </view>

      <!-- 发货仓库 -->
      <view class="form-item">
        <text class="form-label">发货仓库</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="warehouseOptions"
          range-key="warehouseName"
          :value="warehouseIndex"
          @change="onWarehouseChange"
        >
          <view class="picker-view">
            {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].warehouseName : '请选择发货仓库' }}
          </view>
        </picker>
      </view>

      <!-- 明细状态 -->
      <view class="form-item">
        <text class="form-label">明细状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="statusOptions"
          range-key="label"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? statusOptions[statusIndex].label : '请选择明细状态' }}
          </view>
        </picker>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuSalesOrderDetailAPI, {
  AioveuSalesOrderDetailForm
} from "@/packageE/api/aioveuSalesOrderDetail/aioveu-sales-order-detail";
import AioveuSalesOrderAPI, { SalesOrderOptionVO } from "@/packageE/api/aioveuSalesOrder/aioveu-sales-order";
import AioveuMaterialAPI, { MaterialOptionVO } from "@/packageE/api/aioveuMaterial/aioveu-material";
import AioveuWarehouseAPI, { WarehouseOptionVO } from "@/packageE/api/aioveuWarehouse/aioveu-warehouse";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增订单明细');
const detailId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingSalesOrderDetailId = ref<number | undefined>(undefined);

const formData = reactive<AioveuSalesOrderDetailForm>({
  // quantity: 0,
  // unitPrice: 0,
  // discount: 0,
  // taxRate: 0,
  // subtotal: 0,
  // taxAmount: 0,
  // totalPrice: 0,
});

const salesOrderOptions = ref<SalesOrderOptionVO[]>([]);
const materialOptions = ref<MaterialOptionVO[]>([]);
const warehouseOptions = ref<WarehouseOptionVO[]>([]);
const statusOptions = ref<DictItemOption[]>([]);

const salesOrderIndex = ref(-1);
const materialIndex = ref(-1);
const warehouseIndex = ref(-1);
const statusIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadSalesOrderOptions();
  loadMaterialOptions();
  loadWarehouseOptions();
  loadDictOptions();


  if (options.id) {
    detailId.value = Number(options.id);
    formTitle.value = '编辑订单明细';
    loadDetailData(); // 注意：这里改为异步，确保在选项加载后再加载明细
  } else {
    formTitle.value = '新增订单明细';
  }

  // 存储编辑ID
  editingSalesOrderDetailId.value = detailId.value;


});

// 监听数量、单价、折扣率、税率变化，自动计算金额
watch(
  () => [formData.quantity, formData.unitPrice, formData.discount, formData.taxRate],
  ([quantity, unitPrice, discount, taxRate]) => {
    // 转换为数字类型
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const disc = Number(discount) || 0;
    const tax = Number(taxRate) || 0;

    // // 计算小计（数量 * 单价 * (1 - 折扣率)）
    // const subtotal = qty * price * (1 - disc / 100);
    // formData.subtotal = parseFloat(subtotal.toFixed(2));
    //
    // // 计算税额（小计 * 税率）
    // const taxAmount = subtotal * (tax / 100);
    // formData.taxAmount = parseFloat(taxAmount.toFixed(2));
    //
    // // 计算总金额（小计 + 税额）
    // const totalPrice = subtotal + taxAmount;
    // formData.totalPrice = parseFloat(totalPrice.toFixed(2));
  },
  { deep: true }
);

// 加载订单明细数据
const loadDetailData = async () => {
  if (!detailId.value) return;

  try {
    loading.value = true;
    const data = await AioveuSalesOrderDetailAPI.getFormData(detailId.value);
    Object.assign(formData, data);

    // 设置选项索引
    if (formData.orderName) {
      const orderIdx = salesOrderOptions.value.findIndex(order => order.salesOrderNo === formData.orderName);
      salesOrderIndex.value = orderIdx;
    }

    if (formData.materialName) {
      const materialIdx = materialOptions.value.findIndex(material => material.materialName === formData.materialName);
      materialIndex.value = materialIdx;
    }

    if (formData.warehouseName) {
      const warehouseIdx = warehouseOptions.value.findIndex(warehouse => warehouse.warehouseName === formData.warehouseName);
      warehouseIndex.value = warehouseIdx;
    }

    if (formData.status !== undefined) {
      const statusIdx = statusOptions.value.findIndex(opt => Number(opt.value) === formData.status);
      statusIndex.value = statusIdx;
    }
  } catch (error) {
    console.error('加载订单明细数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载销售订单选项
const loadSalesOrderOptions = async () => {
  try {
    const response = await AioveuSalesOrderAPI.getAllSalesOrderOptions();
    if (Array.isArray(response)) {
      salesOrderOptions.value = response.map(order => ({
        salesOrderId: Number(order.salesOrderId),
        salesOrderNo: order.salesOrderNo
      }));
    }
  } catch (error) {
    console.error('加载销售订单列表失败:', error);
    uni.showToast({
      title: '加载销售订单列表失败',
      icon: 'none'
    });
  }
};

// 加载物资选项
const loadMaterialOptions = async () => {
  try {
    const response = await AioveuMaterialAPI.getAllMaterialOptions();
    if (Array.isArray(response)) {
      materialOptions.value = response.map(material => ({
        materialId: Number(material.materialId),
        materialName: material.materialName
      }));
    }
  } catch (error) {
    console.error('加载物资列表失败:', error);
    uni.showToast({
      title: '加载物资列表失败',
      icon: 'none'
    });
  }
};

// 加载仓库选项
const loadWarehouseOptions = async () => {
  try {
    const response = await AioveuWarehouseAPI.getAllWarehouseOptions();
    if (Array.isArray(response)) {
      warehouseOptions.value = response.map(warehouse => ({
        warehouseId: Number(warehouse.warehouseId),
        warehouseName: warehouse.warehouseName
      }));
    }
  } catch (error) {
    console.error('加载仓库列表失败:', error);
    uni.showToast({
      title: '加载仓库列表失败',
      icon: 'none'
    });
  }
};

// 加载字典选项
const loadDictOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('salesOrderDetail_status');
    statusOptions.value = response || [];
  } catch (error) {
    console.error('加载字典选项失败:', error);
    uni.showToast({
      title: '加载选项失败',
      icon: 'none'
    });
  }
};

// 订单选择变化
const onSalesOrderChange = (e: any) => {
  const index = e.detail.value;
  salesOrderIndex.value = index;
  if (salesOrderOptions.value[index]) {
    formData.orderName = salesOrderOptions.value[index].salesOrderNo;
    formData.orderId = salesOrderOptions.value[index].salesOrderId;
    //两个字段都要赋值判断
  }
};

// 物资选择变化
const onMaterialChange = (e: any) => {
  const index = e.detail.value;
  materialIndex.value = index;
  if (materialOptions.value[index]) {
    formData.materialName = materialOptions.value[index].materialName;
  }
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    formData.warehouseName = warehouseOptions.value[index].warehouseName;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (statusOptions.value[index]) {
    formData.status = Number(statusOptions.value[index].value);
  }
};

// 交货日期选择变化
const onDeliveryDateChange = (e: any) => {
  formData.deliveryDate = e.detail.value;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingSalesOrderDetailId.value;

    if (id) {
      // 更新订单明细
      await AioveuSalesOrderDetailAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增订单明细
      await AioveuSalesOrderDetailAPI.add(formData);
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
  if (!formData.orderName) {
    uni.showToast({
      title: "请选择订单",
      icon: "none"
    });
    return false;
  }

  if (!formData.materialName) {
    uni.showToast({
      title: "请选择物资",
      icon: "none"
    });
    return false;
  }

  if (formData.quantity === undefined || formData.quantity <= 0) {
    uni.showToast({
      title: "请输入有效的数量",
      icon: "none"
    });
    return false;
  }

  if (formData.unitPrice === undefined || formData.unitPrice <= 0) {
    uni.showToast({
      title: "请输入有效的单价",
      icon: "none"
    });
    return false;
  }

  if (formData.warehouseName === undefined) {
    uni.showToast({
      title: "请选择发货仓库",
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

.form-input[disabled] {
  background-color: #f8f9fa;
  color: #666;
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
