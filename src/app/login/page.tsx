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
      toast.success("Login successful")
      router.push("/")
    } catch (error: any) {
      console.error("Google login failed:", error)
      toast.error(error.message || "Google login failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  // 苹果登录
  const handleAppleSignIn = async () => {
    setIsLoading(true)
    try {
      await loginService.signInWithApple()
      toast.success("Login successful")
      router.push("/")
    } catch (error: any) {
      console.error("Apple login failed:", error)
      toast.error(error.message || "Apple login failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  // 邮箱登录
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in your email and password")
      return
    }

    setIsLoading(true)
    try {
      await loginService.signInWithEmail(email, password)
      toast.success("Login successful")
      router.push("/")
    } catch (error: any) {
      console.error("Login failed:", error)
      let errorMessage = "Login failed, please check your email and password"
      
      // 处理常见的Firebase错误
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Email or password is incorrect"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email format is incorrect"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many login attempts, please try again later"
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
      toast.error("Please fill in all required fields")
      return
    }
    
    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 digits")
      return
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("The passwords entered twice do not match")
      return
    }

    setIsLoading(true)
    try {
      await loginService.signUpWithEmail(registerEmail, registerPassword, firstName, lastName)
      toast.success("Registration successful")
      router.push("/")
    } catch (error: any) {
      console.error("Registration failed:", error)
      let errorMessage = "Registration failed, please try again"
      
      // 处理常见的Firebase错误
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email has already been registered"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email format is incorrect"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password strength is too weak"
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 发送密码重置邮件
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      await loginService.resetPassword(email)
      toast.success("Password reset email has been sent, please check your email")
    } catch (error: any) {
      console.error("Failed to send reset email:", error)
      let errorMessage = "Failed to send reset email"
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "Account not found for this email"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email format is incorrect"
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
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Please login to your account or create a new account
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
              Login with Google account
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
              Login with Apple account
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use email
              </span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* 登录表单 */}
            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="password">Password</Label>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Password" 
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
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            {/* 注册表单 */}
            <TabsContent value="register">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="First Name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Last Name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
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
                  <Label htmlFor="registerPassword">Password</Label>
                  <Input 
                    id="registerPassword" 
                    type="password"
                    placeholder="At least 6 digits" 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    placeholder="Confirm password" 
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
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    </div>
  )
} 