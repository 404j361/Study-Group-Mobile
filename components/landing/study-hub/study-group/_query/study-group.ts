import { supabase } from "@/lib/supabase";

export async function getMyStudyGroups() {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError.message);
        return [];
    }

    if (!user) {
        console.warn("No authenticated user found");
        return [];
    }

    const { data, error } = await supabase
        .from("study_groups")
        .select(
            `
            id,
            groupName,
            description,
            subject,
            createdAt,
            study_group_members!inner (
                memberId,
                createdAt
            )
        `
        )
        .eq("study_group_members.memberId", user.id)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("Error fetching study groups:", error.message);
        return [];
    }
    return data;
}
