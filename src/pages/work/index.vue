<template>
  <view class="work">
    <template v-for="(item, index) in gridList" :key="index">
      <wd-card :title="item.title">
        <wd-grid clickable :column="4">
          <wd-grid-item
            v-for="(child, index) in item.children"
            :key="index"
            :v-has-perm="child.prem"
            use-slot
            link-type="navigateTo"
            :url="child.url"
          >
            <view class="p-2">
              <image class="w-72rpx h-72rpx rounded-8rpx" :src="child.icon" />
            </view>
            <view class="text">{{ child.title }}</view>
          </wd-grid-item>
        </wd-grid>
      </wd-card>
    </template>
  </view>
</template>

<script lang="ts" setup>
const gridList = reactive([
  {
    title: "洗护管理",
    children: [
      {
        icon: "/static/icons/logo.png",
        title: "洗衣订单",
        url: "/packageG/pages/aioveu_laundry/laundry_order/index",
        prem: "aioveuLaundryOrder:aioveu-laundry-order:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "衣物类型",
        url: "/packageG/pages/aioveu_laundry/laundry_clothing_type/index",
        prem: "aioveuLaundryClothingType:aioveu-laundry-clothing-type:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "洗衣订单衣物明细",
        url: "/packageG/pages/aioveu_laundry/laundry_order_item/index",
        prem: "aioveuLaundryOrderItem:aioveu-laundry-order-item:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "洗衣流程图片记录",
        url: "/packageG/pages/aioveu_laundry/laundry_process_image/index",
        prem: "aioveuLaundryProcessImage:aioveu-laundry-process-image:query",
      },
    ],
  },
  {
    title: "会员管理",
    children: [
      {
        icon: "/static/icons/logo.png",
        title: "会员等级",
        url: "/packageF/pages/aioveu_member/member_level/index",
        prem: "aioveuMemberLevel:aioveu-member-level:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "会员信息",
        url: "/packageF/pages/aioveu_member/member/index",
        prem: "aioveuMember:aioveu-member:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "会员充值账户",
        url: "/packageF/pages/aioveu_member/member_account/index",
        prem: "aioveuMemberAccount:aioveu-member-account:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "会员充值记录",
        url: "/packageF/pages/aioveu_member/member_recharge_record/index",
        prem: "aioveuMemberRechargeRecord:aioveu-member-recharge-record:query",
      },
    ],
  },
  {
    title: "人员管理",
    children: [
      {
        icon: "/static/icons/logo.png",
        title: "部门管理",
        url: "/packageC/pages/aioveu_department/department/index",
        prem: "aioveuDepartment:aioveuProcurement-department:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "岗位管理",
        url: "/packageC/pages/aioveu_department/position/index",
        prem: "aioveuPosition:aioveuProcurement-position:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "员工管理",
        url: "/packageC/pages/aioveu_department/employee/index",
        prem: "aioveuEmployee:aioveuProcurement-employee:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "考勤管理",
        url: "/packageC/pages/aioveu_department/attendance/index",
        prem: "aioveuAttendance:aioveuProcurement-attendance:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "绩效管理",
        url: "/packageC/pages/aioveu_department/performance/index",
        prem: "aioveuPerformance:aioveuProcurement-performance:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "薪资管理",
        url: "/packageC/pages/aioveu_department/salary/index",
        prem: "aioveuSalary:aioveuProcurement-salary:query",
      },
    ],
  },
  {
    title: "物资管理",
    children: [
      {
        icon: "/static/icons/logo.png",
        title: "物资分类管理",
        url: "/packageD/pages/aioveu_material/category/index",
        prem: "aioveuCategory:aioveuProcurement-category:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "物资管理",
        url: "/packageD/pages/aioveu_material/material/index",
        prem: "aioveuMaterial:aioveuProcurement-material:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "仓库管理",
        url: "/packageD/pages/aioveu_material/warehouse/index",
        prem: "aioveuWarehouse:aioveuProcurement-warehouse:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "库存管理",
        url: "/packageD/pages/aioveu_material/inventory/index",
        prem: "aioveuInventory:aioveuProcurement-inventory:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "入库管理",
        url: "/packageD/pages/aioveu_material/inbound/index",
        prem: "aioveuInbound:aioveuProcurement-inbound:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "设备管理",
        url: "/packageD/pages/aioveu_material/equipment/index",
        prem: "aioveuEquipment:aioveuProcurement-equipment:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "采购管理",
        url: "/packageD/pages/aioveu_material/procurement/index",
        prem: "aioveuProcurement:aioveuProcurement-procurement:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "出库管理",
        url: "/packageD/pages/aioveu_material/outbound/index",
        prem: "aioveuOutbound:aioveuProcurement-outbound:query",
      },
    ],
  },
  {
    title: "客户管理",
    children: [
      {
        icon: "/static/icons/logo.png",
        title: "客户管理",
        url: "/packageE/pages/aioveu_customer/customer/index",
        prem: "aioveuCustomer:aioveuProcurement-customer:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "联系人管理",
        url: "/packageE/pages/aioveu_customer/contact/index",
        prem: "aioveuContact:aioveuProcurement-contact:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "交易管理",
        url: "/packageE/pages/aioveu_customer/transaction/index",
        prem: "aioveuTransaction:aioveuProcurement-transaction:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "订单管理",
        url: "/packageE/pages/aioveu_customer/sales_order/index",
        prem: "aioveuSalesOrder:aioveuProcurement-sales-order:query",
      },
      {
        icon: "/static/icons/logo.png",
        title: "订单明细管理",
        url: "/packageE/pages/aioveu_customer/sales_order_detail/index",
        prem: "aioveuSalesOrderDetail:aioveuProcurement-sales-order-detail:query",
      },
    ],
  },
  {
    title: "系统管理",
    children: [
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
    ],
  },
  {
    title: "系统监控",
    children: [
      {
        icon: "/static/icons/log.png",
        title: "系统日志",
        url: "/packageB/pages/work/log/index",
        prem: "sys:log:query",
      },
    ],
  },
]);
</script>

<style lang="scss" scoped>
/* stylelint-disable selector-type-no-unknown */
page {
  background: #f8f8f8;
}
/* stylelint-enable selector-type-no-unknown */

.work {
  padding: 40rpx 0;
}
</style>
