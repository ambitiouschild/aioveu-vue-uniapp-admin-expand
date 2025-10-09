import request from "@/utils/request";

const AIOVEULAUNDRYORDER_BASE_URL = "/api/v1/aioveu-laundry-order";

const AioveuLaundryOrderAPI = {
    /** 获取洗衣订单分页数据 */
    getPage(queryParams?: AioveuLaundryOrderPageQuery) {
        return request<PageResult<AioveuLaundryOrderPageVO[]>>({
            url: `${AIOVEULAUNDRYORDER_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取洗衣订单表单数据
     *
     * @param id 洗衣订单ID
     * @returns 洗衣订单表单数据
     */
    getFormData(id: number) {
        return request<AioveuLaundryOrderForm>({
            url: `${AIOVEULAUNDRYORDER_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加洗衣订单
     *
     *  @param data 洗衣订单表单数据
     */
    add(data: AioveuLaundryOrderForm) {
        return request({
            url: `${AIOVEULAUNDRYORDER_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新洗衣订单
     *
     * @param id 洗衣订单ID
     * @param data 洗衣订单表单数据
     */
     update(id: number, data: AioveuLaundryOrderForm) {
        return request({
            url: `${AIOVEULAUNDRYORDER_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除洗衣订单，多个以英文逗号(,)分割
     *
     * @param ids 洗衣订单ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEULAUNDRYORDER_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    /**
     * 获取所有选项列表（用于下拉选择框）
     * @returns 选项列表
     * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
     */
    getAllLaundryOrderOptions() {
      return request<AioveuLaundryOrderOptionVO[]>({
        url: `${AIOVEULAUNDRYORDER_BASE_URL}/options`,
        method: "GET",
      });
    }


}

/** 选项VO（用于下拉选择框） */
export interface AioveuLaundryOrderOptionVO {
  /** ID */
  orderId: number;
  /** 名称 */
  orderNo: string;
}

export default AioveuLaundryOrderAPI;

/** 洗衣订单分页查询参数 */
export interface AioveuLaundryOrderPageQuery extends PageQuery {
    /** 订单ID */
    id?: number;
    /** 订单号 */
    orderNo?: string;
    /** 会员ID */
    memberId?: number;
    /** 客户姓名 */
    customerName?: string;
    /** 订单状态 0创建,1接收,2洗衣,3干燥,4熨烫,5质量检查,6完成,7运送,8取消 */
    status?: number;
    /** 支付状态 1-未支付-unpaid,2-部分支付-partial,3-已支付-paid,4-未支付-refunded */
    paymentStatus?: number;
}

/** 洗衣订单表单对象 */
export interface AioveuLaundryOrderForm {
  /** 订单ID */
  id?:  number;
    /** 订单号 */
    orderNo?:  string;
    /** 会员ID */
    memberId?:  number;
    /** 客户姓名 */
    customerName?:  string;
    /** 客户电话 */
    customerPhone?:  string;
    /** 订单状态 0创建,1接收,2洗衣,3干燥,4熨烫,5质量检查,6完成,7运送,8取消 */
    status?:  number;
    /** 订单总额 */
    totalAmount?:  number;
    /** 折扣金额 */
    discountAmount?:  number;
    /** 实付金额 */
    actualAmount?:  number;
    /** 支付状态 1-未支付-unpaid,2-部分支付-partial,3-已支付-paid,4-未支付-refunded */
    paymentStatus?:  number;
    /** 支付方式ID */
    paymentMethodId?:  number;
    /** 收衣时间 */
    receiveTime?:  Date;
    /** 完成时间 */
    finishTime?:  Date;
    /** 交付时间 */
    deliveryTime?:  Date;
    /** 备注 */
    remark?:  string;
}

/** 洗衣订单分页对象 */
export interface AioveuLaundryOrderPageVO {
    /** 订单ID */
    id?: number;
    /** 订单号 */
    orderNo?: string;
    /** 会员ID */
    memberId?: number;
    /** 客户姓名 */
    customerName?: string;
    /** 客户电话 */
    customerPhone?: string;
    /** 订单状态 0创建,1接收,2洗衣,3干燥,4熨烫,5质量检查,6完成,7运送,8取消 */
    status?: number;
    /** 订单总额 */
    totalAmount?: number;
    /** 折扣金额 */
    discountAmount?: number;
    /** 实付金额 */
    actualAmount?: number;
    /** 支付状态 1-未支付-unpaid,2-部分支付-partial,3-已支付-paid,4-未支付-refunded */
    paymentStatus?: number;
    /** 支付方式ID */
    paymentMethodId?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 收衣时间 */
    receiveTime?: Date;
    /** 完成时间 */
    finishTime?: Date;
    /** 交付时间 */
    deliveryTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
    /** 备注 */
    remark?: string;
}
