import request from "@/utils/request";

const AIOVEUCONTACT_BASE_URL = "/api/v1/aioveu-contact";

const AioveuContactAPI = {
    /** 获取客户联系人分页数据 */
    getPage(queryParams?: AioveuContactPageQuery) {
        return request<PageResult<AioveuContactPageVO[]>>({
            url: `${AIOVEUCONTACT_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取客户联系人表单数据
     *
     * @param id 客户联系人ID
     * @returns 客户联系人表单数据
     */
    getFormData(id: number) {
        return request<AioveuContactForm>({
            url: `${AIOVEUCONTACT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加客户联系人
     *
     *  @param data 客户联系人表单数据
     */
    add(data: AioveuContactForm) {
        return request({
            url: `${AIOVEUCONTACT_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新客户联系人
     *
     * @param id 客户联系人ID
     * @param data 客户联系人表单数据
     */
     update(id: number, data: AioveuContactForm) {
        return request({
            url: `${AIOVEUCONTACT_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除客户联系人，多个以英文逗号(,)分割
     *
     * @param ids 客户联系人ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUCONTACT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    getAllContactOptions() {
      return request<ContactOptionVO[]>({
        url: `${AIOVEUCONTACT_BASE_URL}/options`,
        method: "GET",
      });
    },

}

export default AioveuContactAPI;

/** 客户联系人分页查询参数 */
export interface AioveuContactPageQuery extends PageQuery {
    /** 联系人ID（主键） */
    id?: number;
    /** 客户ID */
    customerId?: number;


  customerName?: string;
    /** 联系人姓名 */
    name?: string;
    /** 手机号码 */
    mobile?: string;
    /** 电子邮箱 */
    email?: string;
}

/** 客户联系人表单对象 */
export interface AioveuContactForm {
    /** 客户ID */
    customerId?:  number;
    /** 客户 */
    customerName?:  string;
    /** 联系人姓名 */
    name?:  string;
    /** 职位 */
    position?:  string;
    /** 部门 */
    department?:  string;
    /** 手机号码 */
    mobile?:  string;
    /** 办公电话 */
    phone?:  string;
    /** 电子邮箱 */
    email?:  string;
    /** 微信号 */
    wechat?:  string;
    /** 是否是主要联系人：0-否，1-是 */
    isPrimary?:  number;
    /** 性别 */
    gender?:  number;
    /** 生日 */
    birthday?:  Date;
    /** 兴趣爱好 */
    hobbies?:  string;
    /** 备注 */
    notes?:  string;
}

/** 客户联系人分页对象 */
export interface AioveuContactPageVO {
    /** 联系人ID（主键） */
    id?: number;
    /** 客户ID */
    customerId?: number;
    /** 联系人姓名 */
    name?: string;
    /** 职位 */
    position?: string;
    /** 部门 */
    department?: string;
    /** 手机号码 */
    mobile?: string;
    /** 办公电话 */
    phone?: string;
    /** 电子邮箱 */
    email?: string;
    /** 微信号 */
    wechat?: string;
    /** 是否是主要联系人：0-否，1-是 */
    isPrimary?: number;
    /** 性别 */
    gender?: number;
    /** 生日 */
    birthday?: Date;
    /** 兴趣爱好 */
    hobbies?: string;
    /** 备注 */
    notes?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
export interface ContactOptionVO {
  contactId: number;
  contactName: string;
}
