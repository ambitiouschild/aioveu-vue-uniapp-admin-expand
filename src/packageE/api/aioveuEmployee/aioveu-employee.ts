import request from "@/utils/request";

const AIOVEUEMPLOYEE_BASE_URL = "/api/v1/aioveu-employee";

const AioveuEmployeeAPI = {
  /** 获取员工信息分页数据 */
  getPage(queryParams?: AioveuEmployeePageQuery) {
    return request<PageResult<AioveuEmployeePageVO[]>>({
      url: `${AIOVEUEMPLOYEE_BASE_URL}/page`,
      method: "GET",
      data: queryParams,
    });
  },
  /**
   * 获取员工信息表单数据
   *
   * @param id 员工信息ID
   * @returns 员工信息表单数据
   */
  getFormData(id: number) {
    return request<AioveuEmployeeForm>({
      url: `${AIOVEUEMPLOYEE_BASE_URL}/${id}/form`,
      method: "GET",
    });
  },

  /**
   *  添加员工信息
   *
   *  @param data 员工信息表单数据
   */
  add(data: AioveuEmployeeForm) {
    return request({
      url: `${AIOVEUEMPLOYEE_BASE_URL}`,
      method: "POST",
      data,
    });
  },

  /**
   * 更新员工信息
   *
   * @param id 员工信息ID
   * @param data 员工信息表单数据
   */
  update(id: number, data: AioveuEmployeeForm) {
    return request({
      url: `${AIOVEUEMPLOYEE_BASE_URL}/${id}`,
      method: "PUT",
      data,
    });
  },

  /**
   * 批量删除员工信息，多个以英文逗号(,)分割
   *
   * @param ids 员工信息ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${AIOVEUEMPLOYEE_BASE_URL}/${ids}`,
      method: "DELETE",
    });
  },

  /**
   * 获取所有员工列表（用于下拉选择框）
   * @returns 员工选项列表
   * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
   */
  getAllEmployeeOptions() {
    return request<EmployeeOptionVO[]>({
      url: `${AIOVEUEMPLOYEE_BASE_URL}/options`,
      method: "GET",
    });
  }
}

export default AioveuEmployeeAPI;

/** 员工信息分页查询参数 */
export interface AioveuEmployeePageQuery extends PageQuery {
  /** 员工ID */
  employeeId?: number;
  /** 员工编号 */
  empCode?: string;
  /** 姓名 */
  name?: string;
  /** 性别 */
  gender?: number;
  /** 出生日期 */
  birthDate?: [string, string];
  /** 身份证号 */
  idCard?: string;
  /** 手机号码 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 所属部门 */
  deptId?: number;
  /** 岗位ID */
  positionId?: number;
  /** 入职日期 */
  hireDate?: [string, string];
  /** 基本薪资 */
  salary?: number;
  /** 状态：0-离职，1-在职,2-休假,3-实习 */
  status?: number;
  /** 创建时间 */
  createTime?: [string, string];
  /** 更新时间 */
  updateTime?: [string, string];
}

/** 员工信息表单对象 */
export interface AioveuEmployeeForm {

  /** 员工编号 */
  empCode?:  string;
  /** 姓名 */
  name?:  string;
  /** 性别 */
  gender?:  number;
  /** 出生日期 */
  birthDate?:  Date;
  /** 身份证号 */
  idCard?:  string;
  /** 手机号码 */
  phone?:  string;
  /** 邮箱 */
  email?:  string;
  /** 所属部门 */
  deptId?:  number;
  /** 所属部门名称 */
  deptName?:  string;
  /** 岗位ID */
  positionId?:  number;
  /** 岗位名称 */
  positionName?:  string;
  /** 入职日期 */
  hireDate?:  Date;
  /** 基本薪资 */
  salary?:  number;
  /** 状态：0-离职，1-在职,2-休假,3-实习 */
  status?:  number;
}

/** 员工信息分页对象 */
export interface AioveuEmployeePageVO {
  /** 员工ID */
  employeeId?: number;
  /** 员工编号 */
  empCode?: string;
  /** 姓名 */
  name?: string;
  /** 性别 */
  gender?: number;
  /** 出生日期 */
  birthDate?: Date;
  /** 身份证号 */
  idCard?: string;
  /** 手机号码 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 所属部门 */
  deptId?: number;
  /** 岗位ID */
  positionId?: number;
  /** 入职日期 */
  hireDate?: Date;
  /** 基本薪资 */
  salary?: number;
  /** 状态：0-离职，1-在职,2-休假,3-实习 */
  status?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/** 员工选项VO（用于下拉选择框） */
export interface EmployeeOptionVO {

  /** 员工ID */
  employeeId: number;
  /** 员工名称 */
  employeeName: string;
}
