<template>

  <view style="width: 100%; height: var(--status-bar-height)" />
  <view class="home">
    <wd-swiper
      v-model:current="current"
      :list="swiperList"
      autoplay
      @click="handleClick"
      @change="onChange"
    />

    <!-- 快捷导航 -->
    <wd-grid clickable :column="4" class="mt-2">
      <wd-grid-item
        v-for="(item, index) in navList"
        :key="index"
        use-slot
        link-type="navigateTo"
        :url="item.url"
      >
        <view class="p-2">
          <image class="w-72rpx h-72rpx rounded-8rpx" :src="item.icon" />
        </view>
        <view class="text">{{ item.title }}</view>
      </wd-grid-item>
    </wd-grid>

    <!-- 通知公告 -->
    <wd-notice-bar
      text="可我不敌可爱 恰同学少年，风华正茂；书生意气，挥斥方遒。指点江山，激扬文字，粪土当年万户侯。"
      color="#34D19D"
      type="info"
    >
      <template #prefix>
        <wd-tag color="#FAA21E" bg-color="#FAA21E" plain custom-style="margin-right:10rpx">
          通知公告
        </wd-tag>
      </template>
    </wd-notice-bar>

    <!-- 数据统计 -->
    <wd-grid :column="2" :gutter="2">
      <wd-grid-item use-slot custom-class="custom-item">
          <view class="flex justify-start pl-5">
            <!-- 扫描按钮移动到访客数左侧 -->
            <view class="scan-btn-container mr-3">
              <wd-button
                :v-has-perm="(['aioveuQRCode:aioveu-QRCode:scan'])"
                type="primary"
                size="big"
                round
                @click="startQRCodeScan"
                custom-class="scan-btn"
              >
                <image class="w-24rpx h-24rpx" src="/static/icons/scan.png" />
                扫描
              </wd-button>
            </view>

          <view class="flex-center">
            <image class="w-80rpx h-80rpx rounded-8rpx" src="/static/icons/visitor.png" />
            <view class="ml-5 text-left">
              <view class="font-bold">访客数</view>
              <view class="mt-2">{{ visitStatsData.todayUvCount }}</view>
            </view>
          </view>
        </view>
      </wd-grid-item>
      <wd-grid-item use-slot custom-class="custom-item">
        <view class="flex justify-start pl-5">
          <view class="flex-center">
            <image class="w-80rpx h-80rpx rounded-8rpx" src="/static/icons/browser.png" />
            <view class="ml-5 text-left">
              <view class="font-bold">浏览量</view>
              <view class="mt-2">{{ visitStatsData.todayPvCount }}</view>
            </view>
          </view>
        </view>
      </wd-grid-item>
    </wd-grid>

    <wd-card>
      <template #title>
        <view class="flex-between">
          <view>访问趋势</view>
          <view>
            <wd-radio-group
              v-model="recentDaysRange"
              shape="button"
              inline
              @change="handleDataRangeChange"
            >
              <wd-radio :value="7">近7天</wd-radio>
              <wd-radio :value="15">近15天</wd-radio>
            </wd-radio-group>
          </view>
        </view>
      </template>

      <view class="charts-box">
        <qiun-data-charts type="area" :chartData="chartData" :opts="chartOpts" />
      </view>
    </wd-card>
  </view>

  <!-- ZXing 扫描组件 -->
  <!-- 扫描组件（独立于主内容） -->
  <!-- 添加这个类名 -->
  <!-- 添加key强制重新渲染 -->
  <!-- 添加调试边框 -->
    <BarcodeScanner
      v-if="showScanner"
      @decode="handleDecode"
      @close="closeScanner"
      @cancel="handleCancel"
      class="barcode-scanner-container"
      :key="scannerKey"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: black;"
    />

</template>

<script setup lang="ts">
import { dayjs } from "wot-design-uni";

import LogAPI, { VisitStatsVO } from "@/api/system/log";
import { ref } from 'vue';
import AioveuLaundryGarmentIdentityAPI, { QRCodeScanRequest } from '@/api/aioveuLaundryGarmentIdentity/aioveu-laundry-garment-identity'; // 请根据实际路径调整
// 确保路径正确（特别注意大小写）
import BarcodeScanner from '@/components/BarcodeScanner/BarcodeScanner.vue';

const current = ref<number>(0);

