import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Calendar,
    Clock,
    Edit3,
    FileText,
    LogOut,
    MapPin,
    Plus,
    Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface StudyGroup {
    id: number;
    groupName: string;
    description: string;
    subject: string;
    maxMembers: number;
    meetingType: string;
    meetingLocation: string;
    meetingLink: string;
    frequency: string;
    dayOfWeek: string;
    startTime: string;
    duration: string;
    publicGroup: boolean;
    allowJoinRequests: boolean;
    creator: string;
}

export default function GroupDetails() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const theme = useTheme();
    const router = useRouter();

    const [group, setGroup] = useState<StudyGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [membersCount, setMembersCount] = useState(0);
    const [materialsCount, setMaterialsCount] = useState(0);
    const [membership, setMembership] = useState<{
        isMember: boolean;
        role: "leader" | "member" | null;
        status: string | null;
    }>({ isMember: false, role: null, status: null });

    useEffect(() => {
        if (groupId) fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("study_groups")
                .select("*")
                .eq("id", groupId)
                .single();

            if (error) throw error;
            setGroup(data);

            // fetch members count
            const { count } = await supabase
                .from("study_group_members")
                .select("*", { count: "exact", head: true })
                .eq("status", "active")
                .eq("groupId", groupId);

            if (count) setMembersCount(count);

            // check current user role
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: member } = await supabase
                    .from("study_group_members")
                    .select("role, status")
                    .eq("groupId", groupId)
                    .eq("memberId", user.id)
                    .maybeSingle();

                if (member) {
                    setMembership({
                        isMember: member.status === "active",
                        role: member.role as "leader" | "member",
                        status: member.status,
                    });
                }
            }
        } catch (error: any) {
            console.error("Error fetching group details:", error.message);
            Alert.alert("Error", "Failed to load group details.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                Alert.alert(
                    "Error",
                    "You must be logged in to join this group."
                );
                return;
            }

            const { error: insertError } = await supabase
                .from("study_group_members")
                .insert([
                    {
                        groupId: group?.id,
                        memberId: user.id,
                        role: "member",
                        status: "pending",
                    },
                ]);

            if (insertError) {
                if (insertError.message.includes("duplicate key")) {
                    Alert.alert(
                        "Already Requested",
                        "You have already requested to join this group."
                    );
                    return;
                }
                throw insertError;
            }

            setMembership({ isMember: false, role: null, status: "pending" });
            Alert.alert("Request Sent", "Your join request has been sent!");
        } catch (error: any) {
            console.error("Join group error:", error);
            Alert.alert("Error", "Unable to join this group right now.");
        }
    };

    const handleLeaveGroup = async () => {
        if (!membership.role) return;

        const isLeader = membership.role === "leader";
        const title = isLeader ? "Delete Group" : "Leave Group";
        const message = isLeader
            ? "As the leader, leaving this group will delete it entirely. Are you sure you want to proceed?"
            : "Are you sure you want to leave this group? You’ll need to rejoin later if you change your mind.";

        Alert.alert(title, message, [
            { text: "Cancel", style: "cancel" },
            {
                text: isLeader ? "Delete Group" : "Leave",
                style: "destructive",
                onPress: async () => {
                    try {
                        const {
                            data: { user },
                        } = await supabase.auth.getUser();

                        if (!user) return;

                        if (isLeader) {
                            const { error: deleteError } = await supabase
                                .from("study_groups")
                                .delete()
                                .eq("id", groupId);
                            if (deleteError) throw deleteError;
                            Alert.alert(
                                "Deleted",
                                "Your group has been deleted."
                            );
                        } else {
                            const { error: removeError } = await supabase
                                .from("study_group_members")
                                .delete()
                                .eq("groupId", groupId)
                                .eq("memberId", user.id);
                            if (removeError) throw removeError;
                            Alert.alert("Left", "You have left the group.");
                        }

                        router.back();
                    } catch (err: any) {
                        console.error("Leave/Delete group error:", err.message);
                        Alert.alert(
                            "Error",
                            "Unable to perform this action right now."
                        );
                    }
                },
            },
        ]);
    };

    if (loading || !group) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                padding: 16,
            }}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Header */}
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Ionicons
                    name="arrow-back"
                    size={22}
                    color={theme.colors.text}
                />
                <Text
                    style={{
                        color: theme.colors.text,
                        marginLeft: 8,
                        fontSize: 16,
                        fontWeight: "500",
                    }}
                >
                    Back
                </Text>
            </TouchableOpacity>

            {/* Title */}
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.colors.text,
                    marginBottom: 4,
                }}
            >
                {group.groupName}
            </Text>

            <Text
                style={{
                    color: theme.colors.text,
                    opacity: 0.7,
                    marginBottom: 16,
                }}
            >
                {membersCount} members • {group.subject}
            </Text>

            {/* Info Card */}
            <View
                style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                }}
            >
                <Text style={{ color: theme.colors.text, marginBottom: 12 }}>
                    {group.description}
                </Text>

                {/* Meeting Info */}
                <View style={{ marginTop: 16, gap: 8 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Calendar size={16} color={theme.colors.text} />
                        <Text style={{ color: theme.colors.text }}>
                            {group.frequency} - {group.dayOfWeek}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Clock size={16} color={theme.colors.text} />
                        <Text style={{ color: theme.colors.text }}>
                            {group.startTime} ({group.duration})
                        </Text>
                    </View>
                    {group.meetingLocation && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <MapPin size={16} color={theme.colors.text} />
                            <Text style={{ color: theme.colors.text }}>
                                {group.meetingLocation}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Buttons Section */}
                {!membership.isMember && group.allowJoinRequests && (
                    <TouchableOpacity
                        style={{
                            backgroundColor:
                                membership.status === "pending"
                                    ? "#9ca3af"
                                    : theme.colors.text,
                            borderRadius: 8,
                            paddingVertical: 12,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            marginTop: 20,
                            gap: 8,
                        }}
                        onPress={
                            membership.status === "pending"
                                ? undefined
                                : handleJoinGroup
                        }
                        disabled={membership.status === "pending"}
                    >
                        <Plus size={16} color={theme.colors.background} />
                        <Text
                            style={{
                                color: theme.colors.background,
                                fontWeight: "600",
                            }}
                        >
                            {membership.status === "pending"
                                ? "Request Sent"
                                : "Join Group"}
                        </Text>
                    </TouchableOpacity>
                )}

                {membership.isMember && (
                    <View style={{ marginTop: 20, gap: 10 }}>
                        {membership.role === "leader" && (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push(
                                        `/study-hub/study-groups/edit/${groupId}`
                                    )
                                }
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: 8,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    gap: 8,
                                }}
                            >
                                <Edit3 size={16} color="white" />
                                <Text
                                    style={{
                                        color: "white",
                                        fontWeight: "600",
                                    }}
                                >
                                    Edit Study Group
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleLeaveGroup}
                            style={{
                                backgroundColor: "#ef4444",
                                borderRadius: 8,
                                paddingVertical: 12,
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                                gap: 8,
                            }}
                        >
                            <LogOut size={16} color="white" />
                            <Text
                                style={{
                                    color: "white",
                                    fontWeight: "600",
                                }}
                            >
                                {membership.role === "leader"
                                    ? "Delete Group"
                                    : "Leave Group"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Bottom Stats */}
            <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: theme.colors.card,
                        padding: 16,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                    }}
                >
                    <FileText color={theme.colors.text} />
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontSize: 18,
                            fontWeight: "700",
                            marginTop: 8,
                        }}
                    >
                        {materialsCount}
                    </Text>
                    <Text
                        style={{
                            color: theme.colors.text,
                            opacity: 0.6,
                            fontSize: 12,
                        }}
                    >
                        Materials
                    </Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: theme.colors.card,
                        padding: 16,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                    }}
                >
                    <Users color={theme.colors.text} />
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontSize: 18,
                            fontWeight: "700",
                            marginTop: 8,
                        }}
                    >
                        {membersCount}
                    </Text>
                    <Text
                        style={{
                            color: theme.colors.text,
                            opacity: 0.6,
                            fontSize: 12,
                        }}
                    >
                        Members
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
