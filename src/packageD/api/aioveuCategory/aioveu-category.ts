import request from "@/utils/request";

const AIOVEUCATEGORY_BASE_URL = "/api/v1/aioveu-category";

const AioveuCategoryAPI = {
    /** 获取物资分类分页数据 */
    getPage(queryParams?: AioveuCategoryPageQuery) {
        return request<PageResult<AioveuCategoryPageVO[]>>({
            url: `${AIOVEUCATEGORY_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取物资分类表单数据
     *
     * @param id 物资分类ID
     * @returns 物资分类表单数据
     */
    getFormData(id: number) {
        return request<AioveuCategoryForm>({
            url: `${AIOVEUCATEGORY_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加物资分类
     *
     *  @param data 物资分类表单数据
     */
    add(data: AioveuCategoryForm) {
        return request({
            url: `${AIOVEUCATEGORY_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新物资分类
     *
     * @param id 物资分类ID
     * @param data 物资分类表单数据
     */
     update(id: number, data: AioveuCategoryForm) {
        return request({
            url: `${AIOVEUCATEGORY_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除物资分类，多个以英文逗号(,)分割
     *
     * @param ids 物资分类ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUCATEGORY_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    /**
     * 获取所有分类列表（用于下拉选择框）
     * @returns 分类选项列表
     * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
     */
    getAllCategoryOptions() {
      return request<CategoryOptionVO[]>({
        url: `${AIOVEUCATEGORY_BASE_URL}/options`,
        method: "GET",
      });
    }



}

export default AioveuCategoryAPI;

/** 物资分类分页查询参数 */
export interface AioveuCategoryPageQuery extends PageQuery {
    /** 分类ID */
    id?: number;
    /** 分类名称 */
    name?: string;
    /** 分类描述 */
    description?: string;
}

/** 物资分类表单对象 */
export interface AioveuCategoryForm {

    /** 分类名称 */
    name?:  string;
    /** 父分类ID */
    parentId?:  number;
    /** 父分类名 */
    parentCategoryName?: string;
    /** 分类层级 */
    level?:  number;
    /** 分类描述 */
    description?:  string;
}

/** 物资分类分页对象 */
export interface AioveuCategoryPageVO {
    /** 分类ID */
    id?: number;
    /** 分类名称 */
    name?: string;
    /** 父分类ID */
    parentId?: number;
    /** 分类层级 */
    level?: number;
    /** 分类描述 */
    description?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/** 分类选项VO（用于下拉选择框） */
export interface CategoryOptionVO {
  /** 分类ID */
  categoryId: number;
  /** 分类名称 */
  categoryName: string;
}
