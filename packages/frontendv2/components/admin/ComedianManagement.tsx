"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { User, Mail } from "lucide-react"

interface Comedian {
    id: string
    name: string
    bio?: string
    profileImageUrl?: string
    socialLinks?: any
    promoVideoUrl?: string
    createdAt: string
    creator: {
        email: string
        organizerProfile?: {
            name: string
        }
    }
    _count: {
        showComedians: number
    }
}

export default function ComedianManagement() {
    const [comedians, setComedians] = useState<Comedian[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchComedians()
    }, [])

    const fetchComedians = async () => {
        try {
            const data = await api.get<any>("/api/v1/admin/comedians")
            setComedians(data.comedians || [])
        } catch (error) {
            console.error("Failed to fetch comedians:", error)
            setError("Failed to load comedians")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="text-center py-8">Loading comedians...</div>
    }

    if (error) {
        return <div className="text-red-600">{error}</div>
    }

    return (
        <div className="space-y-6">
            {comedians.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-zinc-600">No comedians have been created yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-zinc-200">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Comedian
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Created By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Shows
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Created At
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-zinc-200">
                            {comedians.map((comedian) => (
                                <tr key={comedian.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {comedian.profileImageUrl ? (
                                                <img
                                                    src={comedian.profileImageUrl}
                                                    alt={comedian.name}
                                                    className="h-10 w-10 rounded-full mr-3 object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full mr-3 bg-zinc-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-zinc-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-zinc-900">
                                                    {comedian.name}
                                                </div>
                                                {comedian.bio && (
                                                    <div className="text-sm text-zinc-500 truncate max-w-xs">
                                                        {comedian.bio}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-zinc-900">
                                            {comedian.creator.organizerProfile?.name || comedian.creator.email}
                                        </div>
                                        <div className="text-sm text-zinc-500 flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {comedian.creator.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-zinc-900">
                                            {comedian._count.showComedians} show{comedian._count.showComedians !== 1 ? 's' : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                        {new Date(comedian.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
