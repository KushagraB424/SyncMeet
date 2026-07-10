"use client"

import Link from "next/link"
import { Video, Bell, Calendar, Plus, MoreHorizontal } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white text-slate-900 h-14">
      <div className="px-4 flex h-14 items-center justify-between w-full">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0b5cff] text-white shadow-sm">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-[10px] font-bold tracking-widest text-[#0b5cff] leading-none mb-0.5">Sync</span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 leading-none">Workplace</span>
          </div>
        </Link>



        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-3 text-gray-600">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
            <Calendar className="h-5 w-5" />
          </button>
          <div className="h-5 w-px bg-gray-300 mx-1 hidden sm:block"></div>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white font-medium hover:brightness-110 transition-all ml-1">
            K
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
        
      </div>
    </header>
  )
}
