<template>
  <!-- 移除 v-if="show"，直接渲染 -->
  <div class="scanner-container">
    <!-- 添加v-if确保视频元素存在 -->
    <video
      v-if="videoReady"
      ref="videoElement"
      class="scanner-video"
      autoplay
      playsinline
    ></video>

    <div class="scanner-overlay">
      <div class="scanner-frame"></div>
      <div class="scanner-line"></div>
      <div class="scanner-instruction">将将二维码放入框内</div>
    </div>

    <div class="scanner-controls">
      <button @click="toggleCamera" class="camera-switch">
        <i class="switch-icon">↻</i> 切换摄像头
      </button>
      <button @click="showManualInput" class="manual-input">手动输入</button>
      <button @click="handleCancel" class="cancel-btn">取消</button>
    </div>

    <!-- 提示用户点击屏幕 -->
    <div v-if="showClickHint" class="click-hint">
      请点击屏幕开始扫描
    </div>

    <!-- 设备选择提示 -->
    <div v-if="showDeviceList" class="device-list">
      <p>选择摄像头:</p>
      <ul>
        <li
          v-for="(device, index) in devices"
          :key="device.deviceId"
          @click="selectDevice(index)"
          :class="{active: deviceIndex === index}"
        >
          {{ device.label || `摄像头 ${index + 1}` }}
        </li>
      </ul>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

// 修改 emit 定义，添加 'cancel' 事件
const emit = defineEmits(['decode', 'close', 'cancel']);


const videoElement = ref<HTMLVideoElement | null>(null);
const codeReader = new BrowserMultiFormatReader();
const showClickHint = ref(false);
const devices = ref<MediaDeviceInfo[]>([]);
const deviceIndex = ref(0);
const currentStream = ref<MediaStream | null>(null);
const showDeviceList = ref(false);
const scanning = ref(false);
const videoReady = ref(false); // 新增：控制视频元素渲染

// 检测 Safari 浏览器
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
};


onMounted(() => {
  console.log('BarcodeScanner组件已挂载');

  // 添加渲染日志
  const container = document.querySelector('.scanner-container');
  if (container) {
    console.log('扫描容器元素存在');
    console.log('容器位置:', container.getBoundingClientRect());
  } else {
    console.log('扫描容器元素不存在');
  }


  // 使用setTimeout确保初始化不阻塞渲染
  setTimeout(() => {
    initScanner();
  }, 100);

  // 添加点击事件监听
  document.addEventListener('click', handleScreenClick);

});

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('click', handleScreenClick);
  stop();
});

// 初始化扫描器
const initScanner = async () => {
  try {


    console.log('初始化扫描器');

    // 检查是否支持媒体设备
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('浏览器不支持摄像头访问');
    }

    // 获取摄像头设备列表
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    devices.value = allDevices.filter(device => device.kind === 'videoinput');

    if (devices.value.length === 0) {
      throw new Error('未找到摄像头设备');
    }

    console.log(`找到 ${devices.value.length} 个摄像头设备`);

    // 尝试查找后置摄像头
    const rearCameraIndex = devices.value.findIndex(device =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
    );

    // 设置当前设备
    deviceIndex.value = rearCameraIndex >= 0 ? rearCameraIndex : 0;

    console.log('使用摄像头:', devices.value[deviceIndex.value].label || `摄像头 ${deviceIndex.value + 1}`);


    // 设置视频元素可见
    // 确保视频元素已渲染
    videoReady.value = true;

    // 等待DOM更新
    await nextTick();

    // 添加延迟确保元素渲染
    await new Promise(resolve => setTimeout(resolve, 300));

    // 直接从DOM获取视频元素
    const videoElements = document.getElementsByClassName('scanner-video');
    if (videoElements.length === 0) {
      throw new Error('视频元素未创建');
    }

    const video = videoElements[0] as HTMLVideoElement;
    console.log('DOM中找到视频元素');

    // 更新ref
    videoElement.value = video;

    // 启动摄像头
    await startCamera();



  } catch (error) {
    console.error('初始化失败:', error);
    handleError(error);
  }
};

