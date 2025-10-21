<template>
  <div class="scanner-container">
    <!-- 摄像头切换遮罩 -->
    <div v-if="cameraSwitching" class="camera-switch-overlay">
      <div class="spinner"></div>
      <div>切换摄像头中...</div>
    </div>

    <!-- 视频元素 -->
    <video
      v-if="videoReady"
      :key="videoKey"
      ref="videoElement"
      id="scannerVideo"
      class="scanner-video"
      autoplay
      playsinline
    ></video>

    <!-- 扫描覆盖层 -->
    <div class="scanner-overlay">
      <div class="scanner-frame"></div>
      <div class="scanner-line"></div>
      <div class="scanner-instruction">将二维码放入框内</div>
    </div>

    <!-- 控制按钮 -->
    <div class="scanner-controls">
      <button @click="toggleCamera" class="camera-switch">
        <i class="switch-icon">↻</i> 切换摄像头
      </button>
      <button @click="showManualInput" class="manual-input">手动输入</button>
      <button @click="handleCancel" class="cancel-btn">取消</button>
    </div>

    <!-- 点击提示 -->
    <div v-if="showClickHint" class="click-hint">
      请点击屏幕开始扫描
    </div>

    <!-- 设备列表 -->
<!--    遍历devices数组，为每个设备生成一个列表项。-->
    <div v-if="showDeviceList" class="device-list">
      <p>选择摄像头:</p>
      <ul>
        <li
          v-for="(device, index) in devices"
          :key="device.deviceId"
          @click="selectDevice(index)"
          :class="{active: deviceIndex === index}"
        >
<!--          :class="{active: deviceIndex === index}"：动态绑定class，如果当前设备的索引（index）等于选中的设备索引（deviceIndex），则添加active类，用于高亮显示当前选中的设备。-->
          {{ device.label || `摄像头 ${index + 1}` }}
        </li>
      </ul>
    </div>

    <!-- 调试工具 -->
    <div v-if="showDebugTools" class="debug-tools">
      <button @click="captureFrame">捕获当前帧</button>
      <button @click="toggleDebugTools">关闭调试</button>
    </div>

    <!-- 添加调试按钮 -->
    <button @click="toggleDebugTools" class="debug-btn">调试</button>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const emit = defineEmits(['decode', 'close', 'cancel']);
// 在状态变量部分添加
const firstCameraStart = ref(true); // 标记是否是第一次启动摄像头

// DOM元素引用
const videoElement = ref<HTMLVideoElement | null>(null);

// ZXing扫码器
const codeReader = new BrowserMultiFormatReader();

// 状态变量
const showClickHint = ref(false);
const devices = ref<MediaDeviceInfo[]>([]);
const deviceIndex = ref(0);
const currentStream = ref<MediaStream | null>(null);
const showDeviceList = ref(false);
const scanning = ref(false);
const videoReady = ref(false);
const cameraSwitching = ref(false);
const videoKey = ref(0); // 用于强制重新渲染视频元素
const currentDeviceLabel = ref('');

// 检测Safari浏览器
const isSafari = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
};

// 组件挂载时初始化
onMounted(() => {
  console.log('BarcodeScanner组件已挂载');
  setTimeout(() => {
    // 初始化设备列表（只执行一次）
    initDevices();

  }, 100);
  document.addEventListener('click', handleScreenClick);
});

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('click', handleScreenClick);
  stop();
});

// 初始化设备列表（只执行一次）
const initDevices = async () => {
  try {
    console.log('初始化设备列表...');

    // 检查浏览器支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('浏览器不支持设备枚举');
    }

    //在 initDevices中，我们获取权限后重新枚举设备，但是注意，在权限授予前，设备列表可能只有空ID的设备，权限授予后，设备列表会更新为有ID的设备。所以我们需要确保在权限授予后，再获取设备列表。
    // 先获取用户媒体权限，这样设备标签才会显示
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());

    // 获取所有设备
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    devices.value = allDevices.filter(device => device.kind === 'videoinput');

    if (devices.value.length === 0) {
      console.log('未找到摄像头设备');
      return;
    }

    console.log(`找到 ${devices.value.length} 个摄像头设备`);

    // 尝试查找后置摄像头
    const rearCameraIndex = findRearCameraIndex();

    // 设置当前设备索引
    deviceIndex.value = rearCameraIndex;
    const device = devices.value[deviceIndex.value];
    currentDeviceLabel.value = device.label || `摄像头 ${deviceIndex.value + 1}`;
    console.log('默认摄像头:', currentDeviceLabel.value);

    // 初始化扫描器
    initScanner();
  } catch (error) {
    console.error('初始化设备列表失败:', error);
    handleError(error);
  }
};

