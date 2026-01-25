
import FeeManagement from "@/components/admin/FeeManagement"

export default function AdminFeesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
                    <p className="text-slate-500 mt-1">Configure booking fees and revenue settings</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <FeeManagement />
            </div>
        </div>
    )
}
