import { getCurrentUser } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileEditForm from "@/components/profile/ProfileEditForm"

export default async function EditProfilePage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth/signin")
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            organizerProfile: true,
            comedianProfile: true,
        }
    })

    if (!fullUser) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Edit Profile</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Update your personal information and public profile</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <div className="p-8">
                        <ProfileEditForm user={fullUser as any} />
                    </div>
                </div>
            </main>
        </div>
    )
}
