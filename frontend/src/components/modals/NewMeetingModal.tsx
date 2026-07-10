"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateMeeting } from "@/hooks/useMeetings"
import { toast } from "sonner"

export function NewMeetingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("Default User")
  const router = useRouter()
  const { mutate: createMeeting, isPending } = useCreateMeeting()

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createMeeting(
      { title: "Instant Meeting", host_name: name },
      {
        onSuccess: (data) => {
          toast.success("Meeting created!")
          router.push(`/meeting/${data.meeting_code}?name=${encodeURIComponent(name)}`)
          onClose()
        },
        onError: () => {
          toast.error("Failed to create meeting")
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleStart}>
          <DialogHeader>
            <DialogTitle>Start Instant Meeting</DialogTitle>
            <DialogDescription>
              Enter your name to start a new instant meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hostName">Your Name</Label>
              <Input
                id="hostName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isPending ? "Starting..." : "Start Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
