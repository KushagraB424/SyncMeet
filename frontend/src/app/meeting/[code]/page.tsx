"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Info, ShieldAlert, MoreVertical, MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMeeting, useEndMeeting } from "@/hooks/useMeetings"
import { toast } from "sonner"

export default function MeetingRoom() {
  const { code } = useParams() as { code: string }
  const router = useRouter()
  const { data: meeting, isLoading, isError } = useMeeting(code)
  const { mutate: endMeeting, isPending: isEnding } = useEndMeeting()
  const searchParams = useSearchParams()
  const userName = searchParams.get("name") || "Default User"
  const isHost = meeting?.host_name === userName
  
  const [isMuted, setIsMuted] = useState(true) // Defaulting to true to match screenshot
  const [isVideoOn, setIsVideoOn] = useState(false) // Defaulting to false to match screenshot
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const [removedParticipants, setRemovedParticipants] = useState<number[]>([])
  const [mutedParticipants, setMutedParticipants] = useState<number[]>([])
  const [hiddenVideoParticipants, setHiddenVideoParticipants] = useState<number[]>([])

  const [messages, setMessages] = useState([
    { sender: "Host", time: "10:00 AM", text: "Welcome to the meeting!" }
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`
    setMessages([...messages, { sender: "You", time: timeString, text: newMessage }])
    setNewMessage("")
  }

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants)
    if (!showParticipants) setShowChat(false)
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    if (!showChat) setShowParticipants(false)
  }

  const mockParticipants = [
    { id: 101, name: "Jane Doe", isHost: false },
    { id: 102, name: "John Smith", isHost: false },
    { id: 103, name: "Alice Johnson", isHost: false },
    ...(meeting?.participants || []).map(p => ({ id: p.id, name: p.participant_name, isHost: false }))
  ].filter(p => !removedParticipants.includes(p.id))

  const getAvatarUrl = (name: string) => {
    if (name === "Jane Doe") return "https://i.pravatar.cc/400?img=5";
    if (name === "John Smith") return "https://i.pravatar.cc/400?img=11";
    if (name === "Alice Johnson") return "https://i.pravatar.cc/400?img=9";
    return `https://i.pravatar.cc/400?u=${name}`;
  };

  const getInitialColor = (name: string) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600', 'bg-orange-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    if (isError) {
      toast.error("Meeting not found")
      router.push("/")
    }
  }, [isError, router])

  if (isLoading || !meeting) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-lg">Connecting to meeting...</p>
        </div>
      </div>
    )
  }

  const handleLeave = () => {
    toast("You left the meeting")
    router.push("/")
  }

  const handleEndMeeting = () => {
    if (!meeting) return
    endMeeting(meeting.id, {
      onSuccess: () => {
        toast.success("Meeting ended for all")
        router.push("/")
      }
    })
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${code}`)
    toast.success("Invite link copied")
  }

  return (
    <div className="flex h-screen flex-col bg-[#111111] text-white overflow-hidden">
      
      {/* Top Bar (Sync Style) */}
      <div className="flex h-10 items-center justify-between px-3 bg-[#1c1c1c] shrink-0 border-b border-black/50">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded bg-[#0b5cff] text-white">
            <span className="text-[8px] font-bold tracking-tighter leading-none mt-px">zm</span>
          </div>
          <span className="text-[11px] text-gray-200 font-semibold hidden sm:inline-block">Sync</span>
        </div>
        
        {/* Center: Info */}
        <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded text-gray-300 hover:text-white transition-colors" onClick={copyInviteLink}>
          <Info className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Copy invite link</span>
        </div>
        
        {/* Right: Badges */}
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center justify-center h-4 w-4 bg-green-500 rounded-full text-white">
            <ShieldAlert className="h-2.5 w-2.5" />
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex overflow-hidden relative bg-[#111111]">
        


        <div className={`flex-1 p-4 ${mockParticipants.length === 0 ? 'flex items-center justify-center' : 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr'}`}>
           {/* You */}
           <div className={`relative bg-black rounded-lg overflow-hidden flex items-center justify-center group ${mockParticipants.length === 0 ? 'h-[60vh] w-[80vw] max-w-4xl' : 'h-full w-full'}`}>
             {!isVideoOn ? (
               <div className="h-36 w-36 rounded-[28px] bg-[#d94a1a] flex items-center justify-center text-7xl font-normal text-white">
                 {userName.charAt(0).toUpperCase()}
               </div>
             ) : (
               <img src={getAvatarUrl(userName)} alt="You" className="h-full w-full object-cover" />
             )}
             <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded flex items-center gap-1.5">
               {isMuted && <MicOff className="h-3.5 w-3.5 text-red-500" />}
               <span className="text-xs font-medium text-gray-200">{userName}</span>
             </div>
           </div>

           {/* Others */}
           {mockParticipants.slice(0, 7).map((p, i) => (
             <div key={i} className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center group h-full w-full">
               {!hiddenVideoParticipants.includes(p.id) ? (
                 <img src={getAvatarUrl(p.name)} alt={p.name} className="h-full w-full object-cover" />
               ) : (
                 <div className={`h-36 w-36 rounded-[28px] ${getInitialColor(p.name)} flex items-center justify-center text-7xl font-normal text-white`}>
                   {p.name.charAt(0).toUpperCase()}
                 </div>
               )}
               <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded flex items-center gap-1.5">
                 {mutedParticipants.includes(p.id) && <MicOff className="h-3.5 w-3.5 text-red-500" />}
                 <span className="text-xs font-medium text-gray-200">{p.name}</span>
               </div>
             </div>
           ))}
        </div>
        
        {/* Sidebar (Participants) */}
        {showParticipants && (
          <div className="w-80 bg-[#1c1c1c] border-l border-white/10 h-full flex flex-col absolute right-0 top-0 md:relative text-white shadow-2xl z-10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Participants ({mockParticipants.length + 1})</h3>
              <X className="h-4 w-4 cursor-pointer hover:text-gray-400" onClick={toggleParticipants} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between p-3 hover:bg-white/5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{userName} (You)</span>
                  <span className="text-[10px] text-gray-400 mt-1">{isHost ? 'Host' : 'Guest'}</span>
                </div>
                <div className="flex gap-3 text-gray-400">
                  {isMuted ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                  {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {mockParticipants.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{p.name}</span>
                    {p.isHost && <span className="text-[10px] text-gray-400 mt-1">Host</span>}
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    {mutedParticipants.includes(p.id) ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                    {hiddenVideoParticipants.includes(p.id) ? <VideoOff className="h-4 w-4 text-red-500" /> : <Video className="h-4 w-4" />}
                    {isHost && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-5 w-5 hover:bg-white/10 rounded flex items-center justify-center outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-white/10 bg-[#2d2d2d] text-white">
                          <DropdownMenuItem onClick={() => {
                            if (mutedParticipants.includes(p.id)) {
                              setMutedParticipants(mutedParticipants.filter(id => id !== p.id))
                              toast(`Requested ${p.name} to unmute`)
                            } else {
                              setMutedParticipants([...mutedParticipants, p.id])
                              toast(`${p.name} was muted`)
                            }
                          }} className="hover:bg-blue-600 focus:bg-blue-600 focus:text-white">
                            {mutedParticipants.includes(p.id) ? "Ask to Unmute" : "Mute"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (hiddenVideoParticipants.includes(p.id)) {
                              setHiddenVideoParticipants(hiddenVideoParticipants.filter(id => id !== p.id))
                              toast(`Requested ${p.name} to start video`)
                            } else {
                              setHiddenVideoParticipants([...hiddenVideoParticipants, p.id])
                              toast(`${p.name}'s video was stopped`)
                            }
                          }} className="hover:bg-blue-600 focus:bg-blue-600 focus:text-white">
                            {hiddenVideoParticipants.includes(p.id) ? "Ask to Start Video" : "Stop Video"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setRemovedParticipants([...removedParticipants, p.id])
                            toast(`${p.name} was removed from the meeting`)
                          }} className="text-red-400 focus:bg-red-500 focus:text-white hover:bg-red-500 hover:text-white">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sidebar (Chat) */}
        {showChat && (
          <div className="w-80 bg-[#1c1c1c] border-l border-white/10 h-full flex flex-col absolute right-0 top-0 md:relative text-white shadow-2xl z-10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Meeting Chat</h3>
              <X className="h-4 w-4 cursor-pointer hover:text-gray-400" onClick={toggleChat} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold">{msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${msg.sender === "You" ? "bg-blue-600 text-white" : "bg-[#2d2d2d] text-gray-200"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls (Sync Style) */}
      <div className="h-[68px] bg-black flex items-center justify-between px-2 sm:px-4 shrink-0 border-t border-black pb-safe">
        
        {/* Left: Audio & Video */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center">
            <div className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white group transition-colors" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? (
                <div className="relative">
                  <MicOff className="h-[22px] w-[22px] text-red-500 mb-1" strokeWidth={1.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[26px] h-px bg-red-500 rotate-45"></div>
                  </div>
                </div>
              ) : (
                <Mic className="h-[22px] w-[22px] mb-1" strokeWidth={1.5} />
              )}
              <span className="text-[11px] font-medium leading-none tracking-tight">Audio</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white group transition-colors" onClick={() => setIsVideoOn(!isVideoOn)}>
              {!isVideoOn ? (
                <div className="relative">
                  <VideoOff className="h-[22px] w-[22px] text-red-500 mb-1" strokeWidth={1.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[26px] h-px bg-red-500 rotate-45"></div>
                  </div>
                </div>
              ) : (
                <Video className="h-[22px] w-[22px] mb-1" strokeWidth={1.5} />
              )}
              <span className="text-[11px] font-medium leading-none tracking-tight">Video</span>
            </div>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          
          <div className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white transition-colors" onClick={toggleParticipants}>
            <div className="relative mb-1">
              <Users className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-2 bg-gray-700 text-white text-[9px] font-bold px-1 rounded-full">{mockParticipants.length + 1}</span>
            </div>
            <span className="text-[11px] font-medium leading-none tracking-tight">Participants</span>
          </div>

          <div className="flex items-center">
            <div className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white transition-colors" onClick={toggleChat}>
              <MessageSquare className="h-5 w-5 mb-1" strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none tracking-tight">Chat</span>
            </div>
          </div>
        </div>

        {/* Right: End */}
        <div className="flex items-center pl-2 sm:pl-4 border-l border-gray-800 ml-1 sm:ml-2">
          <div className="flex flex-col items-center justify-center h-[52px] px-3 sm:px-4 rounded hover:bg-white/10 cursor-pointer text-red-500 hover:text-red-400 transition-colors" onClick={isHost ? handleEndMeeting : handleLeave}>
            <div className="flex items-center justify-center bg-[#b81d2f] text-white rounded p-0.5 mb-1">
              <X className="h-3.5 w-3.5" strokeWidth={3} />
            </div>
            <span className="text-[11px] font-bold leading-none tracking-tight">{isHost ? 'End' : 'Leave'}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
