const TOKEN_KEY = "app-token";
const USER_INFO_KEY = "user-info";

// 设置 token
export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token);
}

// 获取 token
export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || "";
}

// 清除 token
export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY);
}

// 设置用户信息
export function setUserInfo(userInfo: any) {
  uni.setStorageSync(USER_INFO_KEY, userInfo);
}

// 获取用户信息
export function getUserInfo(): any {
  return uni.getStorageSync(USER_INFO_KEY) || null;
}

// 清除用户信息
export function clearUserInfo() {
  uni.removeStorageSync(USER_INFO_KEY);
}

// 清除所有缓存信息
export function clearAll() {
  clearToken();
  clearUserInfo();
  // 清除字典缓存
  uni.removeStorageSync("dict_cache");
}
