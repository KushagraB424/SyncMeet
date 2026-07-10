"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Video, X } from "lucide-react"
import { useJoinMeeting } from "@/hooks/useMeetings"
import { toast } from "sonner"

export function JoinMeetingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [meetingCode, setMeetingCode] = useState("")
  const [name, setName] = useState("Kushagra Gupta")
  const [noAudio, setNoAudio] = useState(false)
  const [noVideo, setNoVideo] = useState(false)
  const router = useRouter()
  const { mutate: joinMeeting, isPending } = useJoinMeeting()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingCode.trim()) return

    joinMeeting(
      { code: meetingCode, data: { participant_name: name } },
      {
        onSuccess: (data) => {
          toast.success("Joining meeting...")
          router.push(`/meeting/${data.meeting_code}?name=${encodeURIComponent(name)}`)
          onClose()
        },
        onError: () => {
          toast.error("Meeting not found or unable to join")
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 border-0 rounded-2xl shadow-2xl overflow-hidden bg-white text-slate-900 gap-0 [&>button]:hidden">
        
        {/* Custom Window Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-[#f4f5f7] border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b5cff] text-white">
              <span className="text-[9px] font-bold tracking-tighter">zm</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Sync</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleJoin} className="p-8 pt-6 flex flex-col gap-6">
          <DialogHeader className="text-left mb-2">
            <DialogTitle className="text-[28px] font-bold text-slate-900">Join meeting</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            {/* Meeting ID Input */}
            <div className="relative group">
              <Input
                id="meetingCode"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Meeting ID or personal link name"
                className="h-12 px-4 rounded-xl border-[#0b5cff] ring-1 ring-[#0b5cff] text-[15px] placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:border-transparent transition-all pr-10"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Name Input */}
            <div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="h-12 px-4 rounded-xl border-gray-300 text-[15px] placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400 transition-all"
                required
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="noAudio" 
                  checked={noAudio} 
                  onCheckedChange={(checked) => setNoAudio(checked as boolean)} 
                  className="rounded border-gray-300 data-[state=checked]:bg-[#0b5cff] data-[state=checked]:border-[#0b5cff]"
                />
                <label
                  htmlFor="noAudio"
                  className="text-[15px] text-slate-700 font-normal leading-none cursor-pointer"
                >
                  Don't connect to audio
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="noVideo" 
                  checked={noVideo} 
                  onCheckedChange={(checked) => setNoVideo(checked as boolean)} 
                  className="rounded border-gray-300 data-[state=checked]:bg-[#0b5cff] data-[state=checked]:border-[#0b5cff]"
                />
                <label
                  htmlFor="noVideo"
                  className="text-[15px] text-slate-700 font-normal leading-none cursor-pointer"
                >
                  Turn off my video
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 flex sm:justify-end gap-3 pb-2">
            <Button 
              type="submit" 
              disabled={isPending || !meetingCode.trim()} 
              className="rounded-xl h-10 px-8 bg-[#e2e8f0] text-gray-400 font-semibold hover:bg-gray-200 disabled:opacity-100 disabled:bg-[#e2e8f0] disabled:text-gray-400 data-[active=true]:bg-[#0b5cff] data-[active=true]:text-white shadow-none"
              data-active={!!meetingCode.trim()}
            >
              Join
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl h-10 px-8 border-gray-300 text-slate-700 font-medium shadow-none hover:bg-gray-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
