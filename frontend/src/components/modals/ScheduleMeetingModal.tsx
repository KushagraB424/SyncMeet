"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateMeeting } from "@/hooks/useMeetings"
import { toast } from "sonner"
import { X } from "lucide-react"

export function ScheduleMeetingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hostName, setHostName] = useState("Default User")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("30")
  
  const { mutate: createMeeting, isPending } = useCreateMeeting()

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !time) return
    
    // Create a naive local datetime string in ISO format for the backend
    const scheduledDateTime = new Date(`${date}T${time}:00`);
    
    if (scheduledDateTime < new Date()) {
      toast.error("Cannot schedule a meeting in the past");
      return;
    }
    
    const scheduledTime = scheduledDateTime.toISOString();

    createMeeting(
      { 
        title, 
        description: description || undefined,
        host_name: hostName, 
        scheduled_time: scheduledTime, 
        duration: parseInt(duration) 
      },
      {
        onSuccess: (data) => {
          toast.success("Meeting scheduled successfully!")
          onClose()
        },
        onError: () => {
          toast.error("Failed to schedule meeting")
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0 border-0 rounded-2xl shadow-2xl overflow-hidden bg-white text-slate-900 gap-0 [&>button]:hidden">
        
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

        <form onSubmit={handleSchedule} className="p-8 pt-6 flex flex-col gap-6">
          
          <h2 className="text-[24px] font-bold text-slate-900 mb-2">Schedule Meeting</h2>

          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="font-semibold text-slate-700">Topic</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My SyncMeet Meeting"
                className="h-10 px-4 rounded-lg bg-white border-gray-300 text-slate-900 text-[15px] focus-visible:ring-1 focus-visible:ring-[#0b5cff] focus-visible:border-transparent transition-all"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-semibold text-slate-700">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description or agenda..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-slate-900 text-[15px] focus:ring-1 focus:ring-[#0b5cff] focus:border-transparent outline-none transition-all resize-none placeholder:text-gray-400"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-semibold text-slate-700">Your Name (Host)</Label>
              <Input
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="h-10 px-4 rounded-lg bg-white border-gray-300 text-slate-900 text-[15px] focus-visible:ring-1 focus-visible:ring-[#0b5cff] focus-visible:border-transparent transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-semibold text-slate-700">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#0b5cff] focus-visible:border-transparent"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold text-slate-700">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#0b5cff] focus-visible:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-semibold text-slate-700">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-10 rounded-lg border-gray-300 w-[150px] focus-visible:ring-[#0b5cff] focus-visible:border-transparent"
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3 sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl h-10 px-6 border-gray-300 text-slate-700 font-medium shadow-none hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="rounded-xl h-10 px-8 bg-[#0b5cff] text-white font-medium hover:bg-blue-700 shadow-none"
            >
              {isPending ? "Scheduling..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
