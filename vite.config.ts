import { defineConfig, type UserConfig, type ConfigEnv, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
  const UnoCss = await import("unocss/vite").then((i) => i.default);
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: "0.0.0.0",
      port: +env.VITE_APP_PORT,
      open: true,
      // 代理配置只在 H5（浏览器）开发时生效。 其他平台（如小程序、App）在开发时不使用 Vite 的开发服务器，它们直接运行在各自的环境中。
      proxy: {
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path) => path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
        },
      },
    },
    plugins: [
      // https://github.com/unocss/unocss
      UnoCss(),
      AutoImport({
        imports: ["vue", "uni-app"],
        dts: "src/types/auto-imports.d.ts", // 自动生成的类型声明文件
        eslintrc: {
          enabled: false,
        },
      }),

      uni()

    ],


  };
});
