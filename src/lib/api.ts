import axios, { AxiosInstance } from "axios";
import { loginService } from "@/service/LoginService";
import { VirtualUserManager } from "@/lib/virtualUser";
import { toast } from "sonner";

// 定义HTTP状态码常量
const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    TOKEN_EXPIRED: 402,
    INSUFFICIENT_CREDITS: 405,
} as const;

// 添加自定义错误类型
export class InsufficientCreditsError extends Error {
    constructor() {
        super("Insufficient credits");
        this.name = "InsufficientCreditsError";
    }
}

export class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");
        this.name = "UnauthorizedError";
    }
}

export class TokenExpiredError extends Error {
    constructor() {
        super("Token expired");
        this.name = "TokenExpiredError";
    }
}

// 创建一个函数来配置和返回 axios 实例
const createAPI = (): AxiosInstance => {
    const api = axios.create({
        // 添加默认配置
        headers: {
            "Content-Type": "application/json",
        },
    });

    // 请求拦截器
    api.interceptors.request.use(async (config) => {
        try {
            // 检查用户是否已登录
            if (loginService.isAuthenticated()) {
                // 已登录用户，添加 token
                const token = await loginService.getToken();
                if (token) {
                    config.headers = config.headers || {};
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
            } else {
                // 未登录用户，添加虚拟用户 ID
                const virtualUserId = VirtualUserManager.ensureVirtualUserId();
                if (virtualUserId) {
                    config.headers = config.headers || {};
                    config.headers["X-Virtual-User-ID"] = virtualUserId;
                    console.log(
                        "Virtual user ID set:",
                        config.headers["X-Virtual-User-ID"],
                    );
                }
            }
        } catch (error) {
            console.error("Error in request interceptor:", error);
        }
        return config;
    });

    // 响应拦截器
    api.interceptors.response.use(
        (response) => {
            // 对于检查未登录用户限制的接口，直接返回响应
            if (response.config.url?.includes('/check-unauth-story-limit')) {
                return response;
            }

            // 直接使用HTTP状态码处理
            switch (response.status) {
                case HTTP_STATUS.UNAUTHORIZED:
                    loginService.handleUnauthorized();
                    return Promise.reject(new UnauthorizedError());
                case HTTP_STATUS.TOKEN_EXPIRED:
                    toast.error("Session expired, refreshing...", {
                        duration: 3000,
                    });
                    return handleTokenExpired(response.config).catch(() => {
                        throw new TokenExpiredError();
                    });
                case HTTP_STATUS.INSUFFICIENT_CREDITS:
                    toast.error("You have insufficient credits.", {
                        action: {
                            label: "Purchase Credits",
                            onClick: () => (window.location.href = "/account"),
                        },
                        duration: 3000,
                    });
                    return Promise.reject(new InsufficientCreditsError());
            }

            // 其他情况直接返回响应
            return response;
        },
        async (error) => {
            // 只处理特定的 HTTP 状态码错误
            const status = error.response?.status;

            if (status === HTTP_STATUS.UNAUTHORIZED) {
                loginService.handleUnauthorized();
                return Promise.reject(new UnauthorizedError());
            } 
            
            if (status === HTTP_STATUS.TOKEN_EXPIRED) {
                toast.error("Session expired, refreshing...", {
                    duration: 3000,
                });
                return handleTokenExpired(error.config).catch(() => {
                    throw new TokenExpiredError();
                });
            }
            
            if (status === HTTP_STATUS.INSUFFICIENT_CREDITS) {
                toast.error("You have insufficient credits.", {
                    action: {
                        label: "Purchase Credits",
                        onClick: () => (window.location.href = "/account"),
                    },
                    duration: 3000,
                });
                return Promise.reject(new InsufficientCreditsError());
            }

            // 其他错误直接拒绝
            return Promise.reject(error);
        },
    );

    // 抽取 token 过期处理逻辑为单独的函数
    const handleTokenExpired = async (config: any) => {
        try {
            console.log("Handling token expired");
            const newToken = await loginService.handleTokenExpired();
            if (newToken) {
                // 使用新 token 重试原始请求
                const newConfig = { ...config };
                newConfig.headers = newConfig.headers || {};
                newConfig.headers.Authorization = `Bearer ${newToken}`;
                return api(newConfig);
            }
            // 如果获取新 token 失败，显示登录提示
            loginService.handleUnauthorized();
            return Promise.reject({
                response: {
                    status: HTTP_STATUS.UNAUTHORIZED,
                    statusText: "Token refresh failed",
                },
            });
        } catch (error) {
            console.error("Token refresh failed:", error);
            loginService.handleUnauthorized();
            return Promise.reject(error);
        }
    };

    return api;
};

// 导出 API 实例
const api = createAPI();
export default api;
