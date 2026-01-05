import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

// infer types from the Hono client definition
type ResponseType = InferResponseType<typeof client.api.comments["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.comments["$post"]>;

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.comments["$post"]({ json });
            
            if (!response.ok) {
                throw new Error("Failed to create comment");
            }
            
            return await response.json();
        },
        onSuccess: (_, variables) => {
            toast.success("Comment added");
            
            // Invalidate the specific task's comments
            queryClient.invalidateQueries({ queryKey: ["comments", variables.json.taskId] });
        },
        onError: () => {
            toast.error("Failed to post comment");
        }
    });

    return mutation;
};