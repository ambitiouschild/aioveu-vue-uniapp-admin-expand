/** 未选 */
export const unCheckedStatus = 0;
/** 半选 */
export const halfCheckedStatus = 1;
/** 选中 */
export const isCheckedStatus = 2;

/**
 * 深拷贝内容
 * @param originData 拷贝对象
 * @author crlang(https://crlang.com)
 */
export function deepClone(originData: any): any {
  const type = Object.prototype.toString.call(originData);
  let data: any;
  if (type === "[object Array]") {
    data = [];
    for (let i = 0; i < originData.length; i++) {
      data.push(deepClone(originData[i]));
    }
  } else if (type === "[object Object]") {
    data = {} as Record<string, any>;
    for (const prop in originData) {
      if (Object.prototype.hasOwnProperty.call(originData, prop)) {
        // 非继承属性
        data[prop] = deepClone(originData[prop]);
      }
    }
  } else {
    data = originData;
  }
  return data;
}

/**
 * 获取所有指定的节点
 * @param list 列表
 * @param type 类型
 * @param value 值
 * @param packDisabledkey 是否包含禁用节点
 * @author crlang(https://crlang.com)
 */
export function getAllNodes(list: any[], type: string, value: any, packDisabledkey = true): any[] {
  if (!list || list.length === 0) {
    return [];
  }

  const res = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item[type] === value) {
      if ((packDisabledkey && item.disabled) || !item.disabled) {
        res.push(item);
      }
    }
  }

  return res;
}

/**
 * 获取所有指定的key值
 * @param list 列表
 * @param type 类型
 * @param value 值
 * @param packDisabledkey 是否包含禁用节点
 * @author crlang(https://crlang.com)
 */
export function getAllNodeKeys(
  list: any[],
  type: string,
  value: any,
  packDisabledkey = true
): string[] | null {
  if (!list || list.length === 0) {
    return null;
  }

  const res: string[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item[type] === value) {
      if ((packDisabledkey && item.disabled) || !item.disabled) {
        res.push(item.key);
      }
    }
  }

  return res.length ? res : null;
}

/**
 * 错误输出
 * @param msg 错误消息
 * @param args 附加参数
 */
export function logError(msg: string, ...args: any[]): void {
  console.error(`DaTree: ${msg}`, ...args);
}

const toString = Object.prototype.toString;

export function is(val: any, type: string): boolean {
  return toString.call(val) === `[object ${type}]`;
}

/**
 * 是否对象(Object)
 * @param val 值
 */
export function isObject(val: any): boolean {
  return val !== null && is(val, "Object");
}

/**
 * 是否数字(Number)
 * @param val 值
 */
export function isNumber(val: any): boolean {
  return is(val, "Number");
}

/**
 * 是否字符串(String)
 * @param val 值
 */
export function isString(val: any): boolean {
  return is(val, "String");
}

/**
 * 是否函数方法(Function)
 * @param val 值
 */
export function isFunction(val: any): boolean {
  return typeof val === "function";
}

/**
 * 是否布尔(Boolean)
 * @param val 值
 */
export function isBoolean(val: any): boolean {
  return is(val, "Boolean");
}

/**
 * 是否数组(Array)
 * @param val 值
 */
export function isArray(val: any): boolean {
  return val && Array.isArray(val);
}