// 初始化扫描器
const initScanner = async () => {
  try {
    console.log('初始化扫描器');

    // 渲染视频元素
    videoReady.value = true;

    // 等待DOM更新
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 300));

    // 获取视频元素
    const videoElements = document.getElementsByClassName('scanner-video');
    if (videoElements.length === 0) {
      throw new Error('视频元素未创建');
    }

    const video = videoElements[0] as HTMLVideoElement;
    console.log('DOM中找到视频元素');
    videoElement.value = video;

    // 启动摄像头
    await startCamera();
  } catch (error) {
    console.error('初始化失败:', error);
    handleError(error);
  }
};


// 添加调试方法
const captureFrame = () => {
  const nativeVideo = getNativeVideoElement();
  if (!nativeVideo) return;

  const canvas = document.createElement('canvas');
  canvas.width = nativeVideo.videoWidth;
  canvas.height = nativeVideo.videoHeight;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.drawImage(nativeVideo, 0, 0, canvas.width, canvas.height);

    // 保存图像用于调试
    const dataUrl = canvas.toDataURL('image/png');
    console.log('当前视频帧:', dataUrl);

    // 或者显示在页面上
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.position = 'fixed';
    img.style.top = '0';
    img.style.left = '0';
    img.style.zIndex = '10000';
    img.style.maxWidth = '300px';
    document.body.appendChild(img);

    // 10秒后移除
    setTimeout(() => {
      document.body.removeChild(img);
    }, 10000);
  }
};

// 添加手动捕获帧按钮
const showDebugTools = ref(false);
const toggleDebugTools = () => {
  showDebugTools.value = !showDebugTools.value;
};

// 启动摄像头
const startCamera = async () => {
  try {
    console.log('启动摄像头...');

    // 优化扫描器设置
    optimizeScannerSettings();

    const deviceId = devices.value[deviceIndex.value].deviceId;
    console.log('设备id:', deviceId);
    const constraints = getConstraintsForDevice(deviceId);

    console.log('约束设置:', constraints);

    // 获取媒体流
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream.value = stream;
    console.log('获取到媒体流');

    // 第一次获取摄像头权限后无法直接切换摄像头，是因为在第一次获取权限时，设备标签（label）是空的，
    // 只有在获得权限后，标签才会被填充。当用户授予权限后，设备标签才会被正确填充，但此时设备列表没有更新，导致切换摄像头时使用的是旧的设备列表。
    // 重要：在获得权限后重新枚举设备，以获取带有标签的设备信息
    await refreshDevices();

    // 如果是第一次启动，尝试切换到后置摄像头
    if (firstCameraStart.value) {
      firstCameraStart.value = false;
      const switched = await trySwitchToRearCamera();
      if (switched) {
        // 如果切换成功，则当前调用不再继续，因为新的startCamera已经启动
        return;
      }
    }


    if (videoElement.value) {
      const nativeVideo = getNativeVideoElement();
      if (nativeVideo) {
        // 设置视频源
        nativeVideo.srcObject = stream;
        console.log('视频源已设置到原生元素');

        // 等待视频加载
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            console.log('视频元数据已加载');
            nativeVideo.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };

          nativeVideo.addEventListener('loadedmetadata', onLoaded);

          // 设置超时防止卡住
          setTimeout(() => {
            console.log('视频加载超时，继续执行');
            nativeVideo.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          }, 200);
        });

        console.log('视频准备就绪');
        startScanning();
        // Safari需要用户交互才能播放视频
        // if (isSafari()) {
        //   console.log('Safari浏览器，显示点击提示');
        //   showClickHint.value = true;
        // } else {
        //   console.log('非Safari浏览器，直接开始扫描');
        //   startScanning();
        // }
      }
    }
  } catch (error) {
    console.error('启动摄像头失败:', error);
    handleError(error);
  }
};

