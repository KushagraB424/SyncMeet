"use client"
import { useState, useEffect } from "react"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { useRecentMeetings, useUpcomingMeetings } from "@/hooks/useMeetings"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function MeetingsPage() {
  const router = useRouter()
  const { data: upcomingMeetings } = useUpcomingMeetings()
  const { data: recentMeetings } = useRecentMeetings()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-slate-900 selection:bg-blue-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white flex flex-col items-center pt-10 px-4 pb-24 md:pb-20">
          <div className="w-full max-w-[700px] flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-slate-800">All Meetings</h1>
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-gray-200 pb-2 text-slate-800">
                <Calendar className="h-5 w-5 text-[#0b5cff]" />
                Upcoming
              </h2>
              
              <div className="border border-gray-200 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex flex-col relative min-h-[100px]">
                  {(!upcomingMeetings || upcomingMeetings.length === 0) ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-8">
                      <p className="text-slate-600 text-[15px] font-medium">No upcoming meetings.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {upcomingMeetings.map((m, i) => {
                        const st = m.scheduled_time ? new Date(m.scheduled_time) : null;
                        let isLive = false;
                        let isStartingSoon = false;
                        if (st) {
                          const diffMins = (st.getTime() - time.getTime()) / 60000;
                          isLive = diffMins <= 0 && diffMins > -30;
                          isStartingSoon = diffMins > 0 && diffMins <= 5;
                        }
                        
                        const isHighlighted = isLive || isStartingSoon;

                        return (
                          <div key={m.id} className={`flex items-stretch px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer ${i !== upcomingMeetings.length - 1 ? 'border-b border-gray-100' : ''} ${isHighlighted ? 'bg-blue-50/30' : ''}`} onClick={() => router.push(`/meeting/${m.meeting_code}?name=${encodeURIComponent(m.host_name || 'Host')}`)}>
                            <div className="flex flex-col w-36 flex-shrink-0 text-slate-800">
                              <span className={`font-semibold text-[15px] ${isHighlighted ? 'text-[#0b5cff]' : ''}`}>{st ? format(st, "MMM d, h:mm a") : "-"}</span>
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
                </div>
              </div>

              <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-gray-200 pb-2 text-slate-800 mt-8">
                <Clock className="h-5 w-5 text-[#0b5cff]" />
                History
              </h2>
              
              <div className="border border-gray-200 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex flex-col relative min-h-[100px]">
                  {(!recentMeetings || recentMeetings.length === 0) ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-8">
                      <p className="text-slate-600 text-[15px] font-medium">No meeting history.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {recentMeetings.map((m, i) => (
                        <div key={m.id} className={`flex items-stretch px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer ${i !== recentMeetings.length - 1 ? 'border-b border-gray-100' : ''}`} onClick={() => router.push(`/meeting/${m.meeting_code}?name=${encodeURIComponent(m.host_name || 'Host')}`)}>
                          <div className="flex flex-col w-36 flex-shrink-0 text-slate-800">
                            <span className="font-semibold text-[15px]">{format(new Date(m.created_at), "MMM d, h:mm a")}</span>
                          </div>
                          <div className="w-1 bg-gray-400 rounded-full mr-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex flex-col flex-1">
                            <span className="font-semibold text-[15px] text-slate-800 group-hover:text-gray-900 transition-colors">{m.title}</span>
                            {m.description && (
                              <span className="text-sm text-slate-400 mt-0.5 line-clamp-1">{m.description}</span>
                            )}
                            <span className="text-sm text-slate-500 mt-0.5">Meeting ID: {m.meeting_code}</span>
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" className="h-8 px-4 rounded-lg border-gray-300 text-slate-700">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
