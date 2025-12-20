import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

export default function AdminStudyGroups() {
    const theme = useTheme();

    const [loading, setLoading] = useState(true);

    const [groups, setGroups] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [stats, setStats] = useState({
        totalMembers: 0,
        activeGroups: 0,
        reportedGroups: 0,
    });

    const [showDisableModal, setShowDisableModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchGroups(), fetchStats()]);
        setLoading(false);
    };

    const fetchGroups = async () => {
        const { data, error } = await supabase
            .from("study_groups")
            .select(
                `
                *,
                study_group_members(count)
            `
            )
            .order("createdAt", { ascending: false });

        if (error) {
            console.error(error);
            Alert.alert("Error fetching groups");
        } else {
            const normalized = data.map((g: any) => ({
                ...g,
                memberCount: g.study_group_members?.[0]?.count ?? 0,
            }));
            setGroups(normalized);
        }
    };

    const fetchStats = async () => {
        const { count: totalMembers } = await supabase
            .from("study_group_members")
            .select("*", { count: "exact", head: true });

        const { count: activeGroups } = await supabase
            .from("study_groups")
            .select("*", { count: "exact", head: true })
            .eq("publicGroup", true);

        const { count: reportedGroups } = await supabase
            .from("study_groups")
            .select("*", { count: "exact", head: true })
            .eq("allowJoinRequests", false);

        setStats({
            totalMembers: totalMembers ?? 0,
            activeGroups: activeGroups ?? 0,
            reportedGroups: reportedGroups ?? 0,
        });
    };

    const handleDisable = async () => {
        if (!selectedGroup) return;

        const { error } = await supabase
            .from("study_groups")
            .update({ publicGroup: false })
            .eq("id", selectedGroup.id);

        if (error) {
            Alert.alert("Failed to disable group");
        } else {
            setGroups((prev) =>
                prev.map((g) =>
                    g.id === selectedGroup.id ? { ...g, publicGroup: false } : g
                )
            );
        }

        setShowDisableModal(false);
    };

    const filteredGroups = groups.filter((g) => {
        const q = searchQuery.toLowerCase();
        return (
            g.groupName.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q) ||
            g.subject?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator size="large" color={theme.colors.text} />
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                padding: 20,
            }}
        >
            {/* PAGE TITLE */}
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.colors.text,
                }}
            >
                Study Groups Management
            </Text>

            {/* STATS */}
            <View
                style={{
                    flexDirection: "row",
                    marginTop: 20,
                    justifyContent: "space-between",
                }}
            >
                <View style={statCard(theme)}>
                    <Text style={statValue(theme)}>{stats.totalMembers}</Text>
                    <Text style={statLabel(theme)}>Total Members</Text>
                </View>

                <View style={statCard(theme)}>
                    <Text style={statValue(theme)}>{stats.activeGroups}</Text>
                    <Text style={statLabel(theme)}>Active Groups</Text>
                </View>

                <View style={statCard(theme)}>
                    <Text style={statValue(theme)}>{stats.reportedGroups}</Text>
                    <Text style={statLabel(theme)}>Reported Groups</Text>
                </View>
            </View>

            {/* SEARCH */}
            <TextInput
                placeholder="Search groups"
                placeholderTextColor={theme.colors.text + "80"}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                    backgroundColor: theme.colors.card,
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 20,
                    color: theme.colors.text,
                }}
            />

            <ScrollView style={{ marginTop: 20 }}>
                {filteredGroups.map((group) => (
                    <TouchableOpacity
                        key={group.id}
                        style={groupCard(theme)}
                        activeOpacity={0.8}
                    >
                        <Text style={groupTitle(theme)}>{group.groupName}</Text>

                        <Text style={groupDesc(theme)}>
                            {group.description}
                        </Text>

                        {/* TAG */}
                        <View style={tag(theme)}>
                            <Text style={tagText(theme)}>{group.subject}</Text>
                        </View>

                        {/* MEMBERS */}
                        <View style={{ flexDirection: "row", marginTop: 8 }}>
                            <Ionicons
                                name="people"
                                size={16}
                                color={theme.colors.text}
                            />
                            <Text style={memberText(theme)}>
                                {group.memberCount}/{group.maxMembers} members
                            </Text>
                        </View>

                        {/* ACTION BUTTONS */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                gap: 10,
                                marginTop: 12,
                            }}
                        >
                            {/* EDIT */}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                        `/(admin)/study-groups/edit/${group.id}`
                                    );
                                }}
                                style={iconButton(theme)}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>

                            {/* DISABLE */}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setSelectedGroup(group);
                                    setShowDisableModal(true);
                                }}
                                style={iconButton(theme)}
                            >
                                <Ionicons
                                    name="eye-off-outline"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* DISABLE MODAL */}
            <Modal transparent visible={showDisableModal} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            width: "80%",
                            backgroundColor: theme.colors.card,
                            padding: 20,
                            borderRadius: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "700",
                                textAlign: "center",
                                color: theme.colors.text,
                            }}
                        >
                            Disable Group
                        </Text>

                        <Text
                            style={{
                                textAlign: "center",
                                marginTop: 10,
                                color: theme.colors.text,
                            }}
                        >
                            Are you sure you want to disable this group?
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 20,
                            }}
                        >
                            <TouchableOpacity
                                style={modalButton(theme)}
                                onPress={() => setShowDisableModal(false)}
                            >
                                <Text style={modalButtonText(theme)}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={modalButton(theme)}
                                onPress={handleDisable}
                            >
                                <Text style={modalButtonText(theme)}>
                                    Disable
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
/* --------------- STYLES (functions) --------------- */
const statCard = (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.card,
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
});

const statValue = (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
});

const statLabel = (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.6,
    marginTop: 4,
});

const groupCard = (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
});

const groupTitle = (theme: any): TextStyle => ({
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
});

const groupDesc = (theme: any): TextStyle => ({
    marginTop: 4,
    color: theme.colors.text,
    opacity: 0.7,
});

const tag = (theme: any): ViewStyle => ({
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignSelf: "flex-start",
});

const tagText = (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.text,
});

const memberText = (theme: any): TextStyle => ({
    marginLeft: 6,
    color: theme.colors.text,
    opacity: 0.7,
});

const iconButton = (theme: any): ViewStyle => ({
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
    borderRadius: 8,
});

const modalButton = (theme: any): ViewStyle => ({
    flex: 1,
    paddingVertical: 10,
    backgroundColor: theme.colors.border,
    borderRadius: 10,
    marginHorizontal: 4,
});

const modalButtonText = (theme: any): TextStyle => ({
    textAlign: "center",
    color: theme.colors.text,
    fontWeight: "600",
});
