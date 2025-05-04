"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loginService } from "@/service/LoginService"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // 登录表单状态
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // 注册表单状态
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // 检查用户是否已登录
  useEffect(() => {
    if (loginService.isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  // 谷歌登录
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await loginService.signInWithGoogle()
      toast.success("登录成功")
      router.push("/")
    } catch (error: any) {
      console.error("Google登录失败:", error)
      toast.error(error.message || "Google登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 苹果登录
  const handleAppleSignIn = async () => {
    setIsLoading(true)
    try {
      await loginService.signInWithApple()
      toast.success("登录成功")
      router.push("/")
    } catch (error: any) {
      console.error("Apple登录失败:", error)
      toast.error(error.message || "Apple登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 邮箱登录
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("请填写邮箱和密码")
      return
    }

    setIsLoading(true)
    try {
      await loginService.signInWithEmail(email, password)
      toast.success("登录成功")
      router.push("/")
    } catch (error: any) {
      console.error("登录失败:", error)
      let errorMessage = "登录失败，请检查邮箱和密码"
      
      // 处理常见的Firebase错误
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "邮箱或密码错误"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "邮箱格式不正确"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "登录尝试次数过多，请稍后再试"
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 邮箱注册
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (!registerEmail || !registerPassword || !confirmPassword || !firstName || !lastName) {
      toast.error("请填写所有必填字段")
      return
    }
    
    if (registerPassword.length < 6) {
      toast.error("密码长度至少为6位")
      return
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    setIsLoading(true)
    try {
      await loginService.signUpWithEmail(registerEmail, registerPassword, firstName, lastName)
      toast.success("注册成功")
      router.push("/")
    } catch (error: any) {
      console.error("注册失败:", error)
      let errorMessage = "注册失败，请重试"
      
      // 处理常见的Firebase错误
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "该邮箱已被注册"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "邮箱格式不正确"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "密码强度太弱"
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 发送密码重置邮件
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("请输入邮箱地址")
      return
    }

    setIsLoading(true)
    try {
      await loginService.resetPassword(email)
      toast.success("密码重置邮件已发送，请查收")
    } catch (error: any) {
      console.error("发送重置邮件失败:", error)
      let errorMessage = "发送重置邮件失败"
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "未找到该邮箱对应的账户"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "邮箱格式不正确"
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">欢迎回来</h1>
          <p className="mt-2 text-muted-foreground">
            请登录您的账户或创建新账户
          </p>
        </div>

        <div className="space-y-4">
          {/* 社交登录按钮 */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              使用Google账号登录
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleAppleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
              </svg>
              使用Apple账号登录
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或者使用邮箱
              </span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            {/* 登录表单 */}
            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密码</Label>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      忘记密码?
                    </button>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="密码" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "登录中..." : "登录"}
                </Button>
              </form>
            </TabsContent>
            
            {/* 注册表单 */}
            <TabsContent value="register">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">名</Label>
                    <Input 
                      id="firstName" 
                      placeholder="名" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">姓</Label>
                    <Input 
                      id="lastName" 
                      placeholder="姓" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">邮箱</Label>
                  <Input 
                    id="registerEmail" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">密码</Label>
                  <Input 
                    id="registerPassword" 
                    type="password"
                    placeholder="至少6位密码" 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    placeholder="确认密码" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "注册中..." : "注册"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
} 