import request from "@/utils/request";

const AIOVEUTRANSACTION_BASE_URL = "/api/v1/aioveu-transaction";

const AioveuTransactionAPI = {
    /** 获取客户交易记录分页数据 */
    getPage(queryParams?: AioveuTransactionPageQuery) {
        return request<PageResult<AioveuTransactionPageVO[]>>({
            url: `${AIOVEUTRANSACTION_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取客户交易记录表单数据
     *
     * @param id 客户交易记录ID
     * @returns 客户交易记录表单数据
     */
    getFormData(id: number) {
        return request<AioveuTransactionForm>({
            url: `${AIOVEUTRANSACTION_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加客户交易记录
     *
     *  @param data 客户交易记录表单数据
     */
    add(data: AioveuTransactionForm) {
        return request({
            url: `${AIOVEUTRANSACTION_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新客户交易记录
     *
     * @param id 客户交易记录ID
     * @param data 客户交易记录表单数据
     */
     update(id: number, data: AioveuTransactionForm) {
        return request({
            url: `${AIOVEUTRANSACTION_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除客户交易记录，多个以英文逗号(,)分割
     *
     * @param ids 客户交易记录ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${AIOVEUTRANSACTION_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default AioveuTransactionAPI;

/** 客户交易记录分页查询参数 */
export interface AioveuTransactionPageQuery extends PageQuery {
    /** 交易ID */
    id?: number;
    /** 交易编号 */
    transactionNo?: string;
    /** 客户ID */
    customerId?: number;

  customerName?: string;

    /** 联系人ID */
    contactId?: number;


  contactName?: string;
    /** 交易日期 */
    transactionDate?: [string, string];
    /** 支付方式 */
    paymentMethod?: number;
    /** 支付状态 */
    paymentStatus?: number;
    /** 交易类型 */
    transactionType?: number;
    /** 交易状态 */
    transactionStatus?: number;
}

/** 客户交易记录表单对象 */
export interface AioveuTransactionForm {
    /** 交易编号 */
    transactionNo?:  string;
    /** 客户ID */
    customerId?:  number;
    /** 客户 */
    customerName?:  string;
    /** 联系人ID */
    contactId?:  number;
    /** 联系人 */
    contactName?:  string;
    /** 交易日期 */
    transactionDate?:  Date;
    /** 交易金额 */
    amount?:  number;
    /** 货币代码 */
    currency?:  string;
    /** 支付方式 */
    paymentMethod?:  number;
    /** 支付状态 */
    paymentStatus?:  number;
    /** 交易类型 */
    transactionType?:  number;
    /** 发票号码 */
    invoiceNo?:  string;
    /** 产品ID */
    productId?:  number;
    /** 数量 */
    quantity?:  number;
    /** 单价 */
    unitPrice?:  number;
    /** 折扣率 */
    discount?:  number;
    /** 税率 */
    taxRate?:  number;
    /** 税额 */
    taxAmount?:  number;
    /** 总金额 */
    totalAmount?:  number;
    /** 销售负责人ID */
    salesRepId?:  number;
    /** 销售负责人 */
    salesRepName?:  string;

    /** 交易状态 */
    transactionStatus?:  number;
    /** 备注 */
    notes?:  string;
}

/** 客户交易记录分页对象 */
export interface AioveuTransactionPageVO {
    /** 交易ID */
    id?: number;
    /** 交易编号 */
    transactionNo?: string;
    /** 客户ID */
    customerId?: number;
    /** 联系人ID */
    contactId?: number;
    /** 交易日期 */
    transactionDate?: Date;
    /** 交易金额 */
    amount?: number;
    /** 货币代码 */
    currency?: string;
    /** 支付方式 */
    paymentMethod?: number;
    /** 支付状态 */
    paymentStatus?: number;
    /** 交易类型 */
    transactionType?: number;
    /** 发票号码 */
    invoiceNo?: string;
    /** 产品ID */
    productId?: number;
    /** 数量 */
    quantity?: number;
    /** 单价 */
    unitPrice?: number;
    /** 折扣率 */
    discount?: number;
    /** 税率 */
    taxRate?: number;
    /** 税额 */
    taxAmount?: number;
    /** 总金额 */
    totalAmount?: number;
    /** 销售负责人ID */
    salesRepId?: number;
    /** 交易状态 */
    transactionStatus?: number;
    /** 备注 */
    notes?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}