// 尝试切换到后置摄像头
const trySwitchToRearCamera = async (): Promise<boolean> => {
  try {
    console.log('尝试切换到后置摄像头...');

    // 查找后置摄像头
    const rearCameraIndex = findRearCameraIndex();

    if (rearCameraIndex >= 0 && rearCameraIndex !== deviceIndex.value) {
      console.log('找到后置摄像头，切换到索引:', rearCameraIndex);

      // 停止当前流
      if (currentStream.value) {
        currentStream.value.getTracks().forEach(track => track.stop());
        currentStream.value = null;
      }

//       第一次获取设备列表时，由于没有权限，设备标签为空，设备ID可能也是临时的。当用户授予权限后，重新枚举设备会得到带有标签的设备信息，此时设备列表会更新，索引对应的设备可能发生变化。
//
// 当用户添加或移除摄像头设备（例如，插入或拔出外接摄像头）时，设备列表会变化。
//
// 在我们的代码中，我们通过以下方式确保设备索引的准确性：
//
// 在初始化设备列表时，我们使用多种策略（标签、设备ID、设备位置等）来查找后置摄像头，并设置一个初始索引。
//
// 在用户授予权限后，我们刷新设备列表（refreshDevices），并更新当前设备索引（通过设备ID匹配）。
//
// 在切换摄像头时，我们更新设备索引为下一个设备。

      // 更新设备索引
      deviceIndex.value = rearCameraIndex;
      const device = devices.value[deviceIndex.value];
      currentDeviceLabel.value = device.label || `摄像头 ${deviceIndex.value + 1}`;
      console.log('切换到后置摄像头:', currentDeviceLabel.value);

      //在 trySwitchToRearCamera 中直接开始扫描 而不是重新启动摄像头
      // await startCamera();
      //1. 流程差异:在trySwitchToRearCamera中完成摄像头切换后，直接设置视频源并开始扫描，避免了重新调用startCamera的完整流程。
      // 2. 时间效率    直接开始扫描：在切换摄像头后立即开始扫描，减少了不必要的步骤，从而降低了延迟。
      //3. 逻辑清晰度: 直接开始扫描：流程线性，逻辑更清晰，减少了嵌套调用。
      //4. 资源消耗 直接开始扫描：在同一个方法内完成资源释放和新资源获取，资源管理更集中

      // 获取设备ID
      const deviceId = device.deviceId;

      // 创建约束
      const constraints = getConstraintsForDevice(deviceId);
      console.log('约束设置:', constraints);

      // 获取新流
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream.value = stream;
      console.log('获取到新流');

      // 设置视频源
      if (videoElement.value) {
        const nativeVideo = getNativeVideoElement();
        if (nativeVideo) {
          nativeVideo.srcObject = stream;
          console.log('视频源已设置');

          // 等待视频加载
          await new Promise<void>((resolve) => {
            const onLoaded = () => {
              console.log('视频元数据已加载');
              nativeVideo.removeEventListener('loadedmetadata', onLoaded);
              resolve();
            };

            nativeVideo.addEventListener('loadedmetadata', onLoaded);

            // 设置超时
            setTimeout(() => {
              console.log('视频加载超时，继续执行');
              nativeVideo.removeEventListener('loadedmetadata', onLoaded);
              resolve();
            }, 200);
          });

          console.log('视频准备就绪');

            // 非Safari，直接开始扫描
            startScanning();

          // 返回成功
          return true;
        }
      }
    }

    console.log('未找到后置摄像头或已经是后置摄像头');
    return false;
  } catch (error) {
    console.error('切换到后置摄像头失败:', error);
    return false;
  }
};

// 查找后置摄像头索引
const findRearCameraIndex = (): number => {
  // 策略1: 标签匹配  策略优先级：标签匹配策略优先级高于设备ID匹配
  // 顺序执行：只有当标签匹配失败（返回-1）时，才执行设备ID匹配
  //   避免重复匹配
  // 效率优化：如果标签匹配已找到设备，跳过设备ID匹配

  //   3. 处理查找失败
  // 查找失败标识：findIndex()方法在未找到匹配项时返回 -1
  // 失败处理：当标签匹配失败时，尝试备选策略
  let index = devices.value.findIndex(device =>
    device.label?.toLowerCase().includes('back') ||
    device.label?.toLowerCase().includes('rear') ||
    device.label?.toLowerCase().includes('environment')
  );

  // 策略2: 设备ID匹配
  if (index === -1) {
    index = devices.value.findIndex(device =>
      device.deviceId.includes('back') ||
      device.deviceId.includes('rear') ||
      device.deviceId.includes('environment')
    );
  }

  // 策略3: 设备组匹配
  if (index === -1 && devices.value.length > 1) {
    index = 1; // 假设后置摄像头在第二个位置
  }

  // 策略4: 设备ID长度匹配
  if (index === -1) {
    let maxLength = 0;
    devices.value.forEach((device, i) => {
      if (device.deviceId.length > maxLength) {
        maxLength = device.deviceId.length;
        index = i;
      }
    });
  }

  return index >= 0 ? index : 0;
};


