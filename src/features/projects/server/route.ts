import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Permission, Query, Role } from "node-appwrite";
import z from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";

const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const storage = c.get("storage")

            const { name, image, workspaceId } = c.req.valid("form")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unathorized" }, 401)
            }

            let uploadImageUrl: string | undefined 

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                    [
                        // 🚨 Add this line: Allows anyone (guest) to read the file
                        Permission.read(Role.any()), 
                    ]
                )

                const arrayBuffer = await storage.getFileView(
                    IMAGES_BUCKET_ID,
                    file.$id,
                )

                uploadImageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${IMAGES_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
            }

            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                { 
                    name, 
                    imageUrl: uploadImageUrl,
                    workspaceId
                }
            )

            return c.json({ data: project })
        }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")

            const { workspaceId } = c.req.valid("query")

            if (!workspaceId) {
                return c.json({error: "Missing workspaceId"}, 400)
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if(!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ],
            )

            return c.json({ data: projects })
        }
    )
    .patch(
            "/:projectId",
            sessionMiddleware,
            zValidator("form", updateProjectSchema),
            async (c) => {
                const databases = c.get("databases")
                const storage = c.get("storage")
                const user = c.get("user")
    
                const { projectId } = c.req.param()
                const { name, image } = c.req.valid("form")
    
                const existingProject = await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                )

                const member = await getMember({
                    databases,
                    workspaceId: existingProject.workspaceId,
                    userId: user.$id,
                })
    
                if (!member) {
                    return c.json({error: "Unauthorized"}, 401)
                }
    
                let uploadImageUrl: string | undefined 
    
                if (image instanceof File) {
                    const file = await storage.createFile(
                        IMAGES_BUCKET_ID,
                        ID.unique(),
                        image,
                    )
    
                    const arrayBuffer = await storage.getFileView(
                        IMAGES_BUCKET_ID,
                        file.$id,
                    )
    
                    uploadImageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${IMAGES_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                } else {
                    uploadImageUrl = image
                }
    
                const project = await databases.updateDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                    {
                        name,
                        userId: user.$id,
                        imageUrl: uploadImageUrl
                    }
                )
    
                return c.json({ data: project }, 200)
            }
        )

export default app;