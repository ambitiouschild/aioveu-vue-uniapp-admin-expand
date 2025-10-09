import request from "@/utils/request";

const AIOVEUOUTBOUND_BASE_URL = "/api/v1/aioveu-outbound";

const AioveuOutboundAPI = {
    /** 获取出库记录分页数据 */
    getPage(queryParams?: AioveuOutboundPageQuery) {
        return request<PageResult<AioveuOutboundPageVO[]>>({
            url: `${AIOVEUOUTBOUND_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取出库记录表单数据
     *
     * @param id 出库记录ID
     * @returns 出库记录表单数据
     */
    getFormData(id: number) {
        return request<AioveuOutboundForm>({
            url: `${AIOVEUOUTBOUND_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加出库记录
     *
     *  @param data 出库记录表单数据
     */
    add(data: AioveuOutboundForm) {
        return request({
            url: `${AIOVEUOUTBOUND_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新出库记录
     *
     * @param id 出库记录ID
     * @param data 出库记录表单数据
     */
     update(id: number, data: AioveuOutboundForm) {
        return request({
            url: `${AIOVEUOUTBOUND_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除出库记录，多个以英文逗号(,)分割
     *
     * @param ids 出库记录ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUOUTBOUND_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuOutboundAPI;

/** 出库记录分页查询参数 */
export interface AioveuOutboundPageQuery extends PageQuery {
    /** 出库ID */
    id?: number;
    /** 出库单号 */
    outboundNo?: string;
    /** 物资ID */
    materialId?: number;

  /** 物资 */
  materialName?: string;
    /** 仓库ID */
    warehouseId?: number;
  warehouseName?: string;
    /** 出库时间 */
    outTime?: [string, string];
    /** 领用人ID */
    recipientId?: number;

  recipientName?: string;
    /** 状态 */
    status?: number;
}

/** 出库记录表单对象 */
export interface AioveuOutboundForm {
    /** 出库单号 */
    outboundNo?:  string;
    /** 物资ID */
    materialId?:  number;
    /** 物资 */
    materialName?:  string;
    /** 仓库ID */
    warehouseId?:  number;
    /** 仓库 */
    warehouseName?:  string;
    /** 出库数量 */
    quantity?:  number;
    /** 批次号 */
    batchNumber?:  string;
    /** 出库时间 */
    outTime?:  Date;
    /** 操作员ID */
    operatorId?:  number;
    /** 操作员 */
    operatorName?:  string;
    /** 领用人ID */
    recipientId?:  number;
    /** 领用人 */
    recipientName?:  string;
    /** 领用部门ID */
    departmentId?:  number;
    /** 领用部门 */
    departmentName?:  string;
    /** 用途说明 */
    purpose?:  string;
    /** 关联项目ID */
    projectId?:  number;
    /** 状态 */
    status?:  number;
}

/** 出库记录分页对象 */
export interface AioveuOutboundPageVO {
    /** 出库ID */
    id?: number;
    /** 出库单号 */
    outboundNo?: string;
    /** 物资ID */
    materialId?: number;
    /** 仓库ID */
    warehouseId?: number;
    /** 出库数量 */
    quantity?: number;
    /** 批次号 */
    batchNumber?: string;
    /** 出库时间 */
    outTime?: Date;
    /** 操作员ID */
    operatorId?: number;
    /** 领用人ID */
    recipientId?: number;
    /** 领用部门ID */
    departmentId?: number;
    /** 用途说明 */
    purpose?: string;
    /** 关联项目ID */
    projectId?: number;
    /** 状态 */
    status?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
