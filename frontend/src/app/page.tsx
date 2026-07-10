"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Video, Plus, Calendar, ArrowUpSquare, FileText, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Copy, Info, X } from "lucide-react"
import { format, isSameDay, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { JoinMeetingModal } from "@/components/modals/JoinMeetingModal"
import { ScheduleMeetingModal } from "@/components/modals/ScheduleMeetingModal"
import { NewMeetingModal } from "@/components/modals/NewMeetingModal"
import { useRecentMeetings, useUpcomingMeetings } from "@/hooks/useMeetings"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const { data: upcomingMeetings } = useUpcomingMeetings()

  const todaysMeetings = upcomingMeetings?.filter(m => {
    if (!m.scheduled_time) return false;
    return isSameDay(new Date(m.scheduled_time), selectedDate);
  }) || [];

  const getDayLabel = (date: Date) => {
    if (isSameDay(date, new Date())) return "Today";
    if (isSameDay(date, addDays(new Date(), 1))) return "Tomorrow";
    if (isSameDay(date, addDays(new Date(), -1))) return "Yesterday";
    return format(date, "EEEE");
  }

  const notifiedMeetings = useRef<Set<number>>(new Set())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!upcomingMeetings) return;
    const now = new Date();
    
    upcomingMeetings.forEach(m => {
      if (!m.scheduled_time) return;
      const st = new Date(m.scheduled_time);
      const diff = st.getTime() - now.getTime();
      
      // Check if it's within the 30 minute ongoing window
      if (diff <= 0 && diff > -30 * 60 * 1000) {
        if (!notifiedMeetings.current.has(m.id)) {
          notifiedMeetings.current.add(m.id);
          toast(`Your meeting '${m.title}' is starting now!`, {
            action: {
              label: 'Join Now',
              onClick: () => router.push(`/meeting/${m.meeting_code}?name=${encodeURIComponent(m.host_name || 'Host')}`)
            },
            duration: 10000,
          });
        }
      }
    });
  }, [time, upcomingMeetings, router])

  const handleInstantMeeting = () => {
    setIsNewModalOpen(true)
  }

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-slate-900 selection:bg-blue-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-white flex flex-col items-center pt-10 px-4 pb-24 md:pb-20">
          
          {/* Time & Date Header */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-5xl font-bold tracking-tight text-slate-800 tabular-nums">
              {format(time, "HH:mm")}
            </h1>
            <p className="text-lg text-slate-500 mt-2 font-medium">
              {format(time, "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
            {/* New Meeting */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={handleInstantMeeting}>
              <div className="h-[72px] w-[72px] rounded-[24px] bg-[#f26d21] flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                <Video strokeWidth={2.5} size={32} />
              </div>
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                New meeting <ChevronDown size={14} className="text-slate-400" />
              </span>
            </div>

            {/* Join */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setIsJoinOpen(true)}>
              <div className="h-[72px] w-[72px] rounded-[24px] bg-[#0b5cff] flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                <Plus strokeWidth={3} size={36} />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                Join
              </span>
            </div>

            {/* Schedule */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setIsScheduleOpen(true)}>
              <div className="h-[72px] w-[72px] rounded-[24px] bg-[#0b5cff] flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                <Calendar strokeWidth={2.5} size={30} className="mb-1" />
                {/* little date badge hack for visual fidelity */}
                <span className="absolute text-[11px] font-bold mt-1.5">{format(time, "d")}</span>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                Schedule
              </span>
            </div>
          </div>

          {/* Main Card Area */}
          <div className="w-full max-w-[700px] flex flex-col gap-3">
            
            <div className="border border-gray-200 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-center px-4 py-3 border-b border-gray-100">
                <div className="font-bold text-slate-800 text-sm">
                  {getDayLabel(selectedDate)}, {format(selectedDate, "MMM d")}
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedDate(new Date())} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-gray-50">
                    <Calendar className="h-3.5 w-3.5" />
                    Today
                  </button>
                  <button onClick={() => setSelectedDate(prev => addDays(prev, -1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-slate-500"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-slate-500"><ChevronRight className="h-4 w-4" /></button>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-slate-500"><MoreHorizontal className="h-4 w-4" /></button>
              </div>

              {/* Card Body */}
              <div className="min-h-[300px] flex flex-col relative">
                {todaysMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-12">
                    <div className="mb-4">
                      {/* Simple SVG representation of the beach umbrella empty state */}
                      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="80" cy="100" rx="40" ry="10" fill="#f0f2f5" />
                        <path d="M78 50 L75 100 L77 100 L80 50 Z" fill="#d1d5db" />
                        <path d="M50 50 Q80 20 110 50 Z" fill="#a5b4fc" />
                        <path d="M60 50 Q80 30 100 50 Z" fill="#c7d2fe" />
                      </svg>
                    </div>
                    <p className="text-slate-600 text-[15px] mb-2 font-medium">No meetings scheduled.</p>
                    <button 
                      onClick={() => setIsScheduleOpen(true)}
                      className="flex items-center gap-1 text-[#0b5cff] text-sm hover:underline font-medium"
                    >
                      <Plus className="h-4 w-4" /> Schedule a meeting
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {todaysMeetings.map((m, i) => {
                      const st = m.scheduled_time ? new Date(m.scheduled_time) : null
                      let isLive = false;
                      let isStartingSoon = false;
                      if (st) {
                        const diffMins = (st.getTime() - time.getTime()) / 60000;
                        isLive = diffMins <= 0 && diffMins > -30;
                        isStartingSoon = diffMins > 0 && diffMins <= 5;
                      }
                      
                      const isHighlighted = isLive || isStartingSoon;

                      return (
                        <div key={m.id} className={`flex items-stretch px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer ${i !== todaysMeetings.length - 1 ? 'border-b border-gray-100' : ''} ${isHighlighted ? 'bg-blue-50/30' : ''}`} onClick={() => router.push(`/meeting/${m.meeting_code}?name=${encodeURIComponent(m.host_name || 'Host')}`)}>
                          <div className="flex flex-col w-20 flex-shrink-0 text-slate-800">
                            <span className={`font-semibold text-[15px] ${isHighlighted ? 'text-[#0b5cff]' : ''}`}>{st ? format(st, "HH:mm") : "-"}</span>
                          </div>
                          <div className={`w-1 rounded-full mr-4 transition-opacity ${isLive ? 'bg-red-500 opacity-100' : isStartingSoon ? 'bg-green-500 opacity-100' : 'bg-[#0b5cff] opacity-50 group-hover:opacity-100'}`}></div>
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[15px] text-slate-800 group-hover:text-[#0b5cff] transition-colors">{m.title}</span>
                              {isLive && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">LIVE</span>
                              )}
                              {isStartingSoon && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 animate-pulse">STARTING SOON</span>
                              )}
                            </div>
                            {m.description && (
                              <span className="text-sm text-slate-400 mt-0.5 line-clamp-1">{m.description}</span>
                            )}
                            <span className="text-sm text-slate-500 mt-0.5">Meeting ID: {m.meeting_code}</span>
                          </div>
                          <div className={`flex items-center transition-opacity ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <Button className={`${isLive ? 'bg-red-600 hover:bg-red-700' : isStartingSoon ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0b5cff] hover:bg-blue-700'} text-white shadow-none h-8 px-4 rounded-lg`}>
                              {isHighlighted ? 'Join Now' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {/* Scrollbar filler from screenshot */}
                <div className="absolute right-1 top-2 bottom-2 w-1.5 bg-gray-300 rounded-full"></div>
              </div>


            </div>
          </div>

        </main>
      </div>

      <JoinMeetingModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      <ScheduleMeetingModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      <NewMeetingModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
    </div>
  )
}
