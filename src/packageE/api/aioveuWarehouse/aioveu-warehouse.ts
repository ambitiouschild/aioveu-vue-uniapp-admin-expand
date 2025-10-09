import request from "@/utils/request";

const AIOVEUWAREHOUSE_BASE_URL = "/api/v1/aioveu-warehouse";

const AioveuWarehouseAPI = {
    /** 获取仓库信息分页数据 */
    getPage(queryParams?: AioveuWarehousePageQuery) {
        return request<PageResult<AioveuWarehousePageVO[]>>({
            url: `${AIOVEUWAREHOUSE_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取仓库信息表单数据
     *
     * @param id 仓库信息ID
     * @returns 仓库信息表单数据
     */
    getFormData(id: number) {
        return request<AioveuWarehouseForm>({
            url: `${AIOVEUWAREHOUSE_BASE_URL}/${id}/form`,
              method: "GET",
        });
    },

    /**
     *  添加仓库信息
     *
     *  @param data 仓库信息表单数据
     */
    add(data: AioveuWarehouseForm) {
        return request({
            url: `${AIOVEUWAREHOUSE_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新仓库信息
     *
     * @param id 仓库信息ID
     * @param data 仓库信息表单数据
     */
     update(id: number, data: AioveuWarehouseForm) {
        return request({
            url: `${AIOVEUWAREHOUSE_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除仓库信息，多个以英文逗号(,)分割
     *
     * @param ids 仓库信息ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUWAREHOUSE_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    /**
     * 获取所有部门列表（用于下拉选择框）
     * @returns 部门选项列表
     * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
     */
    getAllWarehouseOptions() {
      return request<WarehouseOptionVO[]>({
        url: `${AIOVEUWAREHOUSE_BASE_URL}/options`,
        method: "GET",
      });
    }

}

export default AioveuWarehouseAPI;

/** 仓库信息分页查询参数 */
export interface AioveuWarehousePageQuery extends PageQuery {
    /** 仓库ID */
    id?: number;
    /** 仓库名称 */
    name?: string;
    /** 仓库编码 */
    code?: string;
    /** 仓库位置 */
    location?: string;
    /** 负责人ID */
    managerId?: number;
    /** 负责人 */
    managerName?: string;
    /** 联系电话 */
    contactPhone?: string;
    /** 启用状态 */
    isActive?: number;
}

/** 仓库信息表单对象 */
export interface AioveuWarehouseForm {
    /** 仓库名称 */
    name?:  string;
    /** 仓库编码 */
    code?:  string;
    /** 仓库位置 */
    location?:  string;

    /** 仓库面积 */
    area?:  number;
    /** 存储容量 */
    capacity?:  number;
    /** 负责人 */
    managerId?:  number;
    /** 负责人 */
    managerName?:  string;
    /** 联系电话 */
    contactPhone?:  string;
    /** 仓库描述 */
    description?:  string;
    /** 启用状态 */
    isActive?:  number;
}

/** 仓库信息分页对象 */
export interface AioveuWarehousePageVO {
    /** 仓库ID */
    id?: number;
    /** 仓库名称 */
    name?: string;
    /** 仓库编码 */
    code?: string;
    /** 仓库位置 */
    location?: string;
    /** 仓库面积 */
    area?: number;
    /** 存储容量 */
    capacity?: number;
    /** 负责人ID */
    managerId?: number;
    /** 联系电话 */
    contactPhone?: string;
    /** 仓库描述 */
    description?: string;
    /** 启用状态 */
    isActive?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
/** 仓库信息分页对象 */
export interface WarehouseOptionVO {
  /** 仓库ID */
  warehouseId: number;
  /** 仓库名称 */
  warehouseName: string;
}