const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});
//----------------------------------------
//使用 Uni-app 原生的 uni.scanCodeAPI 实现扫码功能，完全避免使用第三方库和自定义对话框组件
// 扫描相关状态
const showScanner = ref(false);
const scannerKey = ref(0); // 用于强制重新渲染扫描组件
const showSafariHint = ref(false); // Safari专用提示


// 开始扫描
const startQRCodeScan =async () => {

  console.log('[父组件] 扫描按钮被点击');

  // #ifdef H5
  console.log('[父组件] H5环境，显示扫描组件');

  // 统一直接显示扫描组件，让扫描组件内部去处理权限和交互
  showScanner.value = true;
  // 重置扫描组件
  scannerKey.value += 1;

  // 添加状态检查
  nextTick(() => {
    console.log('nextTick后 showScannerr状态:', showScanner.value);
  });

  // 添加 DOM 检查
  // 检查 DOM
  const scanner = document.querySelector('.barcode-scanner-container');
  if (scanner) {
    console.log('扫描组件已渲染');
    console.log('组件位置:', scanner.getBoundingClientRect());
    console.log('组件样式:', getComputedStyle(scanner));
  } else {
    console.log('扫描组件未渲染');
  }


  // #endif

  // #ifndef H5
  // // 非H5环境使用原生扫码
  // console.log('非H5环境，使用原生扫码');
  // uni.scanCode({
  //   onlyFromCamera: true,
  //   scanType: ['qrCode', 'barCode'],
  //   success: (res) =>
  //   {
  //     console.log('原生扫码成功:', res.result);
  //     handleDecode(res.result);
  //   },
  //   fail: (err) => {
  //     console.error('扫码失败:', err);
  //     console.error('原生扫码失败:', err);
  //     uni.showToast({
  //       title: '扫码失败',
  //       icon: 'error'
  //     });
  //   }
  // });
  // #endif
};

// 处理扫描结果
const handleDecode = (result: string) => {
  console.log('扫描结果:', result);
  sendScanRequest(result);
};

// 处理取消事件
const handleCancel = () => {
  console.log('[父组件] 收到取消事件');
  showScanner.value = false;

  // 如果需要返回上一级页面
  // uni.navigateBack();

  // 或者返回首页
  // uni.switchTab({
  //   url: '/pages/index/index'
  // });
};

// 关闭扫描器
const closeScanner = () => {
  showScanner.value = false;
  console.log('[父组件] 关闭扫描器');
};

// 发送扫描请求
const sendScanRequest = async (qrContent: string) => {
  const requestData: QRCodeScanRequest = {
    qrContent: qrContent,
    scannerId: 1,
    deviceInfo: uni.getSystemInfoSync().model,
    // location: await getLocationInfo()
  };

  try {
    uni.showLoading({
      title: '处理中...',
      mask: true
    });

    const response = await AioveuLaundryGarmentIdentityAPI.scanQRCode(requestData);
    console.log('扫描二维码API响应response', response);

    // 保存到本地存储
    uni.setStorageSync('currentGarmentInfo', response);

    console.log('本地存储信息 currentGarmentInfo:', response);

    //衣物详情页面，用于展示从后端获取的衣物信息。同时，这个页面应该允许用户修改某些信息并提交到后端。
    //从扫码页面跳转到详情页：
    uni.navigateTo({
      // url: `/packageG/pages/aioveu_laundry/laundry_garment_info/index?garmentInfo=${encodeURIComponent(JSON.stringify(response))}`
      // 跳转到详情页（不传递参数）
      url: `/packageG/pages/aioveu_laundry/laundry_garment_info/index`,
      success: () => {
              console.log('跳转成功');
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'error'
              });
            }
    });
  } catch (error) {
    console.error('扫描失败:', error);
    uni.showToast({
      title: '扫描失败: ',
      icon: 'error',
      duration: 3000
    });
  } finally {
    uni.hideLoading();
  }
};

