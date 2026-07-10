"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, MoreHorizontal, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "More", href: "/more", icon: MoreHorizontal },
  { name: "Settings", href: "/settings", icon: Settings },
]

const desktopNavigation = navigation.filter(item => item.name !== "Settings")

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="flex h-full w-20 flex-col border-r border-gray-200 bg-[#f7f9fa] py-3 hidden md:flex text-slate-900 justify-between items-center">
        <nav className="space-y-1 w-full px-2 flex flex-col items-center">
          {desktopNavigation.map((item) => {
            const isActive = pathname === item.href || (item.name === "Home" && pathname === "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center justify-center rounded-xl w-16 h-16 text-[10px] font-medium transition-all relative",
                  isActive
                    ? "bg-white text-[#0b5cff] shadow-sm shadow-black/5"
                    : "text-slate-600 hover:bg-black/5"
                )}
              >
                <item.icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "h-5 w-5 mb-1 flex-shrink-0 transition-colors",
                    isActive ? "text-[#0b5cff]" : "text-slate-500 group-hover:text-slate-700"
                  )}
                  aria-hidden="true"
                />
                <span className={isActive ? "font-semibold text-[#0b5cff]" : ""}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
        
        <div className="w-full px-2 mb-2 flex flex-col items-center">
          <Link
            href="/settings"
            className={cn(
              "group flex flex-col items-center justify-center rounded-xl w-16 h-16 text-[10px] font-medium transition-all",
              pathname === "/settings"
                ? "bg-white text-[#0b5cff] shadow-sm shadow-black/5"
                : "text-slate-600 hover:bg-black/5"
            )}
          >
            <Settings
              strokeWidth={pathname === "/settings" ? 2.5 : 2}
              className={cn(
                "h-5 w-5 mb-1 transition-colors",
                pathname === "/settings" ? "text-[#0b5cff]" : "text-slate-500 group-hover:text-slate-700"
              )}
            />
            <span className={pathname === "/settings" ? "font-semibold text-[#0b5cff]" : ""}>Settings</span>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around bg-white border-t border-gray-200 h-16 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.name === "Home" && pathname === "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium transition-colors",
                isActive ? "text-[#0b5cff]" : "text-slate-500"
              )}
            >
              <item.icon
                strokeWidth={isActive ? 2.5 : 1.5}
                className={cn(
                  "h-5 w-5 mb-0.5 transition-colors",
                  isActive ? "text-[#0b5cff]" : "text-slate-400"
                )}
              />
              <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
