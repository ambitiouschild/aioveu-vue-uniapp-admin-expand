import request from "@/utils/request";

const AIOVEUSALESORDER_BASE_URL = "/api/v1/aioveu-sales-order";

const AioveuSalesOrderAPI = {
    /** 获取销售订单分页数据 */
    getPage(queryParams?: AioveuSalesOrderPageQuery) {
        return request<PageResult<AioveuSalesOrderPageVO[]>>({
            url: `${AIOVEUSALESORDER_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取销售订单表单数据
     *
     * @param id 销售订单ID
     * @returns 销售订单表单数据
     */
    getFormData(id: number) {
        return request<AioveuSalesOrderForm>({
            url: `${AIOVEUSALESORDER_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加销售订单
     *
     *  @param data 销售订单表单数据
     */
    add(data: AioveuSalesOrderForm) {
        return request({
            url: `${AIOVEUSALESORDER_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新销售订单
     *
     * @param id 销售订单ID
     * @param data 销售订单表单数据
     */
     update(id: number, data: AioveuSalesOrderForm) {
        return request({
            url: `${AIOVEUSALESORDER_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除销售订单，多个以英文逗号(,)分割
     *
     * @param ids 销售订单ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUSALESORDER_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    getAllSalesOrderOptions() {
      return request<SalesOrderOptionVO[]>({
        url: `${AIOVEUSALESORDER_BASE_URL}/options`,
        method: "GET",
      });
    },

}

export default AioveuSalesOrderAPI;

/** 销售订单分页查询参数 */
export interface AioveuSalesOrderPageQuery extends PageQuery {
    /** 订单ID（主键） */
    id?: number;
    /** 订单编号（唯一） */
    orderNo?: string;
    /** 客户ID */
    customerId?: number;

  customerName?: string;

    /** 下单时间 */
    orderDate?: [string, string];
    /** 支付状态 */
    paymentStatus?: number;
    /** 订单状态 */
    orderStatus?: number;
    /** 运输方式 */
    shippingMethod?: number;
    /** 销售负责人ID */
    salesRepId?: number;

  salesRepName?: string;

}

/** 销售订单表单对象 */
export interface AioveuSalesOrderForm {
    /** 订单编号（唯一） */
    orderNo?:  string;
    /** 客户ID */
    customerId?:  number;
    /** 客户 */
    customerName?:  string;
    /** 联系人ID */
    contactId?:  number;
    /** 联系人 */
    contactName?:  string;
    /** 下单时间 */
    orderDate?:  Date;
    /** 预计交货日期 */
    expectedDelivery?:  Date;
    /** 实际交货日期 */
    actualDelivery?:  Date;
    /** 订单总金额 */
    totalAmount?:  number;
    /** 货币代码 */
    currency?:  string;
    /** 整体折扣率 */
    discount?:  number;
    /** 税率 */
    taxRate?:  number;
    /** 税额 */
    taxAmount?:  number;
    /** 订单总额（含税） */
    grandTotal?:  number;
    /** 付款条件：1-预付全款，2-货到付款，3-月结30天，4-月结60天，5-其他 */
    paymentTerms?:  number;
    /** 支付状态 */
    paymentStatus?:  number;
    /** 订单状态 */
    orderStatus?:  number;
    /** 收货地址 */
    shippingAddress?:  string;
    /** 运输方式 */
    shippingMethod?:  number;
    /** 物流单号 */
    trackingNo?:  string;
    /** 销售负责人ID */
    salesRepId?:  number;
    /** 销售负责人 */
    salesRepName?:  string;
    /** 操作员ID */
    operatorId?:  number;
    /** 操作员 */
    operatorName?:  string;
    /** 备注 */
    notes?:  string;
}

/** 销售订单分页对象 */
export interface AioveuSalesOrderPageVO {
    /** 订单ID（主键） */
    id?: number;
    /** 订单编号（唯一） */
    orderNo?: string;
    /** 客户ID */
    customerId?: number;
    /** 联系人ID */
    contactId?: number;
    /** 下单时间 */
    orderDate?: Date;
    /** 预计交货日期 */
    expectedDelivery?: Date;
    /** 实际交货日期 */
    actualDelivery?: Date;
    /** 订单总金额 */
    totalAmount?: number;
    /** 货币代码 */
    currency?: string;
    /** 整体折扣率 */
    discount?: number;
    /** 税率 */
    taxRate?: number;
    /** 税额 */
    taxAmount?: number;
    /** 订单总额（含税） */
    grandTotal?: number;
    /** 付款条件：1-预付全款，2-货到付款，3-月结30天，4-月结60天，5-其他 */
    paymentTerms?: number;
    /** 支付状态 */
    paymentStatus?: number;
    /** 订单状态 */
    orderStatus?: number;
    /** 收货地址 */
    shippingAddress?: string;
    /** 运输方式 */
    shippingMethod?: number;
    /** 物流单号 */
    trackingNo?: string;
    /** 销售负责人ID */
    salesRepId?: number;
    /** 操作员ID */
    operatorId?: number;
    /** 备注 */
    notes?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

export interface SalesOrderOptionVO {
  salesOrderId: number;
  salesOrderNo: string;
}
