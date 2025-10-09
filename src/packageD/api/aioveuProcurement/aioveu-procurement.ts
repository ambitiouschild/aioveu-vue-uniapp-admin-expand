import request from "@/utils/request";

const AIOVEUPROCUREMENT_BASE_URL = "/api/v1/aioveu-procurement";

const AioveuProcurementAPI = {
    /** 获取采购流程分页数据 */
    getPage(queryParams?: AioveuProcurementPageQuery) {
        return request< PageResult<AioveuProcurementPageVO[]>>({
            url: `${AIOVEUPROCUREMENT_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取采购流程表单数据
     *
     * @param id 采购流程ID
     * @returns 采购流程表单数据
     */
    getFormData(id: number) {
        return request<AioveuProcurementForm>({
            url: `${AIOVEUPROCUREMENT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加采购流程
     *
     *  @param data 采购流程表单数据
     */
    add(data: AioveuProcurementForm) {
        return request({
            url: `${AIOVEUPROCUREMENT_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新采购流程
     *
     * @param id 采购流程ID
     * @param data 采购流程表单数据
     */
     update(id: number, data: AioveuProcurementForm) {
        return request({
            url: `${AIOVEUPROCUREMENT_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除采购流程，多个以英文逗号(,)分割
     *
     * @param ids 采购流程ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUPROCUREMENT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuProcurementAPI;

/** 采购流程分页查询参数 */
export interface AioveuProcurementPageQuery extends PageQuery {
    /** 采购ID */
    id?: number;
    /** 采购单号 */
    procurementNo?: string;
    /** 供应商ID */
    supplierId?: number;
    /** 物资ID */
    materialId?: number;
  materialName?: string;
    /** 下单时间 */
    orderDate?: [string, string];
    /** 状态 */
    status?: number;
    /** 申请人ID */
    applicantId?: number;
  applicantName?: string;
}

/** 采购流程表单对象 */
export interface AioveuProcurementForm {
    /** 采购单号 */
    procurementNo?:  string;
    /** 供应商ID */
    supplierId?:  number;
    /** 物资ID */
    materialId?:  number;
    /** 物资 */
    materialName?:  string;
    /** 采购数量 */
    quantity?:  number;
    /** 采购单价 */
    unitPrice?:  number;
    /** 总金额 */
    totalAmount?:  number;
    /** 下单时间 */
    orderDate?:  Date;
    /** 预计到货日期 */
    expectedDelivery?:  Date;
    /** 实际到货日期 */
    actualDelivery?:  Date;
    /** 签收时间 */
    receiptDate?:  Date;
    /** 入库仓库ID */
    warehouseId?:  number;
    /** 入库仓库 */
    warehouseName?:  string;
    /** 入库时间 */
    inboundDate?:  Date;
    /** 状态 */
    status?:  number;
    /** 申请人ID */
    applicantId?:  number;
    /** 申请人 */
    applicantName?:  string;
    /** 审核人ID */
    reviewerId?:  number;
    /** 审核人 */
    reviewerName?:  string;
    /** 审核时间 */
    reviewTime?:  Date;
    /** 备注 */
    remark?:  string;
}

/** 采购流程分页对象 */
export interface AioveuProcurementPageVO {
    /** 采购ID */
    id?: number;
    /** 采购单号 */
    procurementNo?: string;
    /** 供应商ID */
    supplierId?: number;
    /** 物资ID */
    materialId?: number;
    /** 采购数量 */
    quantity?: number;
    /** 采购单价 */
    unitPrice?: number;
    /** 总金额 */
    totalAmount?: number;
    /** 下单时间 */
    orderDate?: Date;
    /** 预计到货日期 */
    expectedDelivery?: Date;
    /** 实际到货日期 */
    actualDelivery?: Date;
    /** 签收时间 */
    receiptDate?: Date;
    /** 入库仓库ID */
    warehouseId?: number;
    /** 入库时间 */
    inboundDate?: Date;
    /** 状态 */
    status?: number;
    /** 申请人ID */
    applicantId?: number;
    /** 审核人ID */
    reviewerId?: number;
    /** 审核时间 */
    reviewTime?: Date;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
