import { getCurrent } from "@/features/auth/action"
import { SignUpCard } from "@/features/auth/components/sign-up-card"
import { redirect } from "next/navigation"

const SignUnPage = async () => {
    const user = await getCurrent()
    
    if (user) {
            redirect("/")
        }
        
    return (
        <div>
            <SignUpCard />
        </div>
    )
}

export default SignUnPage   