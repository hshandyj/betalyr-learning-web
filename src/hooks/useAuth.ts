import { useState, useEffect } from 'react';
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { VirtualUserManager } from "@/lib/virtualUser";

/**
 * 用于检查用户登录状态的钩子
 * 基于现有的LoginService实现
 * 增加ready状态确保登录状态完全初始化后再发送请求
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [isVirtualUser, setIsVirtualUser] = useState<boolean>(false);

  useEffect(() => {
    // 在客户端检查登录状态
    if (typeof window === 'undefined') {
      return;
    }

    let authInitialized = false;

    // 使用Firebase Auth直接监听认证状态
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      authInitialized = true;
      
      if (currentUser) {
        // 如果有登录用户，删除虚拟用户ID
        VirtualUserManager.removeVirtualUserId();
        setIsVirtualUser(false);
        
        setIsAuthenticated(true);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        // 如果Firebase没有认证用户，尝试从localStorage恢复
        try {
          const token = localStorage.getItem('authToken');
          const userDataStr = localStorage.getItem('userData');
          
          if (token && userDataStr) {
            const userData = JSON.parse(userDataStr);
            setIsAuthenticated(true);
            setUser(userData);
            setIsVirtualUser(false);
          } else {
            // 没有认证用户，使用虚拟用户ID
            const virtualUserId = VirtualUserManager.ensureVirtualUserId();
            setIsAuthenticated(false);
            setUser(null);
            setIsVirtualUser(!!virtualUserId);
          }
        } catch (error) {
          console.error('验证本地登录状态失败:', error);
          setIsAuthenticated(false);
          setUser(null);
          
          // 没有认证用户，使用虚拟用户ID
          const virtualUserId = VirtualUserManager.ensureVirtualUserId();
          setIsVirtualUser(!!virtualUserId);
        }
      }
      
      // 无论如何认证状态都已确定，设置loading为false
      setIsLoading(false);
      // 标记认证初始化已完成，可以开始依赖于认证状态的操作
      setReady(true);
    });

    // 如果onAuthStateChanged没有立即触发，设置一个超时
    const timeoutId = setTimeout(() => {
      if (!authInitialized) {
        console.log('认证状态初始化超时，尝试从本地恢复');
        setIsLoading(false);
        setReady(true);
      }
    }, 2000);

    // 清理函数
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    isAuthenticated, 
    isLoading,
    user,
    ready, // 认证状态已完全初始化
    isVirtualUser // 是否使用虚拟用户ID
  };
} 