import { auth } from "@/lib/firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    OAuthProvider,
} from "firebase/auth";
import { VirtualUserManager } from "@/lib/virtualUser";
import api from "@/lib/api";
import { getApiUrl } from "@/config/getEnvConfig";
import { toast } from "sonner";

export class LoginService {
    private static instance: LoginService;
    private currentUser: User | null = null;
    private currentToken: string | null = null;

    private constructor() {
        // 监听认证状态变化
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.updateToken();
            } else {
                this.clearToken();
            }
        });
    }

    public static getInstance(): LoginService {
        if (!LoginService.instance) {
            LoginService.instance = new LoginService();
        }
        return LoginService.instance;
    }

    // 获取当前用户
    public getCurrentUser(): User | null {
        return this.currentUser;
    }

    // 检查是否已登录
    public isAuthenticated(): boolean {
        return !!this.currentUser;
    }

    // Google 登录
    public async signInWithGoogle(): Promise<User> {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await this.updateToken();
            await this.transferVirtualStories(result.user.uid);
            await this.handleSuccessfulLogin(result.user);
            return result.user;
        } catch (error) {
            console.error("Google sign in failed:", error);
            throw error;
        }
    }

    // 登出
    public async signOut(): Promise<void> {
        await signOut(auth);
        this.clearUserFromLocal();
        this.currentToken = null;
        window.location.href = "/";
    }

    // 获取新的 token
    public async getToken(forceRefresh = false): Promise<string | null> {
        try {
            if (!this.currentUser) {
                return null;
            }
            const token = await this.currentUser.getIdToken(forceRefresh);
            // 确保只在浏览器环境下操作 localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("authToken", token);
            }
            return token;
        } catch (error) {
            console.error("Get token failed:", error);
            throw error;
        }
    }

    // 更新存储的 token
    private async updateToken(): Promise<void> {
        try {
            this.currentToken = (await auth.currentUser?.getIdToken()) || null;
            if (auth.currentUser) {
                this.saveUserToLocal(auth.currentUser);
            }
        } catch (error) {
            console.error("Update token failed:", error);
            throw error;
        }
    }

    // 清除 token
    private clearToken(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
        }
    }

    // 处理 token 过期
    public async handleTokenExpired(): Promise<string | null> {
        try {
            return await this.getToken(true);
        } catch (error) {
            console.error("Handle token expired failed:", error);
            this.clearToken();
            window.location.href = "/login";
            return null;
        }
    }

    // 处理未授权
    public handleUnauthorized(): void {
        this.clearToken();
        toast.error("Please sign in to create more stories", {
            action: {
                label: "Sign in",
                onClick: () => {
                    window.location.href = "/login";
                },
            },
            duration: 5000,
        });
    }

    private async transferVirtualStories(userId: string) {
        console.log("Transferring stories for user ID:", userId);
        const virtualUserId = VirtualUserManager.getVirtualUserId();
        console.log("Virtual user ID:", virtualUserId);
        if (!virtualUserId) {
            return;
        }

        try {
            const response = await api.put(
                `${getApiUrl()}/update-stories-user`,
                {},
                {
                    headers: {
                        "X-Virtual-User-ID": virtualUserId,
                    },
                },
            );

            if (response.data.code === 200) {
                console.log(
                    `Transferred ${response.data.data.updated_count} stories to user ${userId}`,
                );
                VirtualUserManager.removeVirtualUserId();
            }
        } catch (error) {
            console.error("Failed to transfer virtual stories:", error);
        }
    }

    // 邮箱注册
    public async signUpWithEmail(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<User> {
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );

            // 更新用户档案
            await updateProfile(result.user, {
                displayName: `${firstName} ${lastName}`,
                // 设置头像为名字缩写
                photoURL: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`,
            });

            await this.updateToken();
            await this.transferVirtualStories(result.user.uid);
            await this.handleSuccessfulLogin(result.user);
            return result.user;
        } catch (error) {
            console.error("Email sign up failed:", error);
            throw error;
        }
    }

    // 邮箱登录
    public async signInWithEmail(
        email: string,
        password: string,
    ): Promise<User> {
        try {
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );
            await this.updateToken();
            await this.transferVirtualStories(result.user.uid);
            await this.handleSuccessfulLogin(result.user);
            return result.user;
        } catch (error) {
            console.error("Email sign in failed:", error);
            throw error;
        }
    }

    // 重置密码
    public async resetPassword(email: string): Promise<void> {
        try {
            // 直接尝试发送重置密码邮件
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error("Password reset failed:", error);
            // 如果是 Firebase 错误，保持原始错误
            if (error?.code) {
                throw error;
            }
            // 其他错误包装成统一格式
            throw {
                code: "auth/reset-failed",
                message: "Failed to reset password",
            };
        }
    }

    // Apple 登录
    public async signInWithApple(): Promise<User> {
        try {
            const provider = new OAuthProvider("apple.com");
            const result = await signInWithPopup(auth, provider);
            await this.updateToken();
            await this.transferVirtualStories(result.user.uid);
            await this.handleSuccessfulLogin(result.user);
            return result.user;
        } catch (error) {
            console.error("Apple sign in failed:", error);
            throw error;
        }
    }

    private saveUserToLocal(user: User) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("authToken", this.currentToken || "");
    }

    private clearUserFromLocal() {
        localStorage.removeItem("userData");
        localStorage.removeItem("authToken");
    }

    private async handleSuccessfulLogin(user: User) {
        // 清除虚拟用户ID
        VirtualUserManager.removeVirtualUserId();
    }
}

// 导出单例实例
export const loginService = LoginService.getInstance();