// 刷新设备列表（在获得权限后调用）
const refreshDevices = async () => {
  try {
    console.log('刷新设备列表...');

    // 获取所有设备
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = allDevices.filter(device => device.kind === 'videoinput');

    // 更新设备列表
    devices.value = videoDevices;

    console.log('设备列表已刷新，找到设备:', devices.value.length);

    // 更新当前设备索引（如果设备ID匹配）
    if (devices.value.length > 0) {
      const currentDeviceId = devices.value[deviceIndex.value]?.deviceId;
      if (currentDeviceId) {
        const newIndex = devices.value.findIndex(d => d.deviceId === currentDeviceId);
        if (newIndex >= 0) {
          deviceIndex.value = newIndex;
        }
      }
    }
  } catch (error) {
    console.error('刷新设备列表失败:', error);
  }
};

// 获取设备约束
const getConstraintsForDevice = (deviceId: string) => {
  const device = devices.value.find(d => d.deviceId === deviceId);

  if (!device) {
    return { video: true };
  }



  // 如果设备ID为空，则不使用设备ID约束
  const videoConstraints: any = {};
  if (deviceId) {
    videoConstraints.deviceId = { exact: deviceId };
  }

  // 添加其他约束
  videoConstraints.width = { ideal: 1280 };
  videoConstraints.height = { ideal: 720 };

  // Safari需要明确的facingMode
  if (isSafari()) {
    const isRearCamera = device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment');

    //OverconstrainedError表示浏览器无法满足您对摄像头设置的约束条件
    return {
      video: {
        deviceId: { exact: deviceId },
        facingMode: isRearCamera ? 'environment' : 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
  }

  // return {
  //   video: {
  //     deviceId: { exact: deviceId },
  //     width: { ideal: 1280 },
  //     height: { ideal: 720 }
  //   }

  // 使用更宽松的约束  视频分辨率太低，无法清晰捕捉二维码  提高视频分辨率设置  同时指定了deviceId和facingMode，这在某些浏览器中会产生冲突
  return {
    video: {
      deviceId: { exact: deviceId },
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
      frameRate: { ideal: 30, min: 15 }
    }

  };
  // 针对电脑摄像头的优化约束

    // 宽松模式（第二次尝试）
    // return {
    //   video: {
    //     deviceId: { exact: deviceId },
    //     width: { ideal: 640 },
    //     height: { ideal: 480 },
    //     frameRate: { ideal: 15 }
    //   }
    // };
};


// 优化扫描器设置
const optimizeScannerSettings = () => {
  // 创建提示 Map
  const hints = new Map();

  // 设置解码格式
  hints.set('POSSIBLE_FORMATS', [
    'QR_CODE',
    'DATA_MATRIX',
    'UPC_A',
    'UPC_E',
    'EAN_8',
    'EAN_13',
    'CODE_39',
    'CODE_93',
    'CODE_128',
    'ITF',
    'RSS_14',
    'RSS_EXPANDED'
  ]);

  // 错误信息表明 @zxing/browser模块没有导出 DecodeHintType。这可能是由于版本差异或导出方式变化导致的
  // 设置尝试更努力地解码
  hints.set('TRY_HARDER', true);

  // 设置纯条形码模式
  hints.set('PURE_BARCODE', false);

  // 设置超时（毫秒）
  hints.set('TIMEOUT', 5000);

  // 应用提示
  codeReader.setHints(hints);
};

// 获取原生视频元素
const getNativeVideoElement = (): HTMLVideoElement | null => {
  if (!videoElement.value) return null;

  // 在uni-app中，自定义视频组件内部通常有一个真正的<video>元素
  const nativeVideo = videoElement.value.querySelector('video');
  if (nativeVideo) {
    return nativeVideo as HTMLVideoElement;
  }

  // 如果已经是原生video元素，直接返回
  if (videoElement.value.tagName === 'VIDEO') {
    return videoElement.value;
  }

  return null;
};

// 开始扫描
const startScanning = () => {
  const nativeVideo = getNativeVideoElement();
  if (!nativeVideo) {
    console.error('启动扫描失败: 视频元素不存在');
    return;
  }

  try{
    console.log('开始扫描...');

    // 使用正确的连续扫描方法
    codeReader.decodeFromVideoElement(
      nativeVideo,
      (result, error) => {
        // 检查扫描是否已停止
        if (!scanning.value) {
          console.log('扫描已停止，忽略结果');
          return;
        }

        if (result) {
          console.log('扫描到结果:', result.getText());
          emit('decode', result.getText());
          stop();
        } else if (error) {
          // 忽略 NotFoundException 错误
          if (!error.message.includes('NotFoundException')) {
            console.error('扫描错误:', error);
          }
        }
      }
    );

    console.log('扫描已启动');
    scanning.value = true;
    showClickHint.value = false;
  } catch (error) {
    console.error('启动扫描失败:', error);
  }
};

// Safari专用切换方法
const switchCameraInSafari = async (deviceId: string) => {
  console.log('Safari专用切换方法');

  try {
    // 1. 停止当前视频流
    if (currentStream.value) {
      console.log('停止当前视频流');
      currentStream.value.getTracks().forEach(track => track.stop());
      currentStream.value = null;
    }

    // 2. 强制重新渲染视频元素
    console.log('强制重新渲染视频元素');
    videoKey.value++;

    // 3. 等待DOM更新
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 300));

    // 4. 获取新的视频元素
    const videoElements = document.getElementsByClassName('scanner-video');
    if (videoElements.length === 0) {
      throw new Error('视频元素未创建');
    }

    const video = videoElements[0] as HTMLVideoElement;
    console.log('DOM中找到新的视频元素');
    videoElement.value = video;

    // 5. 创建新的约束
    const constraints = getConstraintsForDevice(deviceId);
    console.log('约束:', constraints);

    // 6. 获取新流
    console.log('获取新流');
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream.value = stream;
    console.log('获取到新流');

    // 7. 重新设置视频源
    if (videoElement.value) {
      const nativeVideo = getNativeVideoElement();
      if (nativeVideo) {
        nativeVideo.srcObject = stream;
        console.log('视频源已设置');

        // 8. Safari需要重新播放视频
        try {
          console.log('尝试播放视频');
          await nativeVideo.play();
          console.log('Safari视频播放成功');
        } catch (playError) {
          console.error('Safari视频播放失败:', playError);
          // 显示点击提示
          showClickHint.value = true;
        }
      }
    }

    // 9. 重新开始扫描
    console.log('重新开始扫描');
    startScanning();
  } catch (error) {
    console.error('Safari切换摄像头失败:', error);
    throw error;
  }
};

