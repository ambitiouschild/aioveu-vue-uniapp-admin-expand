import { getToken as getAccessToken } from "@/utils/cache";

export interface UseStompOptions {
  /** WebSocket 地址，不传时使用 VITE_APP_WS_ENDPOINT 环境变量 */
  brokerURL?: string;
  /** 重连延迟，单位毫秒，默认为 8000 */
  reconnectDelay?: number;
  /** 连接超时时间，单位毫秒，默认为 10000 */
  connectionTimeout?: number;
  /** 是否开启指数退避重连策略 */
  useExponentialBackoff?: boolean;
  /** 最大重连次数，默认为 5 */
  maxReconnectAttempts?: number;
  /** 最大重连延迟，单位毫秒，默认为 60000 */
  maxReconnectDelay?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
}

/**
 * STOMP WebSocket连接Hook (UniApp版本)
 * 用于管理WebSocket连接的建立、断开、重连和消息订阅
 */
export function useStomp(options: UseStompOptions = {}) {
  // 默认配置
  const defaultBrokerURL = import.meta.env.VITE_APP_WS_ENDPOINT || "";
  const brokerURL = ref(options.brokerURL ?? defaultBrokerURL);
  const reconnectDelay = options.reconnectDelay ?? 8000;
  const connectionTimeout = options.connectionTimeout ?? 10000;
  const useExponentialBackoff = options.useExponentialBackoff ?? false;
  const maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
  const maxReconnectDelay = options.maxReconnectDelay ?? 60000;

  // 连接状态和计数
  const isConnected = ref(false);
  const reconnectCount = ref(0);
  let reconnectTimer: number | null = null;
  let connectionTimeoutTimer: number | null = null;

  // 存储所有订阅
  const subscriptions = ref<Record<string, any>>({});

  // WebSocket实例
  let socketTask: any = null;
  const client = ref<any>(null);

  /**
   * 创建WebSocket连接
   */
  const createSocketConnection = () => {
    const token = getAccessToken();
    if (!token) {
      console.error("WebSocket连接失败：未找到有效token");
      return null;
    }

    // 创建WebSocket连接
    try {
      // 构建带有token的URL
      let url = brokerURL.value;
      if (url.indexOf("?") > -1) {
        url += "&token=" + token;
      } else {
        url += "?token=" + token;
      }

      // 创建WebSocket连接
      socketTask = uni.connectSocket({
        url: url,
        complete: () => {},
      });

      if (!socketTask) {
        console.error("WebSocket连接创建失败");
        return null;
      }

      // 设置WebSocket事件处理函数
      socketTask.onOpen(() => {
        isConnected.value = true;
        reconnectCount.value = 0;
        if (connectionTimeoutTimer) clearTimeout(connectionTimeoutTimer);
        console.log("WebSocket连接已建立");
      });

      socketTask.onClose(() => {
        isConnected.value = false;
        console.log("WebSocket连接已关闭");

        // 如果使用指数退避重连策略，则处理重连
        if (useExponentialBackoff && reconnectCount.value < maxReconnectAttempts) {
          handleReconnect();
        }
      });

      socketTask.onError((error: any) => {
        console.error("WebSocket连接错误:", error);
      });

      socketTask.onMessage((res: any) => {
        const message = JSON.parse(res.data);
        // 处理订阅消息
        if (message.subscription && subscriptions.value[message.subscription]) {
          const subscription = subscriptions.value[message.subscription];
          if (subscription.callback) {
            subscription.callback(message);
          }
        }
      });

      return socketTask;
    } catch (error) {
      console.error("创建WebSocket连接时出错:", error);
      return null;
    }
  };

  /**
   * 处理重连逻辑
   */
  const handleReconnect = () => {
    if (reconnectCount.value >= maxReconnectAttempts) {
      console.error(`已达到最大重连次数(${maxReconnectAttempts})，停止重连`);
      return;
    }

    reconnectCount.value++;
    console.log(`尝试重连(${reconnectCount.value}/${maxReconnectAttempts})...`);

    // 使用指数退避策略
    const delay = useExponentialBackoff
      ? Math.min(reconnectDelay * Math.pow(2, reconnectCount.value - 1), maxReconnectDelay)
      : reconnectDelay;

    // 清除之前的计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    // 设置重连计时器
    reconnectTimer = setTimeout(() => {
      if (!isConnected.value) {
        connect();
      }
    }, delay) as unknown as number;
  };

  /**
   * 建立WebSocket连接
   */
  const connect = () => {
    if (isConnected.value) {
      return;
    }

    // 创建WebSocket连接
    socketTask = createSocketConnection();
    client.value = socketTask;

    // 设置连接超时
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
    }

    connectionTimeoutTimer = setTimeout(() => {
      if (!isConnected.value) {
        console.warn("WebSocket连接超时");
        if (useExponentialBackoff) {
          handleReconnect();
        }
      }
    }, connectionTimeout) as unknown as number;
  };

  /**
   * 订阅主题
   * @param destination 主题地址
   * @param callback 回调函数
   * @returns 订阅ID
   */
  const subscribe = (destination: string, callback: (message: any) => void): string => {
    if (!socketTask || !isConnected.value) {
      console.warn("WebSocket未连接，无法订阅:", destination);
      return "";
    }

    // 生成唯一订阅ID
    const subscriptionId = "sub-" + Math.random().toString(36).substr(2, 9);

    // 发送订阅消息
    socketTask.send({
      data: JSON.stringify({
        command: "SUBSCRIBE",
        headers: {
          id: subscriptionId,
          destination: destination,
        },
      }),
      success: () => {
        console.log(`订阅成功: ${destination}, ID: ${subscriptionId}`);
      },
      fail: (err: any) => {
        console.error(`订阅失败(${destination}):`, err);
      },
    });

    // 保存订阅
    subscriptions.value[subscriptionId] = {
      destination,
      callback,
    };

    return subscriptionId;
  };

  /**
   * 取消订阅
   * @param subscriptionId 订阅ID
   */
  const unsubscribe = (subscriptionId: string) => {
    if (!socketTask || !isConnected.value || !subscriptions.value[subscriptionId]) {
      return;
    }

    try {
      // 发送取消订阅消息
      socketTask.send({
        data: JSON.stringify({
          command: "UNSUBSCRIBE",
          headers: {
            id: subscriptionId,
          },
        }),
        success: () => {
          console.log(`已取消订阅: ${subscriptionId}`);
        },
        fail: (err: any) => {
          console.error(`取消订阅失败(${subscriptionId}):`, err);
        },
      });
    } catch (error) {
      console.error(`取消订阅失败(${subscriptionId}):`, error);
    } finally {
      Reflect.deleteProperty(subscriptions.value, subscriptionId);
    }
  };

  /**
   * 断开WebSocket连接
   */
  const disconnect = () => {
    if (!socketTask) {
      return;
    }

    // 取消所有订阅
    Object.keys(subscriptions.value).forEach(unsubscribe);

    // 断开WebSocket连接
    try {
      socketTask.close({
        success: () => {
          console.log("WebSocket连接已断开");
          isConnected.value = false;
          socketTask = null;
        },
        fail: (err: any) => {
          console.error("断开WebSocket连接失败:", err);
        },
      });
    } catch (error) {
      console.error("断开WebSocket连接失败:", error);
    }
  };

  // 返回公开的API
  return {
    isConnected,
    client,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}
