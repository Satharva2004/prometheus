import { UserProfile } from '@clerk/clerk-react'

const UserProfilePage = () => {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
            <UserProfile path="/profile" routing="path" />
        </div>
    )
}

export default UserProfilePage
