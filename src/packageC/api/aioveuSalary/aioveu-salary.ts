import request from "@/utils/request";

const AIOVEUSALARY_BASE_URL = "/api/v1/aioveu-salary";

const AioveuSalaryAPI = {
    /** 获取员工工资明细分页数据 */
    getPage(queryParams?: AioveuSalaryPageQuery) {
        return request<PageResult<AioveuSalaryPageVO[]>>({
            url: `${AIOVEUSALARY_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取员工工资明细表单数据
     *
     * @param id 员工工资明细ID
     * @returns 员工工资明细表单数据
     */
    getFormData(id: number) {
        return request<AioveuSalaryForm>({
            url: `${AIOVEUSALARY_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加员工工资明细
     *
     *  @param data 员工工资明细表单数据
     */
    add(data: AioveuSalaryForm) {
        return request({
            url: `${AIOVEUSALARY_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新员工工资明细
     *
     * @param id 员工工资明细ID
     * @param data 员工工资明细表单数据
     */
     update(id: number, data: AioveuSalaryForm) {
        return request({
            url: `${AIOVEUSALARY_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除员工工资明细，多个以英文逗号(,)分割
     *
     * @param ids 员工工资明细ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUSALARY_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuSalaryAPI;

/** 员工工资明细分页查询参数 */
export interface AioveuSalaryPageQuery extends PageQuery {
    /** 工资记录ID */
    id?: number;
    /** 员工ID */
    employeeId?: number;
    /** 员工 */
    employeeName?: string;
    /** 工资周期（月份） */
    salaryPeriod?: [string, string];
    /** 基本工资 */
    baseSalary?: number;
    /** 绩效奖金 */
    performanceBonus?: number;
    /** 加班补贴 */
    overtimePay?: number;
    /** 各类津贴 */
    allowances?: number;
    /** 社保扣除 */
    socialSecurity?: number;
    /** 住房公积金 */
    housingFund?: number;
    /** 个人所得税 */
    tax?: number;
    /** 其他扣款 */
    otherDeductions?: number;
    /** 实发工资 */
    netSalary?: number;
    /** 实际发放日期 */
    paymentDate?: [string, string];
    /** 发放状态 */
    paymentStatus?: number;
    /** 创建时间 */
    createTime?: [string, string];
    /** 更新时间 */
    updateTime?: [string, string];
}

/** 员工工资明细表单对象 */
export interface AioveuSalaryForm {
    /** 员工ID */
    employeeId?:  number;
    /** 员工姓名 */
    employeeName?: string;
    /** 工资周期（月份） */
    salaryPeriod?:  Date;
    /** 基本工资 */
    baseSalary?:  number;
    /** 绩效奖金 */
    performanceBonus?:  number;
    /** 加班补贴 */
    overtimePay?:  number;
    /** 各类津贴 */
    allowances?:  number;
    /** 社保扣除 */
    socialSecurity?:  number;
    /** 住房公积金 */
    housingFund?:  number;
    /** 个人所得税 */
    tax?:  number;
    /** 其他扣款 */
    otherDeductions?:  number;
    /** 实发工资 */
    netSalary?:  number;
    /** 实际发放日期 */
    paymentDate?:  Date;
    /** 发放状态 */
    paymentStatus?:  number;
}

/** 员工工资明细分页对象 */
export interface AioveuSalaryPageVO {
    /** 工资记录ID */
    id?: number;
    /** 员工ID */
    employeeId?: number;
    /** 工资周期（月份） */
    salaryPeriod?: Date;
    /** 基本工资 */
    baseSalary?: number;
    /** 绩效奖金 */
    performanceBonus?: number;
    /** 加班补贴 */
    overtimePay?: number;
    /** 各类津贴 */
    allowances?: number;
    /** 社保扣除 */
    socialSecurity?: number;
    /** 住房公积金 */
    housingFund?: number;
    /** 个人所得税 */
    tax?: number;
    /** 其他扣款 */
    otherDeductions?: number;
    /** 实发工资 */
    netSalary?: number;
    /** 实际发放日期 */
    paymentDate?: Date;
    /** 发放状态 */
    paymentStatus?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
