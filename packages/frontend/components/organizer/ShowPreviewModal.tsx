"use client"

import { useState } from "react"
import Image from "next/image"

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
    // data has: title, description, venue, date, ticketPrice, posterImageUrl, durationMinutes etc.

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-xl shadow-2xl relative min-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-sm"
                >
                    ✕
                </button>

                {/* Preview Content - Mimicking Show Details Page */}
                <div className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <div className="relative h-[400px] w-full bg-zinc-900">
                        {data.posterImageUrl ? (
                            <Image
                                src={data.posterImageUrl}
                                alt={data.title}
                                fill
                                className="object-cover opacity-50 blur-sm"
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />

                        <div className="absolute inset-0 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
                            <div className="flex flex-col md:flex-row gap-8 items-end">
                                {/* Poster Card */}
                                <div className="hidden md:block w-[240px] aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-zinc-800">
                                    {data.posterImageUrl ? (
                                        <Image
                                            src={data.posterImageUrl}
                                            alt={data.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                            No Poster
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="inline-block px-3 py-1 bg-purple-600 rounded-full text-xs font-medium text-white">
                                        Stand-up Comedy
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                        {data.title || "Untitled Show"}
                                    </h1>

                                    <div className="flex flex-wrap gap-4 text-sm bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 w-fit">
                                        <div className="flex items-center text-zinc-300">
                                            📅 {formatDate(data.date)}
                                        </div>
                                        <div className="flex items-center text-zinc-300">
                                            ⏰ {formatTime(data.date)}
                                        </div>
                                        <div className="flex items-center text-zinc-300">
                                            ⌛ {data.durationMinutes || 60} mins
                                        </div>
                                        <div className="flex items-center text-zinc-300">
                                            📍 {data.venue || "Venue TBD"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-2 space-y-12">
                                <section>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">About the Show</h2>
                                    <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
                                        {data.description || "No description provided."}
                                    </div>
                                </section>

                                {/* Lineup Preview (Static or based on data.comedianIds if we fetched them) */}
                                <section>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Performers</h2>
                                    <p className="text-zinc-500 italic">Preview limited: Comedian profiles will verify lineup.</p>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm sticky top-24">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Book Tickets</h3>
                                    <div className="text-3xl font-bold text-purple-600 mb-6">
                                        ₹{data.ticketPrice || 0}
                                    </div>
                                    <button disabled className="w-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 py-3 rounded-lg font-bold cursor-not-allowed">
                                        Preview Only
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
                    <button onClick={onClose} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-6 py-2 rounded-lg font-bold mr-2">
                        Close Preview
                    </button>
                    <button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold">
                        Looks Good
                    </button>
                </div>
            </div>
        </div>
    )
}
