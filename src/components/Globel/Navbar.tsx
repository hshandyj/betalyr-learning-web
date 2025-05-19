"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import React, { useState, useEffect } from "react"
import { loginService } from "@/service/LoginService"
import { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Blog", href: "/blog" },
  { name: "Treehollow", href: "/treehollow" },
  { name: "Roadmap", href: "/roadmap" },
  { name: "Resources", href: "/resources" },
  { name: "Video", href: "/video" },
  { name: "Project", href: "/project" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // 检查用户登录状态
  useEffect(() => {
    setMounted(true)
    // 获取当前用户
    const currentUser = loginService.getCurrentUser()
    setUser(currentUser)

    // 使用 Firebase auth 监听认证状态变化
    const unsubscribe = auth.onAuthStateChanged((authUser: User | null) => {
      setUser(authUser)
    })

    return () => {
      // 清理监听器
      unsubscribe()
    }
  }, [])

  // 处理登出
  const handleSignOut = async () => {
    try {
      await loginService.signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  // 用户未登录显示登录按钮，已登录显示用户头像和下拉菜单
  const renderAuthButton = () => {
    if (!mounted) return null

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                <AvatarFallback>
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user.displayName && <p className="font-medium">{user.displayName}</p>}
                {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <Button variant="default" onClick={() => router.push("/login")}>
        Login
      </Button>
    )
  }

  // 渲染主题切换按钮
  const renderThemeButton = () => {
    // 在客户端渲染前返回一个占位按钮
    if (!mounted) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </Button>
      )
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </Button>
    )
  }

  return (
    <div className="fixed top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Button variant="link" asChild className="p-0 text-xl font-bold">
            <Link href="/">BetaLyrGD</Link>
          </Button>

          {/* 导航链接 */}
          <div className="flex items-center gap-2">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* 右侧工具栏 */}
        <div className="flex items-center gap-4">          
          {/* 主题切换按钮 */}
          {renderThemeButton()}

          {/* GitHub链接 */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <a
              href="https://github.com/hshandyj/betalyr-learning-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </Button>

          {/* 登录按钮/用户头像 */}
          {renderAuthButton()}
        </div>
      </div>
    </div>
  )
}
