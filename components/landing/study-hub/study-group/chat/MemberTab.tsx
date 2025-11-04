import { supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Member {
    id: number;
    memberId: string;
    groupId: number;
    role: "admin" | "student";
    status: "active" | "pending";
    users: {
        fullName: string;
        avatarUrl?: string;
    };
}

interface MembersTabProps {
    groupId: string;
}

const fallbackAvatar = require("@/assets/images/avatar.jpg");

// ✅ Separate component that can use hooks safely
const AvatarImage = ({ avatarUrl }: { avatarUrl?: string }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <Image
            source={
                !imageError && avatarUrl ? { uri: avatarUrl } : fallbackAvatar
            }
            onError={() => setImageError(true)}
            style={{
                width: 36,
                height: 36,
                borderRadius: 18,
            }}
        />
    );
};

export default function MembersTab({ groupId }: MembersTabProps) {
    const theme = useTheme();
    const [activeMembers, setActiveMembers] = useState<Member[]>([]);
    const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) return;
        fetchMembers();
    }, [groupId]);

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("study_group_members")
            .select("*, users:users!memberId(fullName, avatarUrl)")
            .eq("groupId", groupId);

        if (error) {
            console.error("Error fetching members:", error.message);
            setLoading(false);
            return;
        }

        setActiveMembers(data?.filter((m) => m.status === "active") || []);
        setPendingMembers(data?.filter((m) => m.status === "pending") || []);
        setLoading(false);
    };

    const handleApprove = async (id: number) => {
        const { error } = await supabase
            .from("study_group_members")
            .update({ status: "active" })
            .eq("id", id);

        if (error) {
            console.error("Error approving member:", error.message);
            return;
        }
        fetchMembers();
    };

    const handleDecline = async (id: number) => {
        const { error } = await supabase
            .from("study_group_members")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error declining request:", error.message);
            return;
        }
        fetchMembers();
    };

    if (loading) {
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
            style={{ flex: 1, paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 60 }}
        >
            {/* ACTIVE MEMBERS */}
            <Text
                style={{
                    color: theme.colors.text,
                    fontWeight: "700",
                    fontSize: 18,
                    marginBottom: 10,
                }}
            >
                Group Members
            </Text>

            {activeMembers.length === 0 ? (
                <Text style={{ color: theme.colors.text, opacity: 0.6 }}>
                    No active members yet.
                </Text>
            ) : (
                activeMembers.map((member) => (
                    <View
                        key={member.id}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.border,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <AvatarImage avatarUrl={member.users.avatarUrl} />
                            <View>
                                <Text
                                    style={{
                                        color: theme.colors.text,
                                        fontWeight: "600",
                                    }}
                                >
                                    {member.users.fullName}
                                </Text>
                                <Text
                                    style={{
                                        color: theme.colors.text,
                                        opacity: 0.6,
                                        fontSize: 12,
                                    }}
                                >
                                    {member.role === "admin"
                                        ? "Leader"
                                        : "Member"}
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: "green", fontSize: 12 }}>
                            Online
                        </Text>
                    </View>
                ))
            )}

            {/* INVITE BUTTON */}
            <TouchableOpacity
                style={{
                    marginTop: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.text,
                    borderRadius: 8,
                    padding: 10,
                    alignItems: "center",
                }}
                onPress={() => {
                    // Add invite logic later
                }}
            >
                <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
                    + Invite Members
                </Text>
            </TouchableOpacity>

            {/* PENDING REQUESTS */}
            <Text
                style={{
                    color: theme.colors.text,
                    fontWeight: "700",
                    fontSize: 18,
                    marginTop: 24,
                    marginBottom: 10,
                }}
            >
                Pending Requests
            </Text>

            {pendingMembers.length === 0 ? (
                <Text style={{ color: theme.colors.text, opacity: 0.6 }}>
                    No pending requests.
                </Text>
            ) : (
                pendingMembers.map((member) => (
                    <View
                        key={member.id}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.border,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <AvatarImage avatarUrl={member.users.avatarUrl} />
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontWeight: "600",
                                }}
                            >
                                {member.users.fullName}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: 6,
                                    paddingVertical: 4,
                                    paddingHorizontal: 10,
                                }}
                                onPress={() => handleApprove(member.id)}
                            >
                                <Text
                                    style={{
                                        color: theme.colors.background,
                                        fontWeight: "600",
                                    }}
                                >
                                    Approve
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: theme.colors.notification,
                                    borderRadius: 6,
                                    paddingVertical: 4,
                                    paddingHorizontal: 10,
                                }}
                                onPress={() => handleDecline(member.id)}
                            >
                                <Text
                                    style={{
                                        color: theme.colors.background,
                                        fontWeight: "600",
                                    }}
                                >
                                    Decline
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}
