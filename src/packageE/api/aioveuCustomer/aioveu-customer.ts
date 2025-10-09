import request from "@/utils/request";

const AIOVEUCUSTOMER_BASE_URL = "/api/v1/aioveu-customer";

const AioveuCustomerAPI = {
    /** 获取客户信息分页数据 */
    getPage(queryParams?: AioveuCustomerPageQuery) {
        return request<PageResult<AioveuCustomerPageVO[]>>({
            url: `${AIOVEUCUSTOMER_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取客户信息表单数据
     *
     * @param id 客户信息ID
     * @returns 客户信息表单数据
     */
    getFormData(id: number) {
        return request<AioveuCustomerForm>({
            url: `${AIOVEUCUSTOMER_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加客户信息
     *
     *  @param data 客户信息表单数据
     */
    add(data: AioveuCustomerForm) {
        return request({
            url: `${AIOVEUCUSTOMER_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新客户信息
     *
     * @param id 客户信息ID
     * @param data 客户信息表单数据
     */
     update(id: number, data: AioveuCustomerForm) {
        return request({
            url: `${AIOVEUCUSTOMER_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除客户信息，多个以英文逗号(,)分割
     *
     * @param ids 客户信息ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUCUSTOMER_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    },

    getAllCustomerOptions() {
      return request<CustomerOptionVO[]>({
        url: `${AIOVEUCUSTOMER_BASE_URL}/options`,
        method: "GET",
      });
    },

}

export default AioveuCustomerAPI;

/** 客户信息分页查询参数 */
export interface AioveuCustomerPageQuery extends PageQuery {
    /** 客户ID */
    id?: number;
    /** 客户编号 */
    customerNo?: string;
    /** 客户名称 */
    name?: string;
    /** 客户类型 */
    type?: number;
    /** 信用等级 */
    creditRating?: number;
    /** 客户状态 */
    customerStatus?: number;
    /** 所在城市 */
    city?: string;
    /** 所在省份 */
    province?: string;
    /** 联系电话 */
    phone?: string;
    /** 客户来源 */
    source?: number;
    /** 销售负责人ID */
    salesRepId?: number;

  salesRepName?: string;
}

/** 客户信息表单对象 */
export interface AioveuCustomerForm {
    /** 客户编号 */
    customerNo?:  string;
    /** 客户名称 */
    name?:  string;
    /** 客户类型 */
    type?:  number;
    /** 行业分类ID */
    industryId?:  number;
    /** 信用等级 */
    creditRating?:  number;
    /** 客户状态 */
    customerStatus?:  number;
    /** 客户地址 */
    address?:  string;
    /** 所在城市 */
    city?:  string;
    /** 所在省份 */
    province?:  string;
    /** 国家 */
    country?:  string;
    /** 邮政编码 */
    postalCode?:  string;
    /** 联系电话 */
    phone?:  string;
    /** 电子邮箱 */
    email?:  string;
    /** 网址 */
    website?:  string;
    /** 税号 */
    taxId?:  string;
    /** 银行账号 */
    bankAccount?:  string;
    /** 开户行 */
    bankName?:  string;
    /** 年营业额 */
    annualRevenue?:  number;
    /** 员工人数 */
    employeeCount?:  number;
    /** 成立日期 */
    establishedDate?:  Date;
    /** 客户来源 */
    source?:  number;
    /** 销售负责人ID */
    salesRepId?:  number;
    /** 销售负责人 */
    salesRepName?:  string;
}

/** 客户信息分页对象 */
export interface AioveuCustomerPageVO {
    /** 客户ID */
    id?: number;
    /** 客户编号 */
    customerNo?: string;
    /** 客户名称 */
    name?: string;
    /** 客户类型 */
    type?: number;
    /** 行业分类ID */
    industryId?: number;
    /** 信用等级 */
    creditRating?: number;
    /** 客户状态 */
    customerStatus?: number;
    /** 客户地址 */
    address?: string;
    /** 所在城市 */
    city?: string;
    /** 所在省份 */
    province?: string;
    /** 国家 */
    country?: string;
    /** 邮政编码 */
    postalCode?: string;
    /** 联系电话 */
    phone?: string;
    /** 电子邮箱 */
    email?: string;
    /** 网址 */
    website?: string;
    /** 税号 */
    taxId?: string;
    /** 银行账号 */
    bankAccount?: string;
    /** 开户行 */
    bankName?: string;
    /** 年营业额 */
    annualRevenue?: number;
    /** 员工人数 */
    employeeCount?: number;
    /** 成立日期 */
    establishedDate?: Date;
    /** 客户来源 */
    source?: number;
    /** 销售负责人ID */
    salesRepId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

export interface CustomerOptionVO {
  customerId: number;
  customerName: string;
}
