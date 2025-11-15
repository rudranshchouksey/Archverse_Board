import { Button } from "@/components/ui/button"
import { getCurrent } from "@/features/auth/queries"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { getProject } from "@/features/projects/queries"
import { Project } from "@/features/projects/types"
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface ProjectIdPageProps {
    params: { projectId: string }
}

const ProjectIdPage = async ({
    params,
}: ProjectIdPageProps) => {
    const user = await getCurrent()
    if (!user) redirect("/sign-in")
    
    const initialValues = await getProject({
        projectId: params.projectId,
    })

    if (!initialValues || "name" in initialValues && !initialValues.name) {
        if (!initialValues) {
            throw new Error("Project not found")
        }
    }

    const project = initialValues as Project;
    
    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ProjectAvatar 
                        name={project.name}
                        image={project.imageUrl}
                        className="size-8"
                    />
                    <p className="text-lg font-semibold">{project.name}</p>
                </div>
                <div>
                    <Button variant={"secondary"} size={"sm"} asChild >
                        <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
                            <PencilIcon className="size-4 mr-2" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
            <TaskViewSwitcher />
        </div>
    )
}

export default ProjectIdPage