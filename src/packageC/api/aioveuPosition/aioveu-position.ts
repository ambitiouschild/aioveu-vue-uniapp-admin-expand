import request from "@/utils/request";
import { DeptOptionVO } from "@/packageC/api/aioveuDepartment/aioveu-department";

const AIOVEUPOSITION_BASE_URL = "/api/v1/aioveu-position";

const AioveuPositionAPI = {
    /** 获取公司岗位信息分页数据 */
    getPage(queryParams?: AioveuPositionPageQuery) {
        return request<PageResult<AioveuPositionPageVO[]>>({
            url: `${AIOVEUPOSITION_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取公司岗位信息表单数据
     *
     * @param id 公司岗位信息ID
     * @returns 公司岗位信息表单数据
     */
    getFormData(id: number) {
        return request< AioveuPositionForm>({
            url: `${AIOVEUPOSITION_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加公司岗位信息
     *
     *  @param data 公司岗位信息表单数据
     */
    add(data: AioveuPositionForm) {
        return request({
            url: `${AIOVEUPOSITION_BASE_URL}`,
              method: "POST",
            data,
        });
    },

    /**
     * 更新公司岗位信息
     *
     * @param id 公司岗位信息ID
     * @param data 公司岗位信息表单数据
     */
     update(id: number, data: AioveuPositionForm) {
        return request({
            url: `${AIOVEUPOSITION_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除公司岗位信息，多个以英文逗号(,)分割
     *
     * @param ids 公司岗位信息ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUPOSITION_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    /**
     * 获取所有岗位列表（用于下拉选择框）
     * @returns 岗位选项列表
     * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
     */
    getAllPositionOptions() {
      return request<PositionOptionVO[]>({
        url: `${AIOVEUPOSITION_BASE_URL}/options`,
        method: "GET",
      });
    },

}

export default AioveuPositionAPI;

/** 公司岗位信息分页查询参数 */
export interface AioveuPositionPageQuery extends PageQuery {
    /** 岗位ID */
    positionId?: number;
    /** 岗位名称 */
    positionName?: string;
    /** 所属部门ID */
    deptId?: number;
    /** 职级(1-10) */
    positionLevel?: number;
    /** 岗位描述 */
    description?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/** 公司岗位信息表单对象 */
export interface AioveuPositionForm {
    /** 岗位名称 */
    positionName?:  string;
    /** 所属部门ID */
    deptId?:  number;
    deptName?: string;
    /** 职级(1-10) */
    positionLevel?:  number;
    /** 岗位描述 */
    description?:  string;
}

/** 公司岗位信息分页对象 */
export interface AioveuPositionPageVO {
    /** 岗位ID */
    positionId?: number;
    /** 岗位名称 */
    positionName?: string;
    /** 所属部门ID */
    deptId?: number;
    /** 职级(1-10) */
    positionLevel?: number;
    /** 岗位描述 */
    description?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/** 岗位选项VO（用于下拉选择框） */
export interface PositionOptionVO {
  /** 岗位ID */
  positionId: number;
  /** 岗位名称 */
  positionName: string;
}
