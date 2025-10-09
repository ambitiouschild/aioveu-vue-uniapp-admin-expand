import request from "@/utils/request";

const AIOVEUINBOUND_BASE_URL = "/api/v1/aioveu-inbound";

const AioveuInboundAPI = {
    /** 获取入库信息分页数据 */
    getPage(queryParams?: AioveuInboundPageQuery) {
        return request<PageResult<AioveuInboundPageVO[]>>({
            url: `${AIOVEUINBOUND_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取入库信息表单数据
     *
     * @param id 入库信息ID
     * @returns 入库信息表单数据
     */
    getFormData(id: number) {
        return request< AioveuInboundForm>({
            url: `${AIOVEUINBOUND_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加入库信息
     *
     *  @param data 入库信息表单数据
     */
    add(data: AioveuInboundForm) {
        return request({
            url: `${AIOVEUINBOUND_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新入库信息
     *
     * @param id 入库信息ID
     * @param data 入库信息表单数据
     */
     update(id: number, data: AioveuInboundForm) {
        return request({
            url: `${AIOVEUINBOUND_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除入库信息，多个以英文逗号(,)分割
     *
     * @param ids 入库信息ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUINBOUND_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuInboundAPI;

/** 入库信息分页查询参数 */
export interface AioveuInboundPageQuery extends PageQuery {
    /** 入库ID（主键） */
    id?: number;
    /** 入库单号 */
    inboundNo?: string;
    /** 物资ID */
    materialId?: number;
    /** 物资 */
    materialName?: string;
    /** 仓库ID */
    warehouseId?: number;
    /** 仓库 */
    warehouseName?: string;
    /** 入库类型 */
    inboundType?: number;
    /** 入库时间 */
    inTime?: [string, string];
    /** 操作员ID */
    operatorId?: number;
    /** 操作员 */
    operatorName?: string;
}

/** 入库信息表单对象 */
export interface AioveuInboundForm {
    /** 入库单号 */
    inboundNo?:  string;
    /** 物资ID */
    materialId?:  number;
    /** 物资 */
    materialName?:  string;
    /** 仓库ID */
    warehouseId?:  number;
    /** 仓库 */
    warehouseName?:  string;
    /** 入库数量（支持小数计量） */
    quantity?:  number;
    /** 入库单价 */
    unitPrice?:  number;
    /** 总金额 */
    totalAmount?:  number;
    /** 批次号 */
    batchNumber?:  string;
    /** 生产日期 */
    productionDate?:  Date;
    /** 有效期至 */
    expiryDate?:  Date;
    /** 供应商ID */
    supplierId?:  number;
    /** 入库类型 */
    inboundType?:  number;
    /** 入库时间 */
    inTime?:  Date;
    /** 操作员ID */
    operatorId?:  number;
    /** 操作员 */
    operatorName?:  string;
    /** 备注 */
    remark?:  string;
}

/** 入库信息分页对象 */
export interface AioveuInboundPageVO {
    /** 入库ID（主键） */
    id?: number;
    /** 入库单号 */
    inboundNo?: string;
    /** 物资ID */
    materialId?: number;
    /** 仓库ID */
    warehouseId?: number;
    /** 入库数量（支持小数计量） */
    quantity?: number;
    /** 入库单价 */
    unitPrice?: number;
    /** 总金额 */
    totalAmount?: number;
    /** 批次号 */
    batchNumber?: string;
    /** 生产日期 */
    productionDate?: Date;
    /** 有效期至 */
    expiryDate?: Date;
    /** 供应商ID */
    supplierId?: number;
    /** 入库类型 */
    inboundType?: number;
    /** 入库时间 */
    inTime?: Date;
    /** 操作员ID */
    operatorId?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
