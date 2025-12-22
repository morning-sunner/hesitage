// 长三角非遗平台 - 通用工具函数

// ========== URL 参数处理 ==========
export function getUrlParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

export function setUrlParam(name: string, value: string) {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.pushState({}, '', url)
}

export function navigateTo(path: string, params: Record<string, string | undefined> = {}) {
  const url = new URL(path, window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1))
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== undefined) {
      url.searchParams.set(key, value)
    }
  })
  window.location.href = url.toString()
}

// ========== 数字动画 ==========
export function animateNumber(element: HTMLElement, start: number, end: number, duration: number = 1000) {
  if (!element) return

  const range = end - start
  const increment = range / (duration / 16)
  let current = start

  const timer = setInterval(() => {
    current += increment
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end
      clearInterval(timer)
    }
    element.textContent = Math.floor(current).toString()
  }, 16)
}

// ========== 平滑滚动 ==========
export function smoothScrollTo(element: HTMLElement, offset: number = 0) {
  if (!element) return

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + offset
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  })
}

// ========== 防抖函数 ==========
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number = 300) {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ========== 节流函数 ==========
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number = 300) {
  let inThrottle = false
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ========== 淡入动画 ==========
export function fadeIn(element: HTMLElement, duration: number = 600) {
  if (!element) return

  element.style.opacity = '0'
  element.style.display = 'block'

  let opacity = 0
  const increment = 16 / duration

  const timer = setInterval(() => {
    opacity += increment
    if (opacity >= 1) {
      opacity = 1
      clearInterval(timer)
    }
    element.style.opacity = opacity.toString()
  }, 16)
}

// ========== 淡出动画 ==========
export function fadeOut(element: HTMLElement, duration: number = 600, callback?: () => void) {
  if (!element) return

  let opacity = 1
  const decrement = 16 / duration

  const timer = setInterval(() => {
    opacity -= decrement
    if (opacity <= 0) {
      opacity = 0
      element.style.display = 'none'
      clearInterval(timer)
      if (callback) callback()
    }
    element.style.opacity = opacity.toString()
  }, 16)
}

// ========== 加载图片（带错误处理） ==========
export function loadImage(src: string, onSuccess?: (img: HTMLImageElement) => void, onError?: () => void) {
  const img = new Image()
  img.onload = function () {
    if (onSuccess) onSuccess(img)
  }
  img.onerror = function () {
    console.error('图片加载失败:', src)
    if (onError) onError()
  }
  img.src = src
}

// ========== 格式化数字（添加千分位） ==========
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ========== 复制文本到剪贴板 ==========
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  } else {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textarea)
    } catch (err) {
      document.body.removeChild(textarea)
      throw err
    }
  }
}

// ========== 设备检测 ==========
export const deviceUtils = {
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  isTablet(): boolean {
    return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent)
  },

  isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet()
  }
}

// ========== 本地存储工具 ==========
export const storageUtils = {
  set(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('存储失败:', e)
      return false
    }
  },

  get<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      console.error('读取失败:', e)
      return defaultValue
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('删除失败:', e)
      return false
    }
  },

  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (e) {
      console.error('清空失败:', e)
      return false
    }
  }
}

// ========== 日期格式化 ==========
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// ========== 获取当前时间字符串 ==========
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// ========== 随机数生成 ==========
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ========== 数组打乱 ==========
export function shuffle<T>(array: T[]): T[] {
  const newArray: T[] = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = newArray[i]!
    newArray[i] = newArray[j]!
    newArray[j] = temp
  }
  return newArray
}

// ========== Toast 提示 ==========
export function showToast(message: string, duration: number = 3000) {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: slideDown 0.3s ease-out;
  `

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, duration)
}

// 添加必要的动画样式
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style')
  style.id = 'toast-styles'
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
    }
  `
  document.head.appendChild(style)
}

// ========== HTML 转义 ==========
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ========== 模态框控制 ==========
export const modalUtils = {
  show(modalElement: HTMLElement, overlayElement?: HTMLElement) {
    if (modalElement) {
      modalElement.classList.add('show')
      document.body.style.overflow = 'hidden'
    }
    if (overlayElement) {
      overlayElement.classList.add('show')
    }
  },

  hide(modalElement: HTMLElement, overlayElement?: HTMLElement) {
    if (modalElement) {
      modalElement.classList.remove('show')
      document.body.style.overflow = ''
    }
    if (overlayElement) {
      overlayElement.classList.remove('show')
    }
  }
}
