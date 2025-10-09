import request from "@/utils/request";

const AIOVEUSALESORDERDETAIL_BASE_URL = "/api/v1/aioveu-sales-order-detail";

const AioveuSalesOrderDetailAPI = {
    /** 获取订单明细分页数据 */
    getPage(queryParams?: AioveuSalesOrderDetailPageQuery) {
        return request<PageResult<AioveuSalesOrderDetailPageVO[]>>({
            url: `${AIOVEUSALESORDERDETAIL_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取订单明细表单数据
     *
     * @param id 订单明细ID
     * @returns 订单明细表单数据
     */
    getFormData(id: number) {
        return request<AioveuSalesOrderDetailForm>({
            url: `${AIOVEUSALESORDERDETAIL_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加订单明细
     *
     *  @param data 订单明细表单数据
     */
    add(data: AioveuSalesOrderDetailForm) {
        return request({
            url: `${AIOVEUSALESORDERDETAIL_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新订单明细
     *
     * @param id 订单明细ID
     * @param data 订单明细表单数据
     */
     update(id: number, data: AioveuSalesOrderDetailForm) {
        return request({
            url: `${AIOVEUSALESORDERDETAIL_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除订单明细，多个以英文逗号(,)分割
     *
     * @param ids 订单明细ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUSALESORDERDETAIL_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuSalesOrderDetailAPI;

/** 订单明细分页查询参数 */
export interface AioveuSalesOrderDetailPageQuery extends PageQuery {
    /** 明细ID */
    id?: number;
    /** 订单ID */
    orderId?: number;

  orderName?: string;

    /** 物资ID */
    materialId?: number;

  materialName?: string;
    /** 发货仓库ID */
    warehouseId?: number;


  warehouseName?: string;
    /** 明细状态 */
    status?: number;
}

/** 订单明细表单对象 */
export interface AioveuSalesOrderDetailForm {
    /** 订单ID */
    orderId?:  number;
    /** 订单 */
    orderName?:  string;
    /** 物资ID */
    materialId?:  number;
    /** 物资 */
    materialName?:  string;
    /** 数量 */
    quantity?:  number;
    /** 单价 */
    unitPrice?:  number;
    /** 折扣率 */
    discount?:  number;
    /** 税率 */
    taxRate?:  number;
    /** 小计 */
    // subtotal?:  number;
    // /** 税额 */
    // taxAmount?:  number;
    // /** 总金额 */
    // totalPrice?:  number;
    /** 批次号 */
    batchNumber?:  string;
    /** 要求交货日期 */
    deliveryDate?:  Date;
    /** 发货仓库ID */
    warehouseId?:  number;
    /** 发货仓库 */
    warehouseName?:  string;
    /** 明细状态 */
    status?:  number;
    /** 备注 */
    notes?:  string;
}

/** 订单明细分页对象 */
export interface AioveuSalesOrderDetailPageVO {
    /** 明细ID */
    id?: number;
    /** 订单ID */
    orderId?: number;
    /** 物资ID */
    materialId?: number;
    /** 数量 */
    quantity?: number;
    /** 单价 */
    unitPrice?: number;
    /** 折扣率 */
    discount?: number;
    /** 税率 */
    taxRate?: number;
    /** 小计 */
    subtotal?: number;
    /** 税额 */
    taxAmount?: number;
    /** 总金额 */
    totalPrice?: number;
    /** 批次号 */
    batchNumber?: string;
    /** 要求交货日期 */
    deliveryDate?: Date;
    /** 发货仓库ID */
    warehouseId?: number;
    /** 明细状态 */
    status?: number;
    /** 备注 */
    notes?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
