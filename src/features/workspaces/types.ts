import { Models } from "node-appwrite";

export type Workspce = Models.Document & {
    name: string
    imageUrl: string
    inviteCode: string
    userId: string
}