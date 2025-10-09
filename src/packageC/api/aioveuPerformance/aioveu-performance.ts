import request from "@/utils/request";

const AIOVEUPERFORMANCE_BASE_URL = "/api/v1/aioveu-performance";

const AioveuPerformanceAPI = {
    /** 获取员工绩效考评分页数据 */
    getPage(queryParams?: AioveuPerformancePageQuery) {
        return request<PageResult<AioveuPerformancePageVO[]>>({
            url: `${AIOVEUPERFORMANCE_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取员工绩效考评表单数据
     *
     * @param id 员工绩效考评ID
     * @returns 员工绩效考评表单数据
     */
    getFormData(id: number) {
        return request<AioveuPerformanceForm>({
            url: `${AIOVEUPERFORMANCE_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加员工绩效考评
     *
     *  @param data 员工绩效考评表单数据
     */
    add(data: AioveuPerformanceForm) {
        return request({
            url: `${AIOVEUPERFORMANCE_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新员工绩效考评
     *
     * @param id 员工绩效考评ID
     * @param data 员工绩效考评表单数据
     */
     update(id: number, data: AioveuPerformanceForm) {
        return request({
            url: `${AIOVEUPERFORMANCE_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除员工绩效考评，多个以英文逗号(,)分割
     *
     * @param ids 员工绩效考评ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUPERFORMANCE_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuPerformanceAPI;

/** 员工绩效考评分页查询参数 */
export interface AioveuPerformancePageQuery extends PageQuery {
    /** 绩效记录ID */
    id?: number;
    /** 员工ID */
    employeeId?: number;
    /** 员工 */
    employeeName?: string;
    /** 考核年份 */
    periodYear?: number;
    /** 考核季度(1-4) */
    periodQuarter?: number;
    /** KPI评分(1-100分) */
    kpiScore?: number;
    /** 生产率百分比(%) */
    productivity?: number;
    /** 创建时间 */
    createTime?: [string, string];
    /** 更新时间 */
    updateTime?: [string, string];
    /** 绩效等级 */
    performanceGrade?: string;
}

/** 员工绩效考评表单对象 */
export interface AioveuPerformanceForm {
    /** 员工ID */
    employeeId?:  number;
    /** 员工姓名 */
    employeeName?: string;
    /** 考核年份 */
    periodYear?:  number;
    /** 考核季度(1-4) */
    periodQuarter?: number;
    /** KPI评分(1-100分) */
    kpiScore?:  number;
    /** 生产率百分比(%) */
    productivity?:  number;
    /** 主管评语 */
    review?:  string;
    /** 绩效等级 */
    // performanceGrade?:  string;
}

/** 员工绩效考评分页对象 */
export interface AioveuPerformancePageVO {
    /** 绩效记录ID */
    id?: number;
    /** 员工ID */
    employeeId?: number;
    /** 考核年份 */
    periodYear?: number;
    /** 考核季度(1-4) */
    periodQuarter?: number;
    /** KPI评分(1-100分) */
    kpiScore?: number;
    /** 生产率百分比(%) */
    productivity?: number;
    /** 主管评语 */
    review?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 绩效等级 */
    performanceGrade?: string;
}
