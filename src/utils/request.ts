import { getToken, clearAll } from "@/utils/cache";
import { ResultCodeEnum } from "@/enums/ResultCodeEnum";

export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  // H5 使用 VITE_APP_BASE_API 作为代理路径，其他平台使用 VITE_APP_API_URL 作为请求路径
  let baseApi = import.meta.env.VITE_APP_API_URL;
  // #ifdef H5
  baseApi = import.meta.env.VITE_APP_BASE_API;
  // #endif

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: `${baseApi}${options.url}`,
      header: {
        ...options.header,
        Authorization: getToken() ? `Bearer ${getToken()}` : "",
      },
      success: (response) => {
        console.log("success response", response);
        const resData = response.data as ResponseData<T>;

        // 业务状态码 00000 表示成功
        if (resData.code === ResultCodeEnum.SUCCESS) {
          resolve(resData.data);
        }
        // 令牌失效或过期处理
        else if (resData.code === ResultCodeEnum.TOKEN_INVALID) {
          console.log("令牌失效或过期处理");
          clearAll();
          // 跳转到登录页
          uni.reLaunch({
            url: "/packageA/pages/login/index",
          });
        } else {
          // 其他业务处理失败
          uni.showToast({
            title: resData.msg || "业务处理失败",
            icon: "none",
          });
          reject({
            message: resData.msg || "业务处理失败",
            code: resData.code,
          });
        }
      },
      fail: (error) => {
        console.log("fail error", error);
        uni.showToast({
          title: "网络请求失败",
          icon: "none",
          duration: 2000,
        });
        reject({
          message: "网络请求失败",
          error,
        });
      },
    });
  });
}
