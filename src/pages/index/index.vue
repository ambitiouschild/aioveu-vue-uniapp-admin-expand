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
</template>

<script setup lang="ts">
import { dayjs } from "wot-design-uni";

import LogAPI, { VisitStatsVO } from "@/api/system/log";

const current = ref<number>(0);

const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

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
</style>
