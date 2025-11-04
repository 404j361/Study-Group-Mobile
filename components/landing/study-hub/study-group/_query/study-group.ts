import { supabase } from "@/lib/supabase";
import { StudyGroup } from "./types";

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
            maxMembers,
            createdAt,
            study_group_members!inner (
                memberId,
                createdAt
            )
        `
        )
        .eq("study_group_members.memberId", user.id)
        .eq("study_group_members.status", "active")
        .order("createdAt", { ascending: false });

    if (error) {
        return [];
    }
    return data as unknown as StudyGroup[];
}

export async function getDiscoverStudyGroups({
    searchQuery = "",
    page = 1,
    pageSize = 10,
}: {
    searchQuery?: string;
    page?: number;
    pageSize?: number;
}) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user)
        return { data: [], total: 0, page: 1, totalPages: 1 };

    // Fetch active memberships
    const { data: activeMemberships, error: activeError } = await supabase
        .from("study_group_members")
        .select("groupId")
        .eq("memberId", user.id)
        .eq("status", "active");

    if (activeError) {
        console.error("Error fetching active memberships:", activeError);
        return { data: [], total: 0, page: 1, totalPages: 1 };
    }

    const activeGroupIds = activeMemberships?.map((m) => m.groupId) ?? [];

    // Build query for public groups excluding active groups
    let query = supabase
        .from("study_groups")
        .select(
            `
        id,
        groupName,
        description,
        subject,
        maxMembers,
        createdAt,
        publicGroup,
        study_group_members (
            memberId,
            status,
            createdAt
        )
    `,
            { count: "exact" }
        )
        .eq("publicGroup", true)
        .order("createdAt", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    // Only exclude active groups if there are any
    if (activeGroupIds.length > 0) {
        query = query.not("id", "in", `(${activeGroupIds.join(",")})`);
    }

    // Add search filter if provided
    if (searchQuery.trim() !== "") {
        query = query.or(
            `groupName.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching discoverable groups:", error);
        return { data: [], total: 0, page: 1, totalPages: 1 };
    }

    // Fetch pending requests
    const { data: pendingRequests, error: pendingError } = await supabase
        .from("study_group_members")
        .select("groupId")
        .eq("memberId", user.id)
        .eq("status", "pending");

    if (pendingError) {
        console.error("Error fetching pending requests:", pendingError);
    }

    const pendingGroupIds = new Set(
        pendingRequests?.map((r) => r.groupId) ?? []
    );

    // Add status and member count to each group
    const groupsWithStatus = (data ?? []).map((group: any) => ({
        ...group,
        alreadyRequested: pendingGroupIds.has(group.id),
        memberCount: group.study_group_members.length,
    }));

    return {
        data: groupsWithStatus,
        total: count ?? 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 1,
    };
}
