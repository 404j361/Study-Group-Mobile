import { SessionContext } from "@/app/_layout";
import StatCard from "@/components/landing/home/StatCard";
import styles from "@/components/landing/home/style";
import Welcome from "@/components/Welcome";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface RecentActivity {
    id: number;
    type: string;
    title: string;
    created_at: string;
}

export default function LandingIndex() {
    const session = useContext(SessionContext);
    const theme = useTheme();
    const user = session?.user ?? null;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGroups: 0,
        forumPosts: 0,
        activeToday: 0,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    const fullName =
        (user?.user_metadata as { fullName?: string })?.fullName ?? "Student";

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                // no user: skip fetching and show Welcome after loading
                setLoading(false);
                setStats({
                    totalUsers: 0,
                    activeGroups: 0,
                    forumPosts: 0,
                    activeToday: 0,
                });
                setRecentActivity([]);
                return;
            }

            try {
                const { count: totalUsers } = await supabase
                    .from("users")
                    .select("id", { count: "exact" });
                const { count: forumPosts } = await supabase
                    .from("conversations")
                    .select("id", { count: "exact" });
                const { count: activeGroups } = await supabase
                    .from("study_groups")
                    .select("id", { count: "exact" });
                const { count: activeToday } = await supabase
                    .from("conversations")
                    .select("id", { count: "exact" })
                    .gte("created_at", new Date().toISOString().split("T")[0]); // messages today

                const { data: recent } = await supabase
                    .from("conversations")
                    .select("id, message, created_at")
                    .order("created_at", { ascending: false })
                    .limit(5);

                setStats({
                    totalUsers: totalUsers ?? 0,
                    activeGroups: activeGroups ?? 0,
                    forumPosts: forumPosts ?? 0,
                    activeToday: activeToday ?? 0,
                });
                setRecentActivity(
                    (recent || []).map((r) => ({
                        id: r.id,
                        type: "Forum Post",
                        title: r.message,
                        created_at: r.created_at,
                    }))
                );
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading)
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" />
            </View>
        );

    if (!user) return <Welcome />;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View>
                        <Text
                            style={[
                                styles.welcomeText,
                                { color: theme.colors.text },
                            ]}
                        >
                            Welcome {fullName}!
                        </Text>
                        <Text
                            style={{
                                ...styles.subtitle,
                                color: theme.colors.text,
                            }}
                        >
                            Ready to continue your learning journey?
                        </Text>
                    </View>
                    <Link href="/">
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color={theme.colors.text}
                        />
                    </Link>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={
                            <Ionicons
                                name="person-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                    />
                    <StatCard
                        title="Active Groups"
                        value={stats.activeGroups}
                        icon={
                            <Ionicons
                                name="people-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                    />
                    <StatCard
                        title="Forum Posts Count"
                        value={stats.forumPosts}
                        icon={
                            <Ionicons
                                name="chatbubble-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                    />
                    <StatCard
                        title="Active Today"
                        value={stats.activeToday}
                        icon={
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                    />
                </View>

                {/* Recent Activity */}
                <View style={{ marginTop: 24 }}>
                    <Text
                        style={{ ...styles.subtitle, color: theme.colors.text }}
                    >
                        Recent Activity
                    </Text>
                    {recentActivity.map((activity) => (
                        <View
                            key={activity.id}
                            style={{
                                padding: 12,
                                backgroundColor: theme.colors.card,
                                borderRadius: 12,
                                marginTop: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: "bold",
                                    color: theme.colors.text,
                                }}
                            >
                                {activity.type}
                            </Text>
                            <Text style={{ color: theme.colors.text }}>
                                {activity.title}
                            </Text>
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 12,
                                    marginTop: 4,
                                }}
                            >
                                {new Date(
                                    activity.created_at
                                ).toLocaleTimeString()}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