// 启动摄像头
const startCamera = async () => {
  try {

    console.log('启动摄像头...');

    const deviceId = devices.value[deviceIndex.value].deviceId;
    const constraints = deviceId ?
      { video: { deviceId: { exact: deviceId } } } :
      { video: true };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream.value = stream;
    console.log('获取到媒体流')


    // 等待视频元素渲染后再设置srcObject
    if (videoElement.value) {
      // 获取原生视频元素
      const nativeVideo = getNativeVideoElement();

      if (nativeVideo) {
        nativeVideo.srcObject = stream;
        console.log('视频源已设置到原生元素');

        // 等待视频元数据加载
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            console.log('视频元数据已加载');
            nativeVideo.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };

          nativeVideo.addEventListener('loadedmetadata', onLoaded);

          // 设置超时以防加载失败
          setTimeout(() => {
            console.log('视频加载超时，继续执行');
            nativeVideo.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          }, 2000);
        });

        console.log('视频准备就绪');

        // Safari需要用户交互才能播放视频
        if (isSafari()) {
          console.log('Safari浏览器，显示点击提示');
          showClickHint.value = true;
        } else {
          console.log('非Safari浏览器，直接开始扫描');
          startScanning();
        }
      } else {
        console.error('无法获取原生视频元素');
      }
    }
  } catch (error) {
    console.error('启动摄像头失败:', error);
    handleError(error);
  }
};

// 获取原生视频元素
const getNativeVideoElement = (): HTMLVideoElement | null => {
  if (!videoElement.value) return null;

  // 在 uni-app 中，自定义视频组件内部通常有一个真正的 <video> 元素
  const nativeVideo = videoElement.value.querySelector('video');
  if (nativeVideo) {
    return nativeVideo as HTMLVideoElement;
  }

  // 如果已经是原生 video 元素，直接返回
  if (videoElement.value.tagName === 'VIDEO') {
    return videoElement.value;
  }

  return null;
};

// 开始扫描
const startScanning = () => {

  // 获取原生视频元素
  const nativeVideo = getNativeVideoElement();
  if (!nativeVideo) {
    console.error('启动扫描失败: 视频元素不存在');
    return;
  }

  // 打印视频元素详细信息
  console.log('原生视频元素信息:', {
    tagName: nativeVideo.tagName,
    nodeType: nativeVideo.nodeType,
    constructor: nativeVideo.constructor.name,
    isConnected: document.body.contains(nativeVideo),
    srcObject: nativeVideo.srcObject,
    readyState: nativeVideo.readyState
  });

  try {

    console.log('开始扫描...');

    // 使用原生视频元素
    codeReader.decodeFromVideoElement(
      nativeVideo,
      (result, error) => {
        if (result) {
          console.log('扫描到结果:', result.getText());
          emit('decode', result.getText());
          stop();
        } else if (error && !error.message.includes('NotFoundException')) {
          console.error('扫描错误:', error);
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



// 切换摄像头
const toggleCamera = () => {
  if (devices.value.length <= 1) {
    uni.showToast({
      title: '只有一个摄像头',
      icon: 'none'
    });
    return;
  }

  // 切换到下一个摄像头
  deviceIndex.value = (deviceIndex.value + 1) % devices.value.length;
  startCamera();

  // 显示设备列表
  showDeviceList.value = true;
  setTimeout(() => {
    showDeviceList.value = false;
  }, 3000);
};

// 选择特定设备
const selectDevice = (index: number) => {
  deviceIndex.value = index;
  startCamera();
  showDeviceList.value = false;
};

// 停止流
const stopStream = () => {
  if (currentStream.value) {
    currentStream.value.getTracks().forEach(track => track.stop());
    currentStream.value = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  if ('reset' in codeReader && typeof codeReader.reset === 'function') {
    (codeReader as any).reset();
  }

  scanning.value = false;
};

// 停止扫描
const stop = () => {
  stopStream();
  emit('close');
};

// 处理取消按钮点击
const handleCancel = () => {
  console.log('用户点击了取消按钮');
  stop(); // 停止扫描
  emit('cancel'); // 新增：触发取消事件
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
</style>
