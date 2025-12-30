/**
 * API 调用服务
 * 与后端 Express 服务器通信
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// 响应类型定义
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 通用 API 方法
 */
export const api = {
  /**
   * 发送 GET 请求
   */
  get: async <T = any>(url: string, options?: any): Promise<ApiResponse<T>> => {
    const fullUrl = new URL(`${API_BASE}${url}`)
    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        fullUrl.searchParams.append(key, options.params[key])
      })
    }
    const res = await fetch(fullUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return res.json()
  },

  /**
   * 发送 POST 请求
   */
  post: async <T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
    return res.json()
  },

  /**
   * 发送 PUT 请求
   */
  put: async <T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
    return res.json()
  },

  /**
   * 发送 DELETE 请求
   */
  delete: async <T = any>(url: string, options?: any): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    return res.json()
  },
}

/**
 * 用户认证 API
 */
export const authApi = {
  /**
   * 发送验证码
   */
  sendCode: async (email: string, type: 'register' | 'reset_password') => {
    const res = await fetch(`${API_BASE}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },

  /**
   * 用户注册
   */
  register: async (username: string, email: string, password: string, confirmPassword: string, code: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, confirmPassword, code }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },

  /**
   * 用户登录
   */
  login: async (account: string, password: string, rememberMe: boolean) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password, rememberMe }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },

  /**
   * 自动登录（使用记住我token）
   */
  autoLogin: async (rememberToken: string) => {
    const res = await fetch(`${API_BASE}/auth/auto-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rememberToken }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },

  /**
   * 请求重置密码
   */
  requestResetPassword: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/request-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },

  /**
   * 重置密码
   */
  resetPassword: async (email: string, code: string, newPassword: string, confirmPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, confirmPassword }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },

  /**
   * 验证 Token
   */
  verifyToken: async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    return res.json() as Promise<ApiResponse<any>>
  },
}

/**
 * 非遗项目 API
 */
export const heritageApi = {
  /**
   * 获取所有非遗项目
   */
  getAll: async () => {
    const res = await fetch(`${API_BASE}/heritage`)
    return res.json() as Promise<ApiResponse<HeritageItem[]>>
  },

  /**
   * 获取单个项目详情
   */
  getById: async (id: number) => {
    const res = await fetch(`${API_BASE}/heritage/${id}`)
    return res.json() as Promise<ApiResponse<HeritageItem>>
  },

  /**
   * 搜索项目
   */
  search: async (query: {
    province?: string
    city?: string
    category?: string
    keyword?: string
  }) => {
    const res = await fetch(`${API_BASE}/heritage/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    return res.json() as Promise<ApiResponse<HeritageItem[]>>
  },
}

/**
 * 空间查询 API
 */
export const spatialApi = {
  /**
   * 点查询 - 查询点击位置附近的项目
   */
  pointQuery: async (lng: number, lat: number, radius: number = 0.05) => {
    const res = await fetch(`${API_BASE}/spatial/point-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lng, lat, radius }),
    })
    return res.json() as Promise<ApiResponse<HeritageItem[]>>
  },

  /**
   * 缓冲区查询 - 圆形查询
   */
  bufferQuery: async (lng: number, lat: number, radius: number = 0.1) => {
    const res = await fetch(`${API_BASE}/spatial/buffer-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lng, lat, radius }),
    })
    return res.json() as Promise<ApiResponse<HeritageItem[]>>
  },

  /**
   * 区域内查询
   */
  withinRegion: async (province?: string, city?: string) => {
    const res = await fetch(`${API_BASE}/spatial/within-region`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ province, city }),
    })
    return res.json() as Promise<ApiResponse<HeritageItem[]>>
  },
}

/**
 * 统计分析 API
 */
export const statisticsApi = {
  /**
   * 获取总体统计信息
   */
  getOverall: async () => {
    const res = await fetch(`${API_BASE}/statistics`)
    return res.json() as Promise<ApiResponse<StatisticsOverall>>
  },

  /**
   * 按分类统计
   */
  byCategory: async () => {
    const res = await fetch(`${API_BASE}/statistics/by-category`)
    return res.json() as Promise<ApiResponse<CategoryStats[]>>
  },

  /**
   * 按地区统计
   */
  byRegion: async () => {
    const res = await fetch(`${API_BASE}/statistics/by-region`)
    return res.json() as Promise<ApiResponse<RegionStats[]>>
  },

  /**
   * 按省份统计
   */
  byProvince: async () => {
    const res = await fetch(`${API_BASE}/statistics/by-province`)
    return res.json() as Promise<ApiResponse<ProvinceStats[]>>
  },
}

// 类型定义
interface HeritageItem {
  id: number
  name: string
  category: string
  location: string
  description?: string
  province: string
  city: string
  lng: number
  lat: number
}

interface StatisticsOverall {
  total: number
  categoriesCount: number
  provincesCount: number
  citiesCount: number
}

interface CategoryStats {
  category: string
  count: number
}

interface RegionStats {
  province: string
  city: string
  count: number
}

interface ProvinceStats {
  province: string
  count: number
}

// 默认导出所有 API
export default {
  authApi,
  heritageApi,
  spatialApi,
  statisticsApi,
}
