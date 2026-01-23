
import Link from 'next/link'

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome to the secure admin portal.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Comedian Management Card */}
                <Link href="/admin-secure/comedians" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
                        <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Comedian Management</h3>
                    <p className="text-slate-500 text-sm">Verify and manage comedian profiles.</p>
                </Link>

                {/* Organizers Card */}
                <Link href="/admin-secure/organizers" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Organizer Management</h3>
                    <p className="text-slate-500 text-sm">Review, approve, or reject show organizers.</p>
                </Link>

                {/* Shows Card */}
                <Link href="/admin-secure/shows" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Show Management</h3>
                    <p className="text-slate-500 text-sm">Oversee all comedy shows and performances.</p>
                </Link>

                {/* Fees Card */}
                <Link href="/admin-secure/fees" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Platform Settings</h3>
                    <p className="text-slate-500 text-sm">Configure booking fees and platform revenue.</p>
                </Link>
            </div>
        </div>
    )
}
