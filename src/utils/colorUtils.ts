/**
 * 颜色处理工具类
 */

/**
 * 获取浅色版本的颜色
 * @param hexColor 十六进制颜色值
 * @param factor 调亮因子 (0-1)
 * @returns 调亮后的颜色值
 */
export function getLighterColor(hexColor: string, factor: number): string {
  // 去掉#前缀
  const hex = hexColor.replace("#", "");

  // 解析RGB值
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // 调亮颜色
  r = Math.min(255, Math.floor(r + (255 - r) * factor));
  g = Math.min(255, Math.floor(g + (255 - g) * factor));
  b = Math.min(255, Math.floor(b + (255 - b) * factor));

  // 转回16进制
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 获取深色版本的颜色
 * @param hexColor 十六进制颜色值
 * @param factor 调暗因子 (0-1)
 * @returns 调暗后的颜色值
 */
export function getDarkerColor(hexColor: string, factor: number): string {
  // 去掉#前缀
  const hex = hexColor.replace("#", "");

  // 解析RGB值
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // 调暗颜色
  r = Math.max(0, Math.floor(r * factor));
  g = Math.max(0, Math.floor(g * factor));
  b = Math.max(0, Math.floor(b * factor));

  // 转回16进制
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
