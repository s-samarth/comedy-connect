
import OrganizerManagement from "@/components/admin/OrganizerManagement"

export default function AdminOrganizersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Organizer Management</h1>
                    <p className="text-slate-500 mt-1">Review and manage organizer accounts</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <OrganizerManagement />
            </div>
        </div>
    )
}
