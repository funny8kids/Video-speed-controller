let currentSpeed = 1.0;
const speedStep = 0.25;
const maxSpeed = 10.0;
const minSpeed = 0.5;

function findBilibiliVideo() {
    // 尝试多个可能的选择器
    const selectors = [
        '.bilibili-player-video video',
        '#bilibili-player video',
        '.bpx-player-video-wrap video',
        '.bpx-player video'
    ];
    
    for (let selector of selectors) {
        const video = document.querySelector(selector);
        if (video) return video;
    }
    return null;
}

function updateVideoSpeed(speed) {
    // 特别处理bilibili视频
    const bilibiliVideo = findBilibiliVideo();
    if (bilibiliVideo) {
        try {
            bilibiliVideo.playbackRate = speed;
            // 防止bilibili重置速度
            const observer = new MutationObserver((mutations) => {
                if (bilibiliVideo.playbackRate !== speed) {
                    bilibiliVideo.playbackRate = speed;
                }
            });
            observer.observe(bilibiliVideo, {
                attributes: true,
                attributeFilter: ['playbackRate']
            });
            return;
        } catch (e) {
            console.error('Error updating bilibili video speed:', e);
        }
    }

    // 处理其他视频
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        try {
            video.playbackRate = speed;
        } catch (e) {
            console.error('Error updating video speed:', e);
        }
    });
}

// 监听页面变化
const pageObserver = new MutationObserver((mutations) => {
    if (currentSpeed !== 1.0) {
        updateVideoSpeed(currentSpeed);
    }
});

// 开始观察整个文档
pageObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// 定期检查并更新速度（处理一些特殊情况）
setInterval(() => {
    if (currentSpeed !== 1.0) {
        updateVideoSpeed(currentSpeed);
    }
}, 1000);

// 消息监听部分保持不变
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case 'speedUp':
      currentSpeed = Math.min(currentSpeed + speedStep, maxSpeed);
      updateVideoSpeed(currentSpeed);
      sendResponse({ speed: currentSpeed });  // 添加响应
      break;
    case 'speedDown':
      currentSpeed = Math.max(currentSpeed - speedStep, minSpeed);
      updateVideoSpeed(currentSpeed);
      sendResponse({ speed: currentSpeed });  // 添加响应
      break;
    case 'resetSpeed':
      currentSpeed = 1.0;
      updateVideoSpeed(currentSpeed);
      sendResponse({ speed: currentSpeed });  // 添加响应
      break;
    case 'setSpeed':
      currentSpeed = request.value;
      updateVideoSpeed(currentSpeed);
      sendResponse({ speed: currentSpeed });  // 添加响应
      break;
    case 'getSpeed':
      sendResponse({ speed: currentSpeed });
      break;
  }
  return true;  // 保持消息通道开启
});