import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type UserProfile = {
    id: string;
    fullName: string;
    email: string;
    role: string;
    studentId?: string | null;
    interests?: string[] | null;
    description?: string | null;
    createdat?: string;
    avatarUrl?: string;
    major?: string;
    academicYear?: string;
    phone?: string;
};

export default function ProfileIndex() {
    const theme = useTheme();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({
        totalStudyHours: 0,
        studyGroups: 0,
        goalsCompleted: 0,
        forumPosts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndStats = async () => {
            setLoading(true);

            // Get current user
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData.user?.id;
            if (!userId) {
                setLoading(false);
                return;
            }

            // Fetch profile
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (userError) console.error("Error fetching user:", userError);
            else setUserData(user);

            // Fetch statistics in parallel
            const [
                { data: studyTasks, error: tasksError },
                { count: studyGroupsCount, error: groupsError },
                { count: goalsCount, error: goalsError },
                { count: forumPostsCount, error: postsError },
            ] = await Promise.all([
                supabase
                    .from("tasks")
                    .select("estimated_hours", { count: "exact" })
                    .eq("user_id", userId)
                    .eq("completed", true),
                supabase
                    .from("study_group_members")
                    .select("id", { count: "exact" })
                    .eq("memberId", userId)
                    .eq("status", "active"),
                supabase
                    .from("goals")
                    .select("id", { count: "exact" })
                    .eq("user_id", userId)
                    .gte("progress", 100),
                supabase
                    .from("conversations")
                    .select("id", { count: "exact" })
                    .eq("senderId", userId),
            ]);

            if (tasksError || groupsError || goalsError || postsError)
                console.error("Error fetching stats:", {
                    tasksError,
                    groupsError,
                    goalsError,
                    postsError,
                });

            // Calculate total study hours
            const totalStudyHours = studyTasks
                ? studyTasks.reduce(
                      (sum, row) => sum + Number(row.estimated_hours || 0),
                      0
                  )
                : 0;

            setStats({
                totalStudyHours,
                studyGroups: studyGroupsCount ?? 0,
                goalsCompleted: goalsCount ?? 0,
                forumPosts: forumPostsCount ?? 0,
            });

            setLoading(false);
        };

        fetchProfileAndStats();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>No user data found.</Text>
            </View>
        );
    }

    const joinDate = userData.createdat
        ? new Date(userData.createdat).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
          })
        : "Unknown";

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {/* --- HEADER --- */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>My Profile</Text>
                    <Text style={styles.subtitle}>
                        Manage your academic profile and preferences
                    </Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <Ionicons
                            name="create-outline"
                            size={18}
                            color="#111"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push("/profile/setting")}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={18}
                            color="#111"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- PROFILE CARD --- */}
            <View style={styles.profileCard}>
                <View style={{ position: "relative", alignItems: "center" }}>
                    <Image
                        source={{
                            uri:
                                userData.avatarUrl ||
                                "https://i.pravatar.cc/150?img=15",
                        }}
                        style={styles.avatar}
                    />
                </View>

                <Text style={styles.name}>{userData.fullName}</Text>
                <Text style={styles.role}>
                    {userData.role === "student"
                        ? userData.major || "Computer Science Student"
                        : "Administrator"}
                </Text>

                {userData.role === "student" && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {userData.academicYear || "Junior"}
                        </Text>
                    </View>
                )}

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={18} color="#555" />
                        <Text style={styles.infoText}>{userData.email}</Text>
                    </View>

                    {userData.phone && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="call-outline"
                                size={18}
                                color="#555"
                            />
                            <Text style={styles.infoText}>
                                {userData.phone}
                            </Text>
                        </View>
                    )}

                    {userData.studentId && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="id-card-outline"
                                size={18}
                                color="#555"
                            />
                            <Text style={styles.infoText}>
                                {userData.studentId}
                            </Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#555"
                        />
                        <Text style={styles.infoText}>Joined {joinDate}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

// (Keep your same styles — unchanged)

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerIcons: { flexDirection: "row", gap: 10 },
    iconButton: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    title: { fontSize: 22, fontWeight: "700", color: "#111" },
    subtitle: { fontSize: 13, color: "#555", marginTop: 2 },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    cameraIcon: {
        position: "absolute",
        bottom: 4,
        right: "36%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 4,
        elevation: 3,
    },
    name: { fontSize: 18, fontWeight: "600", textAlign: "center" },
    role: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 6 },
    badge: {
        backgroundColor: "#E0E7FF",
        borderRadius: 8,
        paddingVertical: 3,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    badgeText: { color: "#4338CA", fontWeight: "500", fontSize: 12 },
    infoContainer: { width: "100%", marginTop: 4 },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    infoText: { marginLeft: 8, color: "#333", fontSize: 14 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 40,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    sectionTitle: { marginLeft: 6, fontWeight: "600", fontSize: 16 },
    paragraph: { color: "#444", lineHeight: 20, fontSize: 14 },
    tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    tag: {
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    tagText: { fontSize: 13, color: "#333" },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },
    statBox: {
        width: "48%",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 10,
        alignItems: "center",
    },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#111" },
    statLabel: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
