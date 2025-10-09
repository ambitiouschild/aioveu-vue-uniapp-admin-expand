import { defineStore } from "pinia";
import AuthAPI, { type LoginFormData } from "@/api/auth";
import UserAPI, { type UserInfo } from "@/api/system/user";
import { setToken, getUserInfo, setUserInfo, clearAll } from "@/utils/cache";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo | undefined>(getUserInfo());
  const permissions = ref<string[]>([]); // 新增权限列表字段

  // 登录
  const login = (data: LoginFormData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.login(data)
        .then((data) => {
          setToken(data.accessToken);
          resolve(data);
        })
        .catch((error) => {
          console.error("登录失败", error);
          reject(error);
        });
    });
  };

  // 微信登录
  const loginByWechat = (code: string) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatLogin(code)
        .then((data) => {
          setToken(data.accessToken);
          resolve(data);
        })
        .catch((error) => {
          console.error("微信登录失败", error);
          reject(error);
        });
    });
  };

  // 获取用户信息
  const getInfo = () => {
    return new Promise((resolve, reject) => {
      UserAPI.getUserInfo()
        .then((data) => {

          // // 新增权限数据处理
          // if (data.perms) {
          //   permissions.value = data.perms;
          // }
          console.log("获取用户信息成功，我是雒世松");
          setUserInfo(data);
          userInfo.value = data;
          resolve(data);
        })
        .catch((error) => {
          console.error("获取用户信息失败", error);
          reject(error);
        });
    });
  };


  // 登出
  const logout = async () => {
    try {
      await AuthAPI.logout(); // 调用后台注销接口
    } catch (error) {
      console.error("登出失败", error);
    } finally {
      clearAll(); // 清除本地的 token 和用户信息缓存
      userInfo.value = undefined; // 清空用户信息
    }
  };

  // 判断用户信息是否完整
  const isUserInfoComplete = (): boolean => {
    if (!userInfo.value) return false;

    return !!(userInfo.value.nickname && userInfo.value.avatar);
  };

  // // 检查权限
  // const hasPermission = (perm: string): boolean => {
  //   return permissions.value.includes(perm);
  // };

  return {
    userInfo,
    // permissions, // 导出权限列表
    login,
    loginByWechat,
    logout,
    getInfo,
    isUserInfoComplete,

    // hasPermission, // 导出权限检查方法
  };
});

//分析问题：
// 1.指令v-has-perm的实现依赖于从store中获取的用户权限列表。
// 2.在user store中，目前并没有存储权限列表，也没有在获取用户信息的同时获取权限。
// 3. 因此，我们需要在user store中添加权限状态，并在获取用户信息时同时获取权限列表。
//解决方案：
// 1.修改user store，添加permissions状态和加载权限的方法。
// 2.在getInfo方法中，除了获取用户信息，还要获取权限列表（或者单独提供一个加载权限的方法，并在适当的时候调用）。
// 3.确保在指令中能够访问到permissions状态。
//由于用户已经调用了getInfo，但指令仍然无法识别，可能是因为权限数据没有正确存储或指令没有正确实现。
