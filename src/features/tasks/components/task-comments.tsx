"use client";

import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/dotted-separator";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useGetComments } from "@/features/comments/api/use-get-comments";
import { useCreateComment } from "@/features/comments/api/use-create-comment";
import { useGetMembers } from "@/features/members/api/use-get-members"; 

interface TaskCommentsProps {
    task: Task;
}

export const TaskComments = ({ task }: TaskCommentsProps) => {
    const [content, setContent] = useState("");
    
    // 1. Fetch real comments
    const { data: comments, isLoading: isLoadingComments } = useGetComments({ taskId: task.$id });
    
    // 2. Fetch members to resolve names/avatars
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId: task.workspaceId });

    // 3. Mutation hook
    const { mutate, isPending } = useCreateComment();

    const handleSubmit = () => {
        if (!content) return;
        
        mutate({ 
            json: { 
                content, 
                taskId: task.$id,
            } 
        }, {
            onSuccess: () => setContent("") // Clear input on success
        });
    };

    const isLoading = isLoadingComments || isLoadingMembers;

    return (
        <div className="p-4 border rounded-lg flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Comments</p>
                <span className="text-sm text-muted-foreground">{comments?.documents.length || 0} comments</span>
            </div>
            <DottedSeparator className="my-4" />
            
            {/* Input Area */}
            <div className="flex gap-4 mb-6">
                <MemberAvatar name="Me" className="size-8" /> 
                <div className="flex flex-col gap-2 w-full">
                    <Textarea 
                        placeholder="Write a comment..." 
                        rows={3} 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isPending}
                    />
                    <Button 
                        size="sm" 
                        className="w-fit ml-auto" 
                        onClick={handleSubmit}
                        disabled={isPending || !content}
                    >
                        {isPending ? <Loader2 className="size-4 animate-spin mr-2"/> : null}
                        Post Comment
                    </Button>
                </div>
            </div>

            {/* Comment List */}
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin size-6 text-muted-foreground"/>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {comments?.documents.map((comment: any) => {
                        const member = members?.documents.find((m: any) => m.$id === comment.memberId);
                        
                        return (
                            <div key={comment.$id} className="flex gap-4">
                                <MemberAvatar 
                                    name={member?.name || "User"} 
                                    className="size-8"
                                    fallbackClassName="text-xs"
                                />
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                            {member?.name || "Unknown Member"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-md text-sm text-foreground whitespace-pre-wrap">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};