// 通用摄像头启动方法
const startCameraWithDevice = async (deviceId: string) => {
  const constraints = getConstraintsForDevice(deviceId);
  console.log('约束设置:', constraints);

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  currentStream.value = stream;

  if (videoElement.value) {
    const nativeVideo = getNativeVideoElement();
    if (nativeVideo) {
      nativeVideo.srcObject = stream;

      // 等待视频加载
      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          nativeVideo.removeEventListener('loadedmetadata', onLoaded);
          resolve();
        };

        nativeVideo.addEventListener('loadedmetadata', onLoaded);
      });

      // 重新开始扫描
      startScanning();
    }
  }
};

// 切换摄像头
const toggleCamera = async () => {
  if (devices.value.length <= 1) {
    uni.showToast({
      title: '只有一个摄像头',
      icon: 'none'
    });
    return;
  }

  try {
    cameraSwitching.value = true;
    console.log('开始切换摄像头...');

    // 停止当前流和扫描
    stopStream();

    // 更新设备索引
    deviceIndex.value = (deviceIndex.value + 1) % devices.value.length;
    const device = devices.value[deviceIndex.value];
    currentDeviceLabel.value = device.label || `摄像头 ${deviceIndex.value + 1}`;
    console.log('切换到摄像头:', currentDeviceLabel.value);

    // Safari特殊处理
    if (isSafari()) {
      console.log('Safari浏览器，使用专用切换方法');
      await switchCameraInSafari(device.deviceId);
    } else {
      console.log('非Safari浏览器，使用通用方法');
      await startCameraWithDevice(device.deviceId);
    }

    // 华为手机特殊处理
    if (isHuawei()) {
      console.log('华为手机，使用专用切换方法');
      await switchCameraForHuawei(device.deviceId);
    } else {
      console.log('非华为手机，使用通用方法');
      await startCameraWithDevice(device.deviceId);
    }

    // 显示设备列表
    showDeviceList.value = true;
    setTimeout(() => {
      showDeviceList.value = false;
    }, 3000);
  } catch (error) {
    console.error('切换摄像头失败:', error);

    // 尝试回退到前置摄像头
    try {
      const frontCamera = devices.value.find(device =>
        device.label.includes('front') ||
        device.label.includes('face')
      );

      if (frontCamera) {
        console.log('尝试回退到前置摄像头');
        deviceIndex.value = devices.value.indexOf(frontCamera);
        currentDeviceLabel.value = frontCamera.label || `摄像头 ${deviceIndex.value + 1}`;
        await startCameraWithDevice(frontCamera.deviceId);
      }
    } catch (fallbackError) {
      console.error('回退到前置摄像头失败:', fallbackError);
      uni.showToast({
        title: '摄像头切换失败',
        icon: 'error'
      });
    }
  } finally {
    cameraSwitching.value = false;
  }
};