// // 获取位置信息
// const getLocationInfo = async (): Promise<string> => {
//   try {
//     const location = await new Promise<UniApp.GetLocationSuccess>((resolve, reject) => {
//       uni.getLocation({
//         type: 'wgs84',
//         success: resolve,
//         fail: reject
//       });
//     });
//
//     return `经度: ${location.longitude}, 纬度: ${location.latitude}`;
//   } catch (error) {
//     console.warn('获取位置失败:', error);
//     // 处理权限被拒绝的情况
//     if (error.errMsg.includes('denied')) {
//       // 显示友好的提示信息
//       uni.showModal({
//         title: '位置权限',
//         content: '请允许位置权限以获取位置信息',
//         confirmText: '去设置',
//         success: (res) => {
//           if (res.confirm) {
//             // 打开系统设置
//             uni.openSetting();
//           }
//         }
//       });
//     }
//     return '未知位置';
//   }
// };




//----------------------------------------

// 图表数据
const chartData = ref({});

const chartOpts = ref({
  padding: [20, 0, 20, 0],
  xAxis: {
    fontSize: 10,
    rotateLabel: true,
    rotateAngle: 30,
  },
  yAxis: {
    disabled: true,
  },
  extra: {
    area: {
      type: "curve",
      opacity: 0.2,
      addLine: true,
      width: 2,
      gradient: true,
      activeType: "hollow",
    },
  },
});

// 日期范围
const recentDaysRange = ref(7);

const swiperList = ref(["/static/images/login-bg1.jpg"]);

// 快捷导航列表
const navList = reactive([
  {
    icon: "/static/icons/weixin.png",
    title: "员工管理",
    url: "/packageC/pages/aioveu_department/employee/index",
    // prem: "sys:user:query",
  },
  {
    icon: "/static/icons/browser.png",
    title: "物资管理",
    url: "/packageD/pages/aioveu_material/material/index",
    // prem: "sys:user:query",
  },
  {
    icon: "/static/icons/visitor.png",
    title: "客户管理",
    url: "/packageE/pages/aioveu_customer/customer/index",
    // prem: "sys:user:query",
  },
//-------------------------------------------------
  {
    icon: "/static/icons/user.png",
    title: "用户管理",
    url: "/packageB/pages/work/user/index",
    prem: "sys:user:query",
  },
  {
    icon: "/static/icons/role.png",
    title: "角色管理",
    url: "/packageB/pages/work/role/index",
    prem: "sys:role:query",
  },
  {
    icon: "/static/icons/notice.png",
    title: "通知公告",
    url: "/packageB/pages/work/notice/index",
    prem: "sys:notice:query",
  },
  {
    icon: "/static/icons/setting.png",
    title: "系统配置",
    url: "/packageB/pages/work/config/index",
    prem: "sys:config:query",
  },
]);

function handleClick(e: any) {
  console.log(e);
}
function onChange(e: any) {
  console.log(e);
}

// 加载访问统计数据
const loadVisitStatsData = async () => {
  LogAPI.getVisitStats().then((data) => {
    visitStatsData.value = data;
  });
};

// 加载访问趋势数据
const loadVisitTrendData = () => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - recentDaysRange.value + 1);

  const visitTrendQuery = {
    startDate: dayjs(startDate).format("YYYY-MM-DD"),
    endDate: dayjs(endDate).format("YYYY-MM-DD"),
  };

  LogAPI.getVisitTrend(visitTrendQuery).then((data) => {
    const res = {
      categories: data.dates,
      series: [
        {
          name: "访客数(UV)",
          data: data.ipList,
        },
        {
          name: "浏览量(PV)",
          data: data.pvList,
        },
      ],
    };
    chartData.value = JSON.parse(JSON.stringify(res));
  });
};

//  数据范围变化
const handleDataRangeChange = ({ value }: { value: number }) => {
  console.log("handleDataRangeChange", value);
  recentDaysRange.value = value;
  loadVisitTrendData();
};

onReady(() => {
  loadVisitStatsData();
  loadVisitTrendData();
});
</script>

<style setup lang="scss">
.home {
  padding: 10rpx 10rpx;
  :deep(.custom-item) {
    height: 80px !important;
  }
  :deep(.wd-card) {
    margin: 10rpx 0 !important;
  }
}

.charts-box {
  width: 100%;
  height: 300px;
}

/* 扫描按钮容器样式 */
.scan-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

/* 扫描按钮样式 */
.scan-btn {
  width: 80px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  /* 覆盖默认按钮样式 */
  :deep(.wd-button) {
    padding: 0;
    min-width: auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  image {
    margin-right: 5px;
  }
}

/* 在父组件样式中添加 */
.barcode-scanner-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 10000 !important;
  background-color: black !important;
}
</style>
