import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

import TrendingIcon from "@/components/icons/TrendingIcon";
import ProgressRow from "@/components/landing/home/ProgressRow";
import StatCard from "@/components/landing/home/StatCard";
import styles from "@/components/landing/home/style";
import Welcome from "@/components/Welcome";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { SessionContext } from "../_layout";

export default function LandingIndex() {
    const session = useContext(SessionContext);
    const theme = useTheme();
    const user = session?.user ?? null;
    const userId = user?.id;
    const [userFromDb, setUserFromDb] = React.useState<any>(null);

    // REAL DATA STATES
    const [groupsJoined, setGroupsJoined] = React.useState(0);
    const [cardsReviewed, setCardsReviewed] = React.useState(0);
    const [averageScore, setAverageScore] = React.useState("0%");
    const [studyHours, setStudyHours] = React.useState(0);

    // WEEKLY PROGRESS
    const [weeklyFlashReviews, setWeeklyFlashReviews] = React.useState(0);
    const [weeklyForums, setWeeklyForums] = React.useState(0);
    const [weeklyStudyGoal, setWeeklyStudyGoal] = React.useState({
        current: 0,
        total: 0,
    });

    /* ---------------------------------------------------------
        Fetch Logged-in user
    --------------------------------------------------------- */
    React.useEffect(() => {
        async function fetchUser() {
            if (user) {
                const { data } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setUserFromDb(data);
            }
        }
        fetchUser();
    }, [user]);

    /* ---------------------------------------------------------
        Redirect admin
    --------------------------------------------------------- */
    useEffect(() => {
        if (userFromDb?.role === "admin") {
            router.replace("/(admin)/home");
        }
    }, [userFromDb]);

    /* ---------------------------------------------------------
        FETCH REAL DASHBOARD DATA
    --------------------------------------------------------- */
    useEffect(() => {
        if (!userId) return;

        fetchGroupsJoined();
        fetchFlashcardStats();
        fetchStudyHours();
        fetchWeeklyFlashcardActivity();
        fetchWeeklyForumStats();
        fetchStudyGoalProgress();
    }, [
        fetchFlashcardStats,
        fetchGroupsJoined,
        fetchStudyGoalProgress,
        fetchStudyHours,
        fetchWeeklyFlashcardActivity,
        fetchWeeklyForumStats,
        userId,
    ]);

    if (userFromDb?.role === "admin") return null;
    if (!user || !userFromDb) return <Welcome />;

    /* ---------------------------------------------------------
        1. GROUPS JOINED
    --------------------------------------------------------- */
    async function fetchGroupsJoined() {
        const { count } = await supabase
            .from("study_group_members")
            .select("*", { count: "exact", head: true })
            .eq("memberId", userId)
            .eq("status", "approved");

        setGroupsJoined(count ?? 0);
    }

    /* ---------------------------------------------------------
        2. FLASHCARDS — TOTAL REVIEWED + ACCURACY
    --------------------------------------------------------- */
    async function fetchFlashcardStats() {
        const { data } = await supabase
            .from("flashcard_user_stats")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (data) {
            setCardsReviewed(data.total_reviewed ?? 0);

            const total = data.total_reviewed || 0;
            const correct = data.total_correct || 0;
            setAverageScore(
                total === 0 ? "0%" : Math.round((correct / total) * 100) + "%"
            );
        }
    }

    /* ---------------------------------------------------------
        3. STUDY HOURS (sum of tasks.estimated_hours)
    --------------------------------------------------------- */
    async function fetchStudyHours() {
        const { data } = await supabase
            .from("tasks")
            .select("estimated_hours")
            .eq("user_id", userId);

        if (!data) return;

        const totalHours = data.reduce(
            (sum, t) => sum + Number(t.estimated_hours || 0),
            0
        );
        setStudyHours(totalHours);
    }

    /* ---------------------------------------------------------
        4. WEEKLY FLASHCARD REVIEWS
    --------------------------------------------------------- */
    async function fetchWeeklyFlashcardActivity() {
        const { data } = await supabase.rpc("get_weekly_flashcard_reviews", {
            uid: userId,
        });

        setWeeklyFlashReviews(data ?? 0);
    }

    /* ---------------------------------------------------------
        5. WEEKLY FORUM PARTICIPATION
    --------------------------------------------------------- */
    async function fetchWeeklyForumStats() {
        const { data: posts } = await supabase
            .from("forum_posts")
            .select("id")
            .eq("user_id", userId)
            .gte(
                "created_at",
                new Date(Date.now() - 7 * 86400000).toISOString()
            );

        const { data: replies } = await supabase
            .from("forum_replies")
            .select("id")
            .eq("user_id", userId)
            .gte(
                "created_at",
                new Date(Date.now() - 7 * 86400000).toISOString()
            );

        setWeeklyForums((posts?.length || 0) + (replies?.length || 0));
    }

    /* ---------------------------------------------------------
        6. WEEKLY STUDY GOAL PROGRESS
    --------------------------------------------------------- */
    async function fetchStudyGoalProgress() {
        const { data: goals } = await supabase
            .from("goals")
            .select("id")
            .eq("user_id", userId);

        const totalGoals = goals?.length ?? 0;

        const { data: completedTasks } = await supabase
            .from("tasks")
            .select("id")
            .eq("user_id", userId)
            .eq("completed", true);

        const completed = completedTasks?.length ?? 0;

        setWeeklyStudyGoal({
            current: completed,
            total: totalGoals,
        });
    }

    /* ---------------------------------------------------------
        UI
    --------------------------------------------------------- */

    const fullName =
        (user.user_metadata as { fullName?: string })?.fullName ?? "Student";

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
                            style={[
                                styles.subtitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Ready to continue your learning journey?
                        </Text>
                    </View>

                    <Link href="/(landing)/notification">
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color={theme.colors.text}
                        />
                    </Link>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Study Hours"
                        value={studyHours}
                        icon={
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+10"
                    />
                    <StatCard
                        title="Groups Joined"
                        value={groupsJoined}
                        icon={
                            <Ionicons
                                name="people-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+2"
                    />
                    <StatCard
                        title="Cards Reviewed"
                        value={cardsReviewed}
                        icon={
                            <MaterialCommunityIcons
                                name="brain"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+18"
                    />
                    <StatCard
                        title="Avg. Score"
                        value={averageScore}
                        icon={
                            <Ionicons
                                name="trophy-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+5%"
                    />
                </View>

                {/* Weekly Progress */}
                <View
                    style={{
                        ...styles.progressContainer,
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <TrendingIcon
                            width={24}
                            height={24}
                            color={theme.colors.text}
                        />
                        <Text
                            style={{
                                ...styles.progressTitle,
                                color: theme.colors.text,
                            }}
                        >
                            This Week’s Progress
                        </Text>
                    </View>

                    <ProgressRow
                        label="Study Goal"
                        current={weeklyStudyGoal.current}
                        total={weeklyStudyGoal.total}
                    />
                    <ProgressRow
                        label="Flashcard Reviews"
                        current={weeklyFlashReviews}
                        total={300}
                    />
                    <ProgressRow
                        label="Forum Participation"
                        current={weeklyForums}
                        total={10}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
