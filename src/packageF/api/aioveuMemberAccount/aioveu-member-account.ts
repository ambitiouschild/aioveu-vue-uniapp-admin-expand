import request from "@/utils/request";

const AIOVEUMEMBERACCOUNT_BASE_URL = "/api/v1/aioveu-member-account";

const AioveuMemberAccountAPI = {
    /** 获取会员充值账户分页数据 */
    getPage(queryParams?: AioveuMemberAccountPageQuery) {
        return request<PageResult<AioveuMemberAccountPageVO[]>>({
            url: `${AIOVEUMEMBERACCOUNT_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取会员充值账户表单数据
     *
     * @param id 会员充值账户ID
     * @returns 会员充值账户表单数据
     */
    getFormData(id: number) {
        return request<AioveuMemberAccountForm>({
            url: `${AIOVEUMEMBERACCOUNT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加会员充值账户
     *
     *  @param data 会员充值账户表单数据
     */
    add(data: AioveuMemberAccountForm) {
        return request({
            url: `${AIOVEUMEMBERACCOUNT_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新会员充值账户
     *
     * @param id 会员充值账户ID
     * @param data 会员充值账户表单数据
     */
     update(id: number, data: AioveuMemberAccountForm) {
        return request({
            url: `${AIOVEUMEMBERACCOUNT_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除会员充值账户，多个以英文逗号(,)分割
     *
     * @param ids 会员充值账户ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUMEMBERACCOUNT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuMemberAccountAPI;

/** 会员充值账户分页查询参数 */
export interface AioveuMemberAccountPageQuery extends PageQuery {
    /** 账户ID */
    id?: number;
    /** 会员ID */
    memberId?: number;
    /** 账户状态(0-冻结 1-正常) */
    status?: number;
}

/** 会员充值账户表单对象 */
export interface AioveuMemberAccountForm {
    /** 账户ID */
    id?:  number;
    /** 会员ID */
    memberId?:  number;
    /** 现金余额 */
    cashBalance?:  number;
    /** 赠送余额 */
    giftBalance?:  number;
    /** 总余额 */
    totalBalance?:  number;
    /** 最后充值时间 */
    lastRechargeTime?:  Date;
    /** 账户状态(0-冻结 1-正常) */
    status?:  number;
}

/** 会员充值账户分页对象 */
export interface AioveuMemberAccountPageVO {
    /** 账户ID */
    id?: number;
    /** 会员ID */
    memberId?: number;

    /** 会员卡号 新增 */
    memberNo?: string;

    /** 会员姓名 新增 */
    name?: string;

    /** 现金余额 */
    cashBalance?: number;
    /** 赠送余额 */
    giftBalance?: number;
    /** 总余额 */
    totalBalance?: number;
    /** 最后充值时间 */
    lastRechargeTime?: Date;
    /** 账户状态(0-冻结 1-正常) */
    status?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
