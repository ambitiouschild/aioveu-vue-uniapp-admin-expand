import request from "@/utils/request";

const AuthAPI = {
  /**
   * 登录接口
   *
   * @param username 用户名
   * @param password 密码
   * @returns 返回 token
   */
  login(data: LoginFormData): Promise<LoginResult> {
    console.log("data", data);
    return request<LoginResult>({
      url: "/api/v1/auth/login",
      method: "POST",
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 微信登录接口
   *
   * @param code 微信登录code
   * @returns 返回 token
   */
  wechatLogin(code: string): Promise<LoginResult> {
    return request<LoginResult>({
      url: "/api/v1/auth/wechat-login",
      method: "POST",
      data: { code },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 登出接口
   */
  logout(): Promise<void> {
    return request({
      url: "/api/v1/auth/logout",
      method: "DELETE",
    });
  },
};

export default AuthAPI;

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  accessToken: string;
  /** token 类型 */
  tokenType?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}
