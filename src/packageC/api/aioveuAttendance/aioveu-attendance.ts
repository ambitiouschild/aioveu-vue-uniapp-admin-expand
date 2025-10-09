import request from "@/utils/request";

const AIOVEUATTENDANCE_BASE_URL = "/api/v1/aioveu-attendance";

const AioveuAttendanceAPI = {
    /** 获取考勤信息分页数据 */
    getPage(queryParams?: AioveuAttendancePageQuery) {
        return request<PageResult<AioveuAttendancePageVO[]>>({
            url: `${AIOVEUATTENDANCE_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取考勤信息表单数据
     *
     * @param id 考勤信息ID
     * @returns 考勤信息表单数据
     */
    getFormData(id: number) {
        return request< AioveuAttendanceForm>({
            url: `${AIOVEUATTENDANCE_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加考勤信息
     *
     *  @param data 考勤信息表单数据
     */
    add(data: AioveuAttendanceForm) {
        return request({
            url: `${AIOVEUATTENDANCE_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新考勤信息
     *
     * @param id 考勤信息ID
     * @param data 考勤信息表单数据
     */
     update(id: number, data: AioveuAttendanceForm) {
        return request({
            url: `${AIOVEUATTENDANCE_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除考勤信息，多个以英文逗号(,)分割
     *
     * @param ids 考勤信息ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUATTENDANCE_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuAttendanceAPI;

/** 考勤信息分页查询参数 */
export interface AioveuAttendancePageQuery extends PageQuery {
    /** 考勤ID */
    attendanceId?: number;
    /** 员工ID */
    employeeId?: number;
    /** 员工 */
    employeeName?: string;
    /** 日期 */
    date?: [string, string];
    /** 上班打卡时间 */
    checkinTime?: [string, string];
    /** 下班打卡时间 */
    checkoutTime?: [string, string];
    /** 工作时长(小时) */
    workHours?: number;
    /** 考勤状态：0-正常，1-迟到，2-早退，3-缺勤，4-休假 */
    status?: number;
    /** 创建时间 */
    createTime?: [string, string];
    /** 更新时间 */
    updateTime?: [string, string];
}

/** 考勤信息表单对象 */
export interface AioveuAttendanceForm {
    /** 员工ID */
    employeeId?:  number;
    /** 员工姓名 */
    employeeName?: string;
    /** 日期 */
    date?:  string;
    /** 上班打卡时间 */
    checkinTime?:  string;
    /** 下班打卡时间 */
    checkoutTime?:  string;
    /** 工作时长(小时) */
    workHours?:  number;
    /** 考勤状态：0-正常，1-迟到，2-早退，3-缺勤，4-休假 */
    status?:  number;
}

/** 考勤信息分页对象 */
export interface AioveuAttendancePageVO {
    /** 考勤ID */
    attendanceId?: number;
    /** 员工ID */
    employeeId?: number;
    /** 日期 */
    date?: Date;
    /** 上班打卡时间 */
    checkinTime?: Date;
    /** 下班打卡时间 */
    checkoutTime?: Date;
    /** 工作时长(小时) */
    workHours?: number;
    /** 考勤状态：0-正常，1-迟到，2-早退，3-缺勤，4-休假 */
    status?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
