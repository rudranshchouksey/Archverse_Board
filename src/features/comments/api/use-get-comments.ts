import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetComments = ({ taskId }: { taskId: string }) => {
    const query = useQuery({
        queryKey: ["comments", taskId],
        queryFn: async () => {
            const response = await client.api.comments["$get"]({
                query: { taskId } 
            });

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const { data } = await response.json();
            return data;
        },
    });

    return query;
};