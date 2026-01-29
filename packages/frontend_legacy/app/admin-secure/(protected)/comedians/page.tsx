
import ComedianUserManagement from "@/components/admin/ComedianUserManagement"

export default function AdminComediansPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Comedian Management</h1>
                    <p className="text-slate-500 mt-1">Review and verify comedian accounts</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ComedianUserManagement />
            </div>
        </div>
    )
}
