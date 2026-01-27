"use client"

import { useState } from "react"
import Image from "next/image"
import ShowDetail from "@/components/shows/ShowDetail"

interface ShowPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    data: any // Using specific type if available, checking usage context
}

export default function ShowPreviewModal({ isOpen, onClose, data }: ShowPreviewModalProps) {
    if (!isOpen) return null

    const formatDate = (date: string | Date) => {
        if (!date) return "Date TBD"
        return new Date(date).toLocaleDateString("en-IN", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    }

    const formatTime = (date: string | Date) => {
        if (!date) return "Time TBD"
        return new Date(date).toLocaleTimeString("en-IN", { hour: 'numeric', minute: '2-digit' })
    }

    // Mock data based on form inputs "data"
    // We need to construct a Show object that matches what ShowDetail expects
    const previewShow = {
        ...data,
        id: "preview-id",
        date: data.date ? new Date(data.date) : new Date(),
        // Mock creator if not present (assuming current user is creator/organizer)
        creator: {
            id: "current-user",
            name: "Organizer (You)",
            role: "ORGANIZER_VERIFIED"
        },
        // Mock comedians if not present
        showComedians: [],
        _count: { bookings: 0 },
        // Ensure arrays exist
        youtubeUrls: data.youtubeUrls || [],
        instagramUrls: data.instagramUrls || []
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 p-2 rounded-full text-white backdrop-blur-sm transition-colors"
                >
                    ✕
                </button>

                {/* Preview Content - Using shared component */}
                <div className="flex-1 overflow-y-auto bg-zinc-50 relative">
                    <div className="sticky top-0 left-0 w-full bg-purple-600 text-white text-center text-sm font-bold py-1 z-40 shadow-md">
                        PREVIEW MODE
                    </div>
                    <ShowDetail
                        show={previewShow}
                        isPreview={true}
                    />
                </div>

                <div className="p-4 border-t border-zinc-200 bg-white flex justify-end gap-3 z-50">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
                        Close Preview
                    </button>
                    <button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all hover:scale-105">
                        Looks Good
                    </button>
                </div>
            </div>
        </div>
    )
}
