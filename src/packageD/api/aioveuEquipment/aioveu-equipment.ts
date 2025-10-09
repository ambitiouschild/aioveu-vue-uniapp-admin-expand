import request from "@/utils/request";

const AIOVEUEQUIPMENT_BASE_URL = "/api/v1/aioveu-equipment";

const AioveuEquipmentAPI = {
    /** 获取设备管理分页数据 */
    getPage(queryParams?: AioveuEquipmentPageQuery) {
        return request<PageResult<AioveuEquipmentPageVO[]>>({
            url: `${AIOVEUEQUIPMENT_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取设备管理表单数据
     *
     * @param id 设备管理ID
     * @returns 设备管理表单数据
     */
    getFormData(id: number) {
        return request<AioveuEquipmentForm>({
            url: `${AIOVEUEQUIPMENT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加设备管理
     *
     *  @param data 设备管理表单数据
     */
    add(data: AioveuEquipmentForm) {
        return request({
            url: `${AIOVEUEQUIPMENT_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新设备管理
     *
     * @param id 设备管理ID
     * @param data 设备管理表单数据
     */
     update(id: number, data: AioveuEquipmentForm) {
        return request({
            url: `${AIOVEUEQUIPMENT_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除设备管理，多个以英文逗号(,)分割
     *
     * @param ids 设备管理ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUEQUIPMENT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuEquipmentAPI;

/** 设备管理分页查询参数 */
export interface AioveuEquipmentPageQuery extends PageQuery {
    /** 设备ID */
    id?: number;
    /** 资产编号 */
    assetNo?: string;
    /** 设备名称 */
    name?: string;
    /** 设备分类ID */
    categoryId?: number;
    /** 设备分类 */
    categoryName?: string;
    /** 序列号 */
    serialNo?: string;
    /** 责任人 */
    responsiblePerson?: number;
    /** 责任人 */
    responsiblePersonName?: string;
    /** 状态 */
    status?: number;
}

/** 设备管理表单对象 */
export interface AioveuEquipmentForm {
    /** 资产编号 */
    assetNo?:  string;
    /** 设备名称 */
    name?:  string;
    /** 设备分类ID */
    categoryId?:  number;
    /** 设备分类 */
    categoryName?:  string;
    /** 设备型号 */
    model?:  string;
    /** 序列号 */
    serialNo?:  string;
    // /** 位置ID */
    // locationId?:  number;
    /** 所属部门ID */
    departmentId?:  number;
    /** 所属部门 */
    departmentName?:  string;
    /** 责任人 */
    responsiblePerson?:  number;
    /** 责任人 */
    responsiblePersonName?:  string;
    /** 采购日期 */
    purchaseDate?:  Date;
    /** 采购价格 */
    purchasePrice?:  number;
    /** 保修期（月） */
    warrantyPeriod?:  number;
    /** 维保周期（月） */
    maintenanceCycle?:  number;
    /** 上次维保日期 */
    lastMaintenance?:  Date;
    /** 下次维保日期 */
    nextMaintenance?:  Date;
    /** 状态 */
    status?:  number;
    /** 备注 */
    remark?:  string;
}

/** 设备管理分页对象 */
export interface AioveuEquipmentPageVO {
    /** 设备ID */
    id?: number;
    /** 资产编号 */
    assetNo?: string;
    /** 设备名称 */
    name?: string;
    /** 设备分类ID */
    categoryId?: number;
    /** 设备型号 */
    model?: string;
    /** 序列号 */
    serialNo?: string;
    /** 位置ID */
    locationId?: number;
    /** 所属部门ID */
    departmentId?: number;
    /** 责任人 */
    responsiblePerson?: number;
    /** 采购日期 */
    purchaseDate?: Date;
    /** 采购价格 */
    purchasePrice?: number;
    /** 保修期（月） */
    warrantyPeriod?: number;
    /** 维保周期（月） */
    maintenanceCycle?: number;
    /** 上次维保日期 */
    lastMaintenance?: Date;
    /** 下次维保日期 */
    nextMaintenance?: Date;
    /** 状态 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