// 检测华为手机
const isHuawei = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('huawei') !== -1 || ua.indexOf('honor') !== -1;
};

// 华为手机专用切换方法
const switchCameraForHuawei = async (deviceId: string) => {
  try {
    console.log('华为手机专用切换方法');

    // 1. 停止当前流
    if (currentStream.value) {
      currentStream.value.getTracks().forEach(track => track.stop());
      currentStream.value = null;
    }

    // 2. 创建新约束
    const constraints = {
      video: {
        deviceId: { exact: deviceId },
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { ideal: 30, min: 15 }
      }
    };

    console.log('华为约束:', constraints);

    // 3. 获取新流
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream.value = stream;
    console.log('获取到新流');

    // 4. 等待DOM更新
    await nextTick();

    // 5. 获取视频元素
    const videoElements = document.getElementsByClassName('scanner-video');
    if (videoElements.length === 0) {
      throw new Error('视频元素未创建');
    }

    const video = videoElements[0] as HTMLVideoElement;
    console.log('DOM中找到视频元素');
    videoElement.value = video;

    // 6. 设置视频源
    if (videoElement.value) {
      const nativeVideo = getNativeVideoElement();
      if (nativeVideo) {
        nativeVideo.srcObject = stream;
        console.log('视频源已设置');

        // 7. 等待视频加载
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            nativeVideo.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };

          nativeVideo.addEventListener('loadedmetadata', onLoaded);
        });

        console.log('视频准备就绪');

        // 8. 开始扫描
        startScanning();
      }
    }
  } catch (error) {
    console.error('华为切换摄像头失败:', error);
    throw error;
  }
};

// 选择特定设备
const selectDevice = (index: number) => {
  deviceIndex.value = index;
  startCamera();
  showDeviceList.value = false;
};

// 停止流
const stopStream = () => {
  // 停止媒体流
  if (currentStream.value) {
    console.log('停止媒体流');
    currentStream.value.getTracks().forEach(track => {
      console.log(`停止轨道: ${track.kind}`);
      track.stop();
    });
    currentStream.value = null;
  }

  // 问题在于 videoElement.value.pause()调用失败，因为
  // videoElement.value可能不是原生的 video 元素。在 uni-app 中，<video>组件被封装，我们需要使用 uni-app 的 API 来操作视频。

  // 清除视频源
  if (videoElement.value) {
    console.log('清除视频源');
    videoElement.value.srcObject = null;

    // 使用 uni-app 的 API 暂停视频
    try {
      const videoContext = uni.createVideoContext('scannerVideo', getCurrentInstance());
      videoContext.pause();
    } catch (e) {
      console.error('暂停视频失败:', e);
    }
  }

  // 停止扫描器
  scanning.value = false;

// 安全地停止扫描循环
  try {
    // 使用类型断言访问内部属性
    const reader = codeReader as any;

    // 如果ZXing库有reset方法，调用它
    if (reader && typeof reader.reset === 'function') {
      console.log('重置扫描器');
      reader.reset();
    }

    // 强制停止ZXing的扫描循环
    if (reader && reader._scan) {
      console.log('停止扫描循环');
      clearTimeout(reader._scan);
      reader._scan = null;
    }

    // 清除ZXing可能使用的canvas
    const canvasElements = document.querySelectorAll('canvas');
    canvasElements.forEach(canvas => {
      if (canvas.id.includes('zxing')) {
        console.log('移除ZXing canvas');
        canvas.remove();
      }
    });


    // 终极解决方案：清除所有ZXing相关的定时器
    // 获取所有活动定时器
    const timerIds = Object.keys(window);
    timerIds.forEach(id => {
      if (id.startsWith('zxing_')) {
        console.log(`清除ZXing定时器: ${id}`);
        clearTimeout(parseInt(id.replace('zxing_', '')));
      }
    });

    // 清除ZXing可能创建的所有事件监听器
    const events = ['loadedmetadata', 'timeout', 'error'];
    events.forEach(event => {
      if (videoElement.value) {
        videoElement.value.removeEventListener(event, () => {});
      }
    });

    // 完全销毁ZXing实例
    if (reader) {
      console.log('销毁ZXing实例');
      // 移除所有属性
      Object.keys(reader).forEach(key => {
        delete reader[key];
      });
    }

  } catch (e) {
    console.error('停止扫描时出错:', e);
  }

  console.log('扫描已完全停止');
};

