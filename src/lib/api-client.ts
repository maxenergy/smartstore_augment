/**
 * API 客户端配置
 * 封装 axios 实例，配置请求和响应拦截器
 */

import axios, { AxiosError } from "axios";

/**
 * 创建 axios 实例
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30秒超时
});

/**
 * 请求拦截器
 * 在请求发送前添加认证信息等
 */
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    // const token = getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
apiClient.interceptors.response.use(
  (response) => {
    // 返回响应数据
    return response.data;
  },
  (error: AxiosError) => {
    // 处理错误响应
    if (error.response) {
      const status = error.response.status;

      // 401 未授权 - 跳转到登录页
      if (status === 401) {
        // 清除本地存储的认证信息
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          window.location.href = "/auth/signin";
        }
      }

      // 403 禁止访问
      if (status === 403) {
        console.error("无权访问此资源");
      }

      // 404 未找到
      if (status === 404) {
        console.error("请求的资源不存在");
      }

      // 500 服务器错误
      if (status >= 500) {
        console.error("服务器错误，请稍后重试");
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error("网络错误，请检查网络连接");
    } else {
      // 其他错误
      console.error("请求失败:", error.message);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
