import request from "@/utils/request";

const AIOVEUMEMBERRECHARGERECORD_BASE_URL = "/api/v1/aioveu-member-recharge-record";

const AioveuMemberRechargeRecordAPI = {
    /** 获取会员充值记录分页数据 */
    getPage(queryParams?: AioveuMemberRechargeRecordPageQuery) {
        return request<PageResult<AioveuMemberRechargeRecordPageVO[]>>({
            url: `${AIOVEUMEMBERRECHARGERECORD_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取会员充值记录表单数据
     *
     * @param id 会员充值记录ID
     * @returns 会员充值记录表单数据
     */
    getFormData(id: number) {
        return request<AioveuMemberRechargeRecordForm>({
            url: `${AIOVEUMEMBERRECHARGERECORD_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加会员充值记录
     *
     *  @param data 会员充值记录表单数据
     */
    add(data: AioveuMemberRechargeRecordForm) {
        return request({
            url: `${AIOVEUMEMBERRECHARGERECORD_BASE_URL}`,
            method: "POST",
            data,
        });
    },

  /**
   *  添加会员充值记录
   *
   *  @param data 会员充值记录表单数据
   */
  saveAioveuMemberRechargeRecordandexecuteRecharge(data: AioveuMemberRechargeRecordForm) {
    return request({
      url: `${AIOVEUMEMBERRECHARGERECORD_BASE_URL}/execute`,
      method: "POST",
      data,
    });
  },

    /**
     * 更新会员充值记录
     *
     * @param id 会员充值记录ID
     * @param data 会员充值记录表单数据
     */
     update(id: number, data: AioveuMemberRechargeRecordForm) {
        return request({
            url: `${AIOVEUMEMBERRECHARGERECORD_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除会员充值记录，多个以英文逗号(,)分割
     *
     * @param ids 会员充值记录ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUMEMBERRECHARGERECORD_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuMemberRechargeRecordAPI;

/** 会员充值记录分页查询参数 */
export interface AioveuMemberRechargeRecordPageQuery extends PageQuery {
    /** 充值记录ID */
    id?: number;
    /** 充值单号 */
    rechargeNo?: string;
    /** 会员ID */
    memberId?: number;
    /** 支付方式 1-wechat,2-alipay,3-cash,4-card,5-bank */
    paymentType?: number;
}

/** 会员充值记录表单对象 */
export interface AioveuMemberRechargeRecordForm {
    /** ID */
    id?:  number;
    /** 充值单号 */
    rechargeNo?:  string;
    /** 会员ID */
    memberId?:  number;
    /** 充值金额 */
    amount?:  number;
    /** 赠送金额 */
    giftAmount?:  number;
    /** 支付方式 1-wechat,2-alipay,3-cash,4-card,5-bank */
    paymentType?:  number;
    /** 充值时间 */
    rechargeTime?:  Date;
    /** 操作员ID */
    operatorId?:  number;
    /** 状态1-pending待定,2-success成功,3-failed失败 */
    status?:  number;
    /** 备注 */
    remark?:  string;
}

/** 会员充值记录分页对象 */
export interface AioveuMemberRechargeRecordPageVO {
    /** 充值记录ID */
    id?: number;
    /** 充值单号 */
    rechargeNo?: string;
    /** 会员ID */
    memberId?: number;
    /** 充值金额 */
    amount?: number;
    /** 赠送金额 */
    giftAmount?: number;
    /** 支付方式 1-wechat,2-alipay,3-cash,4-card,5-bank */
    paymentType?: number;
    /** 充值时间 */
    rechargeTime?: Date;
    /** 操作员ID */
    operatorId?: number;
    /** 状态1-pending待定,2-success成功,3-failed失败 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
