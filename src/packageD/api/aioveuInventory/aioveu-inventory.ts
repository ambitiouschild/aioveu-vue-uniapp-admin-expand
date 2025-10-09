import request from "@/utils/request";

const AIOVEUINVENTORY_BASE_URL = "/api/v1/aioveu-inventory";

const AioveuInventoryAPI = {
    /** 获取库存信息分页数据 */
    getPage(queryParams?: AioveuInventoryPageQuery) {
        return request<PageResult<AioveuInventoryPageVO[]>>({
            url: `${AIOVEUINVENTORY_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取库存信息表单数据
     *
     * @param id 库存信息ID
     * @returns 库存信息表单数据
     */
    getFormData(id: number) {
        return request<AioveuInventoryForm>({
            url: `${AIOVEUINVENTORY_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加库存信息
     *
     *  @param data 库存信息表单数据
     */
    add(data: AioveuInventoryForm) {
        return request({
            url: `${AIOVEUINVENTORY_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新库存信息
     *
     * @param id 库存信息ID
     * @param data 库存信息表单数据
     */
     update(id: number, data: AioveuInventoryForm) {
        return request({
            url: `${AIOVEUINVENTORY_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除库存信息，多个以英文逗号(,)分割
     *
     * @param ids 库存信息ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUINVENTORY_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuInventoryAPI;

/** 库存信息分页查询参数 */
export interface AioveuInventoryPageQuery extends PageQuery {
    /** 库存ID */
    id?: number;
    /** 仓库ID */
    warehouseId?: number;
    /** 仓库 */
    warehouseName?: string;
    /** 物资ID */
    materialId?: number;
    /** 物资 */
    materialName?: string;
    /** 生产日期 */
    productionDate?: [string, string];
    /** 有效期至 */
    expiryDate?: [string, string];
    /** 最后入库时间 */
    lastInbound?: [string, string];
    /** 最后出库时间 */
    lastOutbound?: [string, string];
}

/** 库存信息表单对象 */
export interface AioveuInventoryForm {
    /** 仓库ID */
    warehouseId?:  number;
    /** 仓库 */
    warehouseName?:  string;
    /** 物资ID */
    materialId?:  number;
    /** 物资 */
    materialName?:  string;
    /** 当前库存数量 */
    quantity?:  number;
    /** 批次号 */
    batchNumber?:  string;
    /** 生产日期 */
    productionDate?:  Date;
    /** 有效期至 */
    expiryDate?:  Date;
    /** 最后入库时间 */
    lastInbound?:  Date;
    /** 最后出库时间 */
    lastOutbound?:  Date;
}

/** 库存信息分页对象 */
export interface AioveuInventoryPageVO {
    /** 库存ID */
    id?: number;
    /** 仓库ID */
    warehouseId?: number;
    /** 物资ID */
    materialId?: number;
    /** 当前库存数量 */
    quantity?: number;
    /** 批次号 */
    batchNumber?: string;
    /** 生产日期 */
    productionDate?: Date;
    /** 有效期至 */
    expiryDate?: Date;
    /** 最后入库时间 */
    lastInbound?: Date;
    /** 最后出库时间 */
    lastOutbound?: Date;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
