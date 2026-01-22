
import { ShowManagement } from "@/components/admin/ShowManagement"

export default function AdminShowsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Show Management</h1>
                    <p className="text-slate-500 mt-1">Manage comedy shows and events</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ShowManagement />
            </div>
        </div>
    )
}
