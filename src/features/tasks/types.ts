import { Models } from "node-appwrite";

import { Project as AppwriteProject } from "@/features/projects/types";

export type Project = {
    name: string;
    imageUrl?: string;
}

export type Assignee = {
    name: string;
}

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS= "IN_PROGRESS",
    IN_REVIEW= "IN_REVIEW",
    DONE="DONE"
}

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    assigneeId: string;
    projectId: string;
    workspaceId: string;
    position: number;
    dueDate: string;
    description?: string;
    project?: AppwriteProject | string | null;
    assignee?: Assignee | string | null;
    previewImage?: string;
}