// 停止扫描
const stop = () => {
  console.log('停止扫描器');
  stopStream();
  emit('close');
};

// 处理取消按钮点击
const handleCancel = () => {
  console.log('用户点击了取消按钮');
  stop(); // 停止扫描
  emit('cancel'); // 触发取消事件
};

// 用户点击屏幕（解决Safari播放问题）
const handleScreenClick = () => {
  if (isSafari() && showClickHint.value) {
    startScanning();
  }
};

// 手动输入
const showManualInput = () => {
  stop();
  uni.showModal({
    title: '手动输入条码',
    editable: true,
    placeholderText: '请输入条码内容',
    success: (res) => {
      if (res.confirm && res.content) {
        emit('decode', res.content);
      }
    }
  });
};

// 错误处理
const handleError = (error: unknown) => {
  console.error('摄像头访问失败:', error);
  let errorMessage = '无法访问摄像头';

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      errorMessage = '请允许摄像头权限';
    } else if (error.name === 'NotFoundError') {
      errorMessage = '未找到摄像头设备';
    } else if (error.name === 'NotReadableError') {
      errorMessage = '摄像头被占用';
    }
  }

  uni.showToast({
    title: errorMessage,
    icon: 'error'
  });

  // 如果是权限问题，显示额外提示
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    uni.showModal({
      title: '摄像头权限',
      content: '请在系统设置中允许访问摄像头',
      confirmText: '知道了',
      showCancel: false
    });
  }
};
</script>

<style scoped>
.scanner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.scanner-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  max-width: 300px;
  height: 200px;
  border: 2px solid #4CAF50;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.5);
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 4px;
  background-color: #4CAF50;
  animation: scanLine 3s infinite linear;
}

.scanner-instruction {
  position: absolute;
  bottom: 20%;
  left: 0;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 18px;
}

@keyframes scanLine {
  0% { top: 0; }
  100% { top: 100%; }
}

.scanner-controls {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 10001;
}

.scanner-controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.scanner-controls button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.camera-switch {
  background: linear-gradient(145deg, #2196F3, #0d8bf2);
  color: white;
}

.manual-input {
  background: linear-gradient(145deg, #FFC107, #ffb300);
  color: black;
}

.cancel-btn {
  background: linear-gradient(145deg, #f44336, #e53935);
  color: white;
}

.click-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  z-index: 10002;
  font-size: 18px;
  backdrop-filter: blur(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.device-list {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 10px;
  z-index: 10003;
  max-width: 300px;
  backdrop-filter: blur(5px);
}

.device-list p {
  margin-bottom: 10px;
  font-weight: bold;
}

.device-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.device-list li {
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.device-list li:hover {
  background: rgba(255, 255, 255, 0.1);
}

.device-list li.active {
  background: #2196F3;
  color: white;
}

/* 摄像头切换遮罩 */
.camera-switch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10002;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #fff;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.debug-tools {
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  z-index: 10004;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.debug-btn {
  position: fixed;
  /* bottom: 20px;*/
  top: 20px; /* 改为 top */
  right: 20px;
  padding: 8px 16px;
  background: #333;
  color: white;
  border-radius: 4px;
  z-index: 10003;
}

</style>
