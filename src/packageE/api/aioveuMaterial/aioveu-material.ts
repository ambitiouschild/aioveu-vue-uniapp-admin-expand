import request from "@/utils/request";

const AIOVEUMATERIAL_BASE_URL = "/api/v1/aioveu-material";

const AioveuMaterialAPI = {
    /** 获取物资分页数据 */
    getPage(queryParams?: AioveuMaterialPageQuery) {
        return request<PageResult<AioveuMaterialPageVO[]>>({
            url: `${AIOVEUMATERIAL_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取物资表单数据
     *
     * @param id 物资ID
     * @returns 物资表单数据
     */
    getFormData(id: number) {
        return request<AioveuMaterialForm>({
            url: `${AIOVEUMATERIAL_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加物资
     *
     *  @param data 物资表单数据
     */
    add(data: AioveuMaterialForm) {
        return request({
            url: `${AIOVEUMATERIAL_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新物资
     *
     * @param id 物资ID
     * @param data 物资表单数据
     */
     update(id: number, data: AioveuMaterialForm) {
        return request({
            url: `${AIOVEUMATERIAL_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除物资，多个以英文逗号(,)分割
     *
     * @param ids 物资ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUMATERIAL_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    getAllMaterialOptions() {
      return request<MaterialOptionVO[]>({
        url: `${AIOVEUMATERIAL_BASE_URL}/options`,
        method: "GET",
      });
  }
}

export default AioveuMaterialAPI;

/** 物资分页查询参数 */
export interface AioveuMaterialPageQuery extends PageQuery {
    /** 物资ID */
    id?: number;
    /** 物资名称 */
    name?: string;
    /** 分类ID */
    categoryId?: number;
    /** 分类 */
    categoryName?: string;
    /** 启用状态 */
    isActive?: number;
    /** 商品条码 */
    barcode?: string;
}

/** 物资表单对象 */
export interface AioveuMaterialForm {

    /** 物资名称 */
    name?:  string;
    /** 分类ID */
    categoryId?:  number;
    /** 分类名称 */
    categoryName?:  string;

    /** 采购单价 */
    purchasePrice?:  number;
    /** 供应商ID */
    supplierId?:  number;
    /** 最低库存量 */
    minStock?:  number;
    /** 最高库存量 */
    maxStock?:  number;
    /** 启用状态 */
    isActive?:  number;
    /** 商品条码 */
    barcode?:  string;
}

/** 物资分页对象 */
export interface AioveuMaterialPageVO {
    /** 物资ID */
    id?: number;
    /** 物资名称 */
    name?: string;
    /** 分类ID */
    categoryId?: number;
    /** 单位 */
    unit?: string;
    /** 规格型号 */
    spec?: string;
    /** 采购单价 */
    purchasePrice?: number;
    /** 供应商ID */
    supplierId?: number;
    /** 最低库存量 */
    minStock?: number;
    /** 最高库存量 */
    maxStock?: number;
    /** 启用状态 */
    isActive?: number;
    /** 商品条码 */
    barcode?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

export interface MaterialOptionVO {
  materialId: number;
  materialName: string;
}
