import request from "@/utils/request";

const AIOVEULAUNDRYGARMENTTRACKING_BASE_URL = "/api/v1/aioveu-laundry-garment-tracking";

const AioveuLaundryGarmentTrackingAPI = {
    /** 获取衣物流转记录分页数据 */
    getPage(queryParams?: AioveuLaundryGarmentTrackingPageQuery) {
        return request<any, PageResult<AioveuLaundryGarmentTrackingPageVO[]>>({
            url: `${AIOVEULAUNDRYGARMENTTRACKING_BASE_URL}/page`,
            method: "get",
            params: queryParams,
        });
    },
    /**
     * 获取衣物流转记录表单数据
     *
     * @param id 衣物流转记录ID
     * @returns 衣物流转记录表单数据
     */
    getFormData(id: number) {
        return request<any, AioveuLaundryGarmentTrackingForm>({
            url: `${AIOVEULAUNDRYGARMENTTRACKING_BASE_URL}/${id}/form`,
            method: "get",
        });
    },

    /**
     *  添加衣物流转记录
     *
     *  @param data 衣物流转记录表单数据
     */
    add(data: AioveuLaundryGarmentTrackingForm) {
        return request({
            url: `${AIOVEULAUNDRYGARMENTTRACKING_BASE_URL}`,
            method: "post",
            data,
        });
    },

    /**
     * 更新衣物流转记录
     *
     * @param id 衣物流转记录ID
     * @param data 衣物流转记录表单数据
     */
     update(id: number, data: AioveuLaundryGarmentTrackingForm) {
        return request({
            url: `${AIOVEULAUNDRYGARMENTTRACKING_BASE_URL}/${id}`,
            method: "put",
            data,
        });
    },

    /**
     * 批量删除衣物流转记录，多个以英文逗号(,)分割
     *
     * @param ids 衣物流转记录ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEULAUNDRYGARMENTTRACKING_BASE_URL}/${ids}`,
            method: "delete",
        });
    }
}

export default AioveuLaundryGarmentTrackingAPI;

/** 衣物流转记录分页查询参数 */
export interface AioveuLaundryGarmentTrackingPageQuery extends PageQuery {
    /** 衣物流转记录ID */
    id?: number;
    /** 衣物编码 */
    garmentCode?: number;
    /** 操作类型,0-送厂清洗-SEND_FACTORY,1-工厂入库-FACTORY_IN,2-工厂出库-FACTORY_OUT,3-门店入库-STORE_IN,4-门店上挂-STORE_HANG,5-门店出库-STORE_OUT,6-返洗开始-RE_WASH_START */
    operationType?: number;
    /** 操作人ID */
    operatorId?: number;
    /** 位置ID（仓库/门店） */
    locationId?: number;
    /** 备注 */
    remark?: string;
}

/** 衣物流转记录表单对象 */
export interface AioveuLaundryGarmentTrackingForm {
    /** 衣物流转记录ID */
    id?:  number;
    /** 衣物编码 */
    garmentCode?:  number;
    /** 操作类型,0-送厂清洗-SEND_FACTORY,1-工厂入库-FACTORY_IN,2-工厂出库-FACTORY_OUT,3-门店入库-STORE_IN,4-门店上挂-STORE_HANG,5-门店出库-STORE_OUT,6-返洗开始-RE_WASH_START */
    operationType?:  number;
    /** 操作人ID */
    operatorId?:  number;
    /** 位置ID（仓库/门店） */
    locationId?:  number;
    /** 备注 */
    remark?:  string;
    /** 创建时间 */
    createTime?:  Date;
    /** 更新时间 */
    updateTime?:  Date;
}

/** 衣物流转记录分页对象 */
export interface AioveuLaundryGarmentTrackingPageVO {
    /** 衣物流转记录ID */
    id?: number;
    /** 衣物编码 */
    garmentCode?: number;
    /** 操作类型,0-送厂清洗-SEND_FACTORY,1-工厂入库-FACTORY_IN,2-工厂出库-FACTORY_OUT,3-门店入库-STORE_IN,4-门店上挂-STORE_HANG,5-门店出库-STORE_OUT,6-返洗开始-RE_WASH_START */
    operationType?: number;
    /** 操作人ID */
    operatorId?: number;
    /** 位置ID（仓库/门店） */
    locationId?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
