"use client";

import { useState } from "react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLinkIcon, PencilIcon, XIcon, ImageIcon } from "lucide-react";
import { useUpdateTask } from "../api/use-update-task";
import { DottedSeparator } from "@/components/dotted-separator";
import Image from "next/image";

interface TaskPreviewProps {
    task: Task;
}

export const TaskPreview = ({ task }: TaskPreviewProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.previewImage || "");

    const { mutate, isPending } = useUpdateTask();

    const handleSave = () => {
        mutate({
            json: { previewImage: value }, // This now works because we updated the schema!
            param: { taskId: task.$id }
        }, {
            onSuccess: () => setIsEditing(false)
        });
    };

    // Helper to detect if link is an image or google drive
    const isImage = (url: string) => {
        return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
    }

    const getEmbedLink = (url: string) => {
        if (!url) return "";
        if (url.includes("drive.google.com/file/d/")) {
            return url.replace(/\/view.*/, "/preview").replace(/\/edit.*/, "/preview");
        }
        return url;
    };

    return (
        <div className="p-4 border rounded-lg flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Preview Asset</p>
                <Button onClick={() => setIsEditing(!isEditing)} size="sm" variant="secondary">
                    {isEditing ? <XIcon className="size-4 mr-2"/> : <PencilIcon className="size-4 mr-2"/>}
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeparator className="my-4" />

            {isEditing ? (
                <div className="flex flex-col gap-4">
                    <Input 
                        placeholder="Paste Google Drive link or Image URL..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isPending}
                    />
                    <Button onClick={handleSave} disabled={isPending} size="sm" className="w-fit ml-auto">
                        Save Link
                    </Button>
                </div>
            ) : (
                <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative group border border-dashed">
                    {task.previewImage ? (
                        <>
                            {isImage(task.previewImage) ? (
                                <img src={task.previewImage} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <iframe 
                                    src={getEmbedLink(task.previewImage)} 
                                    className="w-full h-full border-0 pointer-events-none" 
                                    title="Task Preview"
                                />
                            )}
                            
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                                <a 
                                    href={task.previewImage} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Button size="sm" variant="secondary">
                                        <ExternalLinkIcon className="size-4 mr-2" />
                                        Open Original
                                    </Button>
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="size-10 mb-2 opacity-50" />
                            <p className="text-sm">No preview link attached</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};