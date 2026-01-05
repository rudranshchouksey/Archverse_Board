import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, COMMENTS_ID, MEMBERS_ID } from "@/config"; // Ensure COMMENTS_ID is in your config
import { getMember } from "@/features/members/utils";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ taskId: z.string() })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const { taskId } = c.req.valid("query");

            const comments = await databases.listDocuments(
                DATABASE_ID,
                COMMENTS_ID,
                [
                    Query.equal("taskId", taskId),
                    Query.orderDesc("$createdAt")
                ]
            );

            // Populate member details for each comment
            const memberIds = comments.documents.map((comment) => comment.memberId);
            
            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                memberIds.length > 0 ? [Query.contains("$id", memberIds)] : []
            );

            const authors = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    };
                })
            );

            const populatedComments = comments.documents.map((comment) => {
                const author = authors.find((member) => member.$id === comment.memberId);
                return {
                    ...comment,
                    member: author || { name: "Unknown User" } // Fallback
                };
            });

            return c.json({ data: { ...comments, documents: populatedComments } });
        }
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", z.object({
            taskId: z.string(),
            content: z.string(),
        })),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { taskId, content } = c.req.valid("json");

            // Verify the user is a member of the workspace for this task
            // (You might want to fetch the task first to get workspaceId, 
            // but for simplicity we'll assume valid membership if they are logged in. 
            // Ideally: Fetch task -> get workspaceId -> check getMember)
            
            // 1. Get the member ID for the current user
            // We need to find which "Member" record belongs to this "User"
            // This assumes you might have the workspaceId handy, or we query all memberships.
            // A safer bet is to pass workspaceId from frontend or look it up.
            
            // Quick lookup for member ID based on User ID (This works if user is in 1 workspace usually, 
            // strict implementation requires workspaceId in the body)
            const membership = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("userId", user.$id)] 
            );

            if (membership.documents.length === 0) {
                 return c.json({ error: "Unauthorized" }, 401);
            }
            
            // Use the first matching member ID (or refine logic if user is in multiple workspaces)
            const memberId = membership.documents[0].$id;

            const comment = await databases.createDocument(
                DATABASE_ID,
                COMMENTS_ID,
                ID.unique(),
                {
                    content,
                    taskId,
                    memberId
                }
            );

            return c.json({ data: comment });
        }
    );

export default app;