import request from "@/utils/request";

const AIOVEUDEPARTMENT_BASE_URL = "/api/v1/aioveu-department";

const AioveuDepartmentAPI = {

    /** 获取公司部门组织结构分页数据 */
    getPage(queryParams?: AioveuDepartmentPageQuery) {
        return request<PageResult<AioveuDepartmentPageVO[]>>({
            url: `${AIOVEUDEPARTMENT_BASE_URL}/page`,
            method: "GET",
            data: queryParams, // 将 params 改为 data
        });
    },
    /**
     * 获取公司部门组织结构表单数据
     *
     * @param id 公司部门组织结构ID
     * @returns 公司部门组织结构表单数据
     */
    getFormData(id: number) {
        return request<AioveuDepartmentForm>({
            url: `${AIOVEUDEPARTMENT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加公司部门组织结构
     *
     *  @param data 公司部门组织结构表单数据
     */
    add(data: AioveuDepartmentForm) {
        return request({
            url: `${AIOVEUDEPARTMENT_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新公司部门组织结构
     *
     * @param id 公司部门组织结构ID
     * @param data 公司部门组织结构表单数据
     */
     update(id: number, data: AioveuDepartmentForm) {
        return request({
            url: `${AIOVEUDEPARTMENT_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除公司部门组织结构，多个以英文逗号(,)分割
     *
     * @param ids 公司部门组织结构ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUDEPARTMENT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    /**
     * 根据部门ID列表获取部门名称映射
     * @param deptIds 部门ID列表
     * @returns 部门ID到部门名称的映射
     * getDepartmentMapByIds方法原本计划用于将部门ID映射为部门名称，
     * 但在表格中我们已经通过后端返回的deptName字段直接显示了部门名称，因此不需要在前端进行映射。
     *
     * 所以，用户可能注意到这个方法没有被调用，但实际上我们不需要调用它，因为部门名称已经由后端返回
     *
     * 1.在岗位管理页面中，我们有一个表格，其中有一列是“所属部门”，显示的是部门名称（deptName）。
     * 2.这个deptName是在后端查询岗位列表时，通过关联查询部门表得到的，所以后端直接返回了部门名称。
     * 3.因此，前端不需要再根据部门ID去查询部门名称，所以getDepartmentMapByIds方法没有被使用是正常的。
     */
      getDepartmentMapByIds(deptIds: number[]) {
        return request<Map<number, string>>({
          url: `${AIOVEUDEPARTMENT_BASE_URL}/map`,
          method: "POST",
          data: deptIds
        });
      },


      /**
       * 获取所有部门列表（用于下拉选择框）
       * @returns 部门选项列表
       * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
       */
      getAllDepartmentOptions() {
        return request<DeptOptionVO[]>({
          url: `${AIOVEUDEPARTMENT_BASE_URL}/options`,
          method: "GET",
        });
      },
}

export default AioveuDepartmentAPI;

/** 公司部门组织结构分页查询参数 */
export interface AioveuDepartmentPageQuery extends PageQuery {
    /** 部门ID */
    deptId?: number;
    /** 部门名称 */
    deptName?: string;
    /** 上级部门ID */
    parentDeptId?: number;
    /** 上级部门 */
    parentDeptName?: string;
    /** 部门经理 */
    managerId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/** 公司部门组织结构表单对象 */
export interface AioveuDepartmentForm {

    /** 部门名称 */
    deptName?:  string;
    /** 上级部门ID */
    parentDeptId?:  number;

    parentDeptName?: string;

}

/** 公司部门组织结构分页对象 */
export interface AioveuDepartmentPageVO {
    /** 部门ID */
    deptId?: number;  // 确保这里定义了 deptId
    /** 部门名称 */
    deptName?: string;
    /** 上级部门ID */
    parentDeptId?: number;
    /** 部门经理 */
    managerId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/** 部门选项VO（用于下拉选择框） */
export interface DeptOptionVO {
  /** 部门ID */
  deptId: number;
  /** 部门名称 */
  deptName: string;
}

