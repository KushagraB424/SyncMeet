import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { MoreHorizontal } from "lucide-react"

export default function MorePage() {
  return (
    <div className="flex flex-col h-screen bg-[#f7f9fa]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white p-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center mt-32">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <MoreHorizontal className="h-10 w-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">More Options</h1>
            <p className="text-slate-500 max-w-md">
              This page is a placeholder for the assignment requirements. Additional features like contacts, whiteboards, or apps would go here in a production application.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
