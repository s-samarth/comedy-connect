
import CollectionManagement from "@/components/admin/CollectionManagement"

export default function AdminCollectionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Collections Console</h1>
                    <p className="text-slate-500 mt-1">Monitor revenue stream and platform take</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <CollectionManagement />
            </div>
        </div>
    )
}
