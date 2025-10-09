<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 订单号 -->
        <view class="filter-item">
          <text class="filter-label">订单号</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="orderOptions"
            range-key="orderNo"
            :value="orderIndex"
            @change="onOrderChange"
          >
            <view class="picker-view">
              {{ orderIndex >= 0 ? orderOptions[orderIndex].orderNo : '请选择订单号' }}
            </view>
          </picker>
        </view>

        <!-- 衣物明细 -->
        <view class="filter-item">
          <text class="filter-label">衣物明细</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="itemOptions"
            range-key="problemDesc"
            :value="itemIndex"
            @change="onItemChange"
          >
            <view class="picker-view">
              {{ itemIndex >= 0 ? itemOptions[itemIndex].problemDesc : '请选择衣物明细' }}
            </view>
          </picker>
        </view>

        <!-- 图片类型 -->
        <view class="filter-item">
          <text class="filter-label">图片类型</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="imageTypeOptions"
            range-key="label"
            :value="imageTypeIndex"
            @change="onImageTypeChange"
          >
            <view class="picker-view">
              {{ imageTypeIndex >= 0 ? imageTypeOptions[imageTypeIndex].label : '请选择图片类型' }}
            </view>
          </picker>
        </view>

        <!-- 上传人 -->
        <view class="filter-item">
          <text class="filter-label">上传人</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="employeeOptions"
            range-key="employeeName"
            :value="employeeIndex"
            @change="onEmployeeChange"
          >
            <view class="picker-view">
              {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择上传人' }}
            </view>
          </picker>
        </view>

        <view class="filter-buttons">
          <button class="filter-btn reset" @click="handleResetQuery">重置</button>
          <button class="filter-btn confirm" @click="handleQuery">搜索</button>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-buttons">
      <button
        :v-has-perm="['aioveuLaundryProcessImage:aioveu-laundry-process-image:add']"
        class="action-btn add"
        @click="handleOpenForm"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuLaundryProcessImage:aioveu-laundry-process-image:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
      <button
        :v-has-perm="['aioveuLaundryProcessImage:aioveu-laundry-process-image:import']"
        class="action-btn import"
        @click="handleImportClick"
      >
        <text>📥</text>
        <text>导入</text>
      </button>
      <button
        :v-has-perm="['aioveuLaundryProcessImage:aioveu-laundry-process-image:export']"
        class="action-btn export"
        @click="handleExportClick"
      >
        <text>📤</text>
        <text>导出</text>
      </button>
    </view>

    <!-- 图片记录列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无图片记录</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="image-card"
      >
        <view class="card-header">
          <text class="order-no">{{ item.orderNo }}</text>
          <text class="image-type">{{ getImageTypeText(item.imageType) }}</text>
        </view>

        <view class="card-content">
          <view class="image-container">
            <image
              :src="item.imageUrl"
              mode="aspectFill"
              class="process-image"
              @click="previewImage(item.imageUrl)"
            />
          </view>

          <view class="info-row">
            <text class="info-label">衣物明细:</text>
            <text class="info-value">{{ item.problemDesc || '无' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">上传人:</text>
            <text class="info-value">{{ item.uploadUserName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">描述:</text>
            <text class="info-value">{{ item.description || '无' }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ formatTime(item.createTime) }}</text>
            <text>更新: {{ formatTime(item.updateTime) }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuLaundryProcessImage:aioveu-laundry-process-image:edit']"
              class="action-btn edit"
              @click.stop="handleOpenForm(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuLaundryProcessImage:aioveu-laundry-process-image:delete']"
              class="action-btn delete"
              @click.stop="handleDelete(item.id)"
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

<script>
import { ref, reactive, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AioveuLaundryProcessImageAPI from "@/packageG/api/aioveuLaundryProcessImage/aioveu-laundry-process-image";
import AioveuLaundryOrderAPI from "@/packageG/api/aioveuLaundryOrder/aioveu-laundry-order";
import AioveuLaundryOrderItemAPI from "@/packageG/api/aioveuLaundryOrderItem/aioveu-laundry-order-item";
import AioveuEmployeeAPI from "@/packageG/api/aioveuEmployee/aioveu-employee";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuLaundryProcessImage",
  setup() {
    const loading = ref(false);
    const removeIds = ref([]);
    const total = ref(0);
    const showFilter = ref(false);

    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      orderId: null,
      itemId: null,
      imageType: null,
      uploadUser: null
    });

    const pageData = ref([]);
    const orderOptions = ref([]);
    const itemOptions = ref([]);
    const imageTypeOptions = ref([]);
    const employeeOptions = ref([]);

    const orderIndex = ref(-1);
    const itemIndex = ref(-1);
    const imageTypeIndex = ref(-1);
    const employeeIndex = ref(-1);

    // 切换筛选显示
    const toggleFilter = () => {
      showFilter.value = !showFilter.value;
    };

    // 订单选择变化
    const onOrderChange = (e) => {
      const index = e.detail.value;
      orderIndex.value = index;
      if (orderOptions.value[index]) {
        queryParams.orderId = orderOptions.value[index].orderId;
      } else {
        queryParams.orderId = null;
      }
    };

    // 衣物明细选择变化
    const onItemChange = (e) => {
      const index = e.detail.value;
      itemIndex.value = index;
      if (itemOptions.value[index]) {
        queryParams.itemId = itemOptions.value[index].itemId;
      } else {
        queryParams.itemId = null;
      }
    };

    // 图片类型选择变化
    const onImageTypeChange = (e) => {
      const index = e.detail.value;
      imageTypeIndex.value = index;
      if (imageTypeOptions.value[index]) {
        queryParams.imageType = Number(imageTypeOptions.value[index].value);
      } else {
        queryParams.imageType = null;
      }
    };

    // 上传人选择变化
    const onEmployeeChange = (e) => {
      const index = e.detail.value;
      employeeIndex.value = index;
      if (employeeOptions.value[index]) {
        queryParams.uploadUser = employeeOptions.value[index].employeeId;
      } else {
        queryParams.uploadUser = null;
      }
    };

    // 查询图片记录 - 关键修复
    const handleQuery = () => {
      loading.value = true;

      // 创建参数对象 - 只包含有效值
      const params = {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        // 只添加有值的参数
        ...(queryParams.orderId !== null && { orderId: queryParams.orderId }),
        ...(queryParams.itemId !== null && { itemId: queryParams.itemId }),
        ...(queryParams.imageType !== null && { imageType: queryParams.imageType }),
        ...(queryParams.uploadUser !== null && { uploadUser: queryParams.uploadUser }),
        // 强制添加排序参数
        orderBy: 'id',
        order: 'desc'
      };

      console.log('查询参数:', params); // 调试日志

      AioveuLaundryProcessImageAPI.getPage(params)
        .then((data) => {
          // 关键修复：确保正确更新响应式数据
          pageData.value = data.list;
          total.value = data.total;

          console.log('查询成功，当前页码:', queryParams.pageNum, '数据量:', data.list.length);
            console.log('第一条数据ID:', data.list[0].id);
            console.log('最后一条数据ID:', data.list[data.list.length-1].id);
        })
        .catch(error => {
          console.error('查询图片记录失败:', error);
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
      queryParams.orderId = null;
      queryParams.itemId = null;
      queryParams.imageType = null;
      queryParams.uploadUser = null;
      orderIndex.value = -1;
      itemIndex.value = -1;
      imageTypeIndex.value = -1;
      employeeIndex.value = -1;
      handleQuery();
    };

    // 上一页
    const prevPage = () => {
      if (queryParams.pageNum > 1) {
        queryParams.pageNum--;
        console.log('上一页，新页码:', queryParams.pageNum);
        handleQuery();
      }
    };

    // 下一页 - 关键修复
    const nextPage = () => {
      // 关键修复：正确的下一页判断条件
      if (queryParams.pageNum * queryParams.pageSize < total.value) {
        queryParams.pageNum++;
        console.log('下一页，新页码:', queryParams.pageNum);
        handleQuery();
      }
    };

    // 行选择变化
    const handleSelectionChange = (selection) => {
      removeIds.value = selection
        .map(item => item.id)
        .filter(id => id !== undefined && id !== null);
    };

    const needRefresh = ref(false);

    onShow(() => {
      if (needRefresh.value) {
        handleQuery();
        needRefresh.value = false;
      }
    });

    // 打开表单页
    const handleOpenForm = (id) => {
      needRefresh.value = true; // 标记需要刷新
      let url = '/packageG/pages/aioveu_laundry/laundry_process_image/form';
      if (id !== undefined) {
        url += `?id=${id}`;
      }
      uni.navigateTo({ url });
    };

    // 删除图片记录
    const handleDelete = (id) => {
      const ids = id ? [id] : removeIds.value;

      if (ids.length === 0) {
        uni.showToast({
          title: "请选择要删除的图片记录",
          icon: "none"
        });
        return;
      }

      uni.showModal({
        title: '提示',
        content: '确认删除选中的图片记录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '删除中...' });
            AioveuLaundryProcessImageAPI.deleteByIds(ids.join(","))
              .then(() => {
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                handleQuery();
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

    // 获取图片类型文本
    const getImageTypeText = (imageType) => {
      const item = imageTypeOptions.value.find(i => Number(i.value) === imageType);
      return item ? item.label : '未知类型';
    };

    // 格式化时间
    const formatTime = (time) => {
      return time ? time.substring(0, 16) : '';
    };

    // 预览图片
    const previewImage = (url) => {
      uni.previewImage({
        urls: [url],
        current: 0
      });
    };

    // 导入功能
    const handleImportClick = () => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uni.showLoading({ title: '导入中...' });

          // 这里应该调用导入API
          // AioveuLaundryProcessImageAPI.importData(tempFilePath)
          //   .then(() => {
          //     uni.showToast({
          //       title: '导入成功',
          //       icon: 'success'
          //     });
          //     handleQuery();
          //   })
          //   .catch(error => {
          //     console.error('导入失败:', error);
          //     uni.showToast({
          //       title: '导入失败',
          //       icon: 'none'
          //     });
          //   })
          //   .finally(() => uni.hideLoading());

          // 模拟导入成功
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: '导入成功',
              icon: 'success'
            });
            handleQuery();
          }, 2000);
        }
      });
    };

    // 导出功能
    const handleExportClick = () => {
      uni.showLoading({ title: '导出中...' });

      // 这里应该调用导出API
      // AioveuLaundryProcessImageAPI.exportData(queryParams)
      //   .then(response => {
      //     // 处理导出文件
      //     const filePath = `${uni.env.USER_DATA_PATH}/export.xlsx`;
      //     uni.saveFile({
      //       tempFilePath: response.data,
      //       filePath: filePath,
      //       success: () => {
      //         uni.openDocument({
      //           filePath: filePath,
      //           showMenu: true,
      //           success: () => {
      //             uni.hideLoading();
      //           }
      //         });
      //       }
      //     });
      //   })
      //   .catch(error => {
      //     console.error('导出失败:', error);
      //     uni.showToast({
      //       title: '导出失败',
      //       icon: 'none'
      //     });
      //   })
      //   .finally(() => uni.hideLoading());

      // 模拟导出成功
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        });
      }, 2000);
    };


    // 加载订单选项
    const loadOrderOptions = () => {
      AioveuLaundryOrderAPI.getAllLaundryOrderOptions()
        .then(response => {
          if (Array.isArray(response)) {
            orderOptions.value = response;
          }
        })
        .catch(error => {
          console.error('加载订单选项失败:', error);
        });
    };

    // 加载衣物明细选项
    const loadItemOptions = () => {
      AioveuLaundryOrderItemAPI.getAllLaundryOrderItemOptions()
        .then(response => {
          if (Array.isArray(response)) {
            itemOptions.value = response;
          }
        })
        .catch(error => {
          console.error('加载衣物明细选项失败:', error);
        });
    };

    // 加载图片类型选项
    const loadImageTypeOptions = () => {
      DictAPI.getDictItems('laundry_process_image_image_type')
        .then(response => {
          imageTypeOptions.value = response;
        })
        .catch(error => {
          console.error('加载图片类型选项失败:', error);
        });
    };

    // 加载员工选项
    const loadEmployeeOptions = () => {
      AioveuEmployeeAPI.getAllEmployeeOptions()
        .then(response => {
          if (Array.isArray(response)) {
            employeeOptions.value = response;
          }
        })
        .catch(error => {
          console.error('加载员工选项失败:', error);
        });
    };

    onMounted(() => {
      handleQuery();
      loadOrderOptions();
      loadItemOptions();
      loadImageTypeOptions();
      loadEmployeeOptions();
    });

    return {
      loading,
      removeIds,
      total,
      showFilter,
      queryParams,
      pageData,
      orderOptions,
      itemOptions,
      imageTypeOptions,
      employeeOptions,
      orderIndex,
      itemIndex,
      imageTypeIndex,
      employeeIndex,
      toggleFilter,
      onOrderChange,
      onItemChange,
      onImageTypeChange,
      onEmployeeChange,
      handleQuery,
      handleResetQuery,
      prevPage,
      nextPage,
      handleOpenForm,
      handleDelete,
      handleImportClick,
      handleExportClick,
      getImageTypeText,
      formatTime,
      previewImage
    };
  }
};
</script>

<style lang="scss">
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

.filter-input, .filter-picker, .filter-textarea {
  width: 100%;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
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
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.action-btn {
  flex: 1;
  min-width: 150rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
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

  &.import {
    background: #5e72e4;
    color: white;
  }

  &.export {
    background: #11cdef;
    color: white;
  }
}

/* 图片记录列表 */
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

.image-card {
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

  .order-no {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .image-type {
    font-size: 28rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    background-color: rgba(94, 114, 228, 0.1);
    color: #5e72e4;
    font-weight: 500;
  }
}

.card-content {
  margin-bottom: 24rpx;
}

.image-container {
  width: 100%;
  height: 300rpx;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
