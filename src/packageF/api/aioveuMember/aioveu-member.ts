import request from "@/utils/request";

const AIOVEUMEMBER_BASE_URL = "/api/v1/aioveu-member";

const AioveuMemberAPI = {
    /** 获取会员信息管理分页数据 */
    getPage(queryParams?: AioveuMemberPageQuery) {
        return request<PageResult<AioveuMemberPageVO[]>>({
            url: `${AIOVEUMEMBER_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取会员信息管理表单数据
     *
     * @param id 会员信息管理ID
     * @returns 会员信息管理表单数据
     */
    getFormData(id: number) {
        return request<AioveuMemberForm>({
            url: `${AIOVEUMEMBER_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加会员信息管理
     *
     *  @param data 会员信息管理表单数据
     */
    add(data: AioveuMemberForm) {
        return request({
            url: `${AIOVEUMEMBER_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新会员信息管理
     *
     * @param id 会员信息管理ID
     * @param data 会员信息管理表单数据
     */
     update(id: number, data: AioveuMemberForm) {
        return request({
            url: `${AIOVEUMEMBER_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除会员信息管理，多个以英文逗号(,)分割
     *
     * @param ids 会员信息管理ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUMEMBER_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    /**
     * 获取所有选项列表（用于下拉选择框）
     * @returns 选项列表
     * 因为request函数的类型定义允许第一个类型参数为any，从而绕过了类型检查
     */
    getAllMemberNoOptions() {
      return request<AioveuMemberOptionVO[]>({
        url: `${AIOVEUMEMBER_BASE_URL}/options`,
        method: "GET",
      });
    }
}

/** 选项VO（用于下拉选择框） */
export interface AioveuMemberOptionVO {
  /** ID */
  memberId: number;
  /** 名称 */
  memberNo: string;
}

export default AioveuMemberAPI;

/** 会员信息管理分页查询参数 */
export interface AioveuMemberPageQuery extends PageQuery {
    /** 会员ID */
    id?: number;
    /** 会员卡号 */
    memberNo?: string;
    /** 会员姓名 */
    name?: string;
    /** 手机号 */
    phone?: string;
    /** 会员等级 */
    levelId?: number;
    /** 状态 */
    status?: number;
}

/** 会员信息管理表单对象 */
export interface AioveuMemberForm {
    /** 会员ID */
    id?:  number;
    /** 会员卡号 */
    memberNo?:  string;
    /** 会员姓名 */
    name?:  string;
    /** 手机号 */
    phone?:  string;
    /** 身份证号 */
    idCard?:  string;
    /** 会员等级 */
    levelId?:  number;
    /** 入会时间 */
    joinDate?:  Date;
    /** 累计消费金额 */
    totalConsumption?:  number;
    /** 最后到店时间 */
    lastVisit?:  Date;
    /** 状态 */
    status?:  number;
}

/** 会员信息管理分页对象 */
export interface AioveuMemberPageVO {
    /** 会员ID */
    id?: number;
    /** 会员卡号 */
    memberNo?: string;
    /** 会员姓名 */
    name?: string;
    /** 手机号 */
    phone?: string;
    /** 身份证号 */
    idCard?: string;
    /** 会员等级 */
    levelId?: number;
    /** 入会时间 */
    joinDate?: Date;
    /** 累计消费金额 */
    totalConsumption?: number;
    /** 最后到店时间 */
    lastVisit?: Date;
    /** 状态 */
    status?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
