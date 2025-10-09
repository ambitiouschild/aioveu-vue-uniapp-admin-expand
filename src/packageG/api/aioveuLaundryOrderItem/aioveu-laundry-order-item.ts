import request from "@/utils/request";

const AIOVEULAUNDRYORDERITEM_BASE_URL = "/api/v1/aioveu-laundry-order-item";

const AioveuLaundryOrderItemAPI = {
    /** 获取洗衣订单衣物明细分页数据 */
    getPage(queryParams?: AioveuLaundryOrderItemPageQuery) {
        return request<PageResult<AioveuLaundryOrderItemPageVO[]>>({
            url: `${AIOVEULAUNDRYORDERITEM_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取洗衣订单衣物明细表单数据
     *
     * @param id 洗衣订单衣物明细ID
     * @returns 洗衣订单衣物明细表单数据
     */
    getFormData(id: number) {
        return request<AioveuLaundryOrderItemForm>({
            url: `${AIOVEULAUNDRYORDERITEM_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加洗衣订单衣物明细
     *
     *  @param data 洗衣订单衣物明细表单数据
     */
    add(data: AioveuLaundryOrderItemForm) {
        return request({
            url: `${AIOVEULAUNDRYORDERITEM_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新洗衣订单衣物明细
     *
     * @param id 洗衣订单衣物明细ID
     * @param data 洗衣订单衣物明细表单数据
     */
     update(id: number, data: AioveuLaundryOrderItemForm) {
        return request({
            url: `${AIOVEULAUNDRYORDERITEM_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除洗衣订单衣物明细，多个以英文逗号(,)分割
     *
     * @param ids 洗衣订单衣物明细ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEULAUNDRYORDERITEM_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

      /**
       * 获取所有选项列表（用于下拉选择框）
       * @returns 选项列表
       * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
       */
      getAllLaundryOrderItemOptions() {
        return request<AioveuLaundryOrderItemOption[]>({
          url: `${AIOVEULAUNDRYORDERITEM_BASE_URL}/options`,
          method: "GET",
        });
      }

}

/** 选项VO（用于下拉选择框） */
export interface AioveuLaundryOrderItemOption {
  /** ID */
  itemId: number;
  /** 名称 */
  problemDesc: string;
}


export default AioveuLaundryOrderItemAPI;

/** 洗衣订单衣物明细分页查询参数 */
export interface AioveuLaundryOrderItemPageQuery extends PageQuery {
    /** 衣物明细ID */
    id?: number;
    /** 订单ID */
    orderId?: number;
    /** 衣物类型ID */
    clothingTypeId?: number;
    /** 自定义衣物类型 */
    customType?: string;
    /** 处理状态 1-待处理-pending,2-洗涤中-washing,3-烘干中-drying,4-熨烫中-ironing,5-质检中-quality_check,6-已完成-finished,7-问题衣物-problem */
    processStatus?: number;
    /** 特殊要求 */
    specialInstruction?: string;
}

/** 洗衣订单衣物明细表单对象 */
export interface AioveuLaundryOrderItemForm {
  /** 洗衣订单衣物明细ID */
  id?:  number;
    /** 订单ID */
    orderId?:  number;
    /** 衣物类型ID */
    clothingTypeId?:  number;
    /** 自定义衣物类型 */
    customType?:  string;
    /** 问题描述 */
    problemDesc?:  string;
    /** 价格 */
    price?:  number;
    /** 处理状态 1-待处理-pending,2-洗涤中-washing,3-烘干中-drying,4-熨烫中-ironing,5-质检中-quality_check,6-已完成-finished,7-问题衣物-problem */
    processStatus?:  number;
    /** 特殊要求 */
    specialInstruction?:  string;
    /** 开始处理时间 */
    startTime?:  Date;
    /** 完成处理时间 */
    endTime?:  Date;
}

/** 洗衣订单衣物明细分页对象 */
export interface AioveuLaundryOrderItemPageVO {
    /** 衣物明细ID */
    id?: number;
    /** 订单ID */
    orderId?: number;
    /** 衣物类型ID */
    clothingTypeId?: number;
    /** 自定义衣物类型 */
    customType?: string;
    /** 问题描述 */
    problemDesc?: string;
    /** 价格 */
    price?: number;
    /** 处理状态 1-待处理-pending,2-洗涤中-washing,3-烘干中-drying,4-熨烫中-ironing,5-质检中-quality_check,6-已完成-finished,7-问题衣物-problem */
    processStatus?: number;
    /** 特殊要求 */
    specialInstruction?: string;
    /** 开始处理时间 */
    startTime?: Date;
    /** 完成处理时间 */
    endTime?: Date;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
