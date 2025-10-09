import { useUserStore } from "@/store/modules/user";

/**
 * 检查用户登录状态，未登录则跳转到登录页面
 * @returns 返回用户是否已登录
 */
export function checkLogin(): boolean {
  const userStore = useUserStore();

  if (!userStore.userInfo) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentPagePath = `/${currentPage.route}`;

    uni.navigateTo({
      url: `/pages/login/index?redirect=${encodeURIComponent(currentPagePath)}`,
    });
    return false;
  }

  return true;
}
