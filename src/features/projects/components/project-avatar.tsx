import Image from "next/image"

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const ProjectAvatar = ({
    image,
    name,
    className,
    fallbackClassName,
}: WorkspaceAvatarProps) => {
    if (image) {
        // 💡 FIX: Add return here to render the Image component
        return ( 
            <div className={cn(
                "size-5 relative rounded-md overflow-hidden",
                className,
            )}>
                <Image alt={name} src={image} fill className="object-cover"/>
            </div>
        )
    }

    // Fallback: This runs ONLY if 'image' is undefined or null
    return (
        <Avatar className={cn(
            "size-5 rounded-md",
            className
        )}>
            <AvatarFallback className={cn(
                    "text-white bg-blue-600 font-semibold text-sm uppercase rounded-md",
                    fallbackClassName,
                )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}