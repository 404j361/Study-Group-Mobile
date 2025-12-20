import { SessionContext } from "@/app/_layout";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link, router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function FlashCard() {
    const theme = useTheme();
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const session = useContext(SessionContext);
    const user = session?.user ?? null;

    const [stats, setStats] = useState({
        total_reviewed: 0,
        accuracy: 0,
        study_streak: 0,
    });

    useEffect(() => {
        const fetchFlashcardsAndStats = async () => {
            try {
                if (!user) return;

                setLoading(true);

                // Fetch user flashcard sets
                const { data: flashcardData, error: flashcardError } =
                    await supabase
                        .from("flashcard_sets")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });

                if (flashcardError) throw flashcardError;
                setFlashcards(flashcardData || []);

                // Fetch user stats
                const { data: statsData, error: statsError } = await supabase
                    .from("flashcard_user_stats")
                    .select("*")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (statsError) throw statsError;

                if (statsData) {
                    const total =
                        (statsData.total_correct ?? 0) +
                        (statsData.total_incorrect ?? 0);
                    const accuracy =
                        total > 0
                            ? Math.round(
                                  ((statsData.total_correct ?? 0) / total) * 100
                              )
                            : 0;

                    setStats({
                        total_reviewed: total,
                        accuracy,
                        study_streak: statsData.study_streak ?? 0,
                    });
                }
            } catch (err) {
                console.error("Error loading flashcards:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcardsAndStats();
    }, [user]);

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                if (!user) return;

                const { data, error } = await supabase
                    .from("flashcard_sets")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setFlashcards(data || []);
            } catch (err) {
                console.error(
                    "Error loading flashcards:",
                    (err as { message: string })?.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcards();
    }, [user]);

    if (loading)
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.background,
                }}
            >
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Link style={{ marginTop: 5 }} href={"/study-hub"}>
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={theme.colors.text}
                        />
                    </Link>
                    <View>
                        <Text
                            style={[
                                styles.headerTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Flashcards
                        </Text>
                        <Text
                            style={[
                                styles.headerSubtitle,
                                { color: theme.colors.text + "90" },
                            ]}
                        >
                            Review and memorize key concepts
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() =>
                        router.navigate("/study-hub/flash-cards/create")
                    }
                >
                    <Ionicons name="add" color="#fff" size={20} />
                    <Text style={styles.createText}>Create</Text>
                </TouchableOpacity>
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                        {stats.total_reviewed}
                    </Text>
                    <Text style={styles.statLabel}>Cards Reviewed</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.accuracy}%</Text>
                    <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.study_streak}</Text>
                    <Text style={styles.statLabel}>Study Streak</Text>
                </View>
            </View>

            {/* FLASHCARD SETS */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginTop: 20 }}
            >
                <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                    Your Flashcard Sets
                </Text>

                {flashcards.length === 0 ? (
                    <Text
                        style={{
                            color: theme.colors.text + "90",
                            textAlign: "center",
                            marginTop: 20,
                        }}
                    >
                        No flashcards yet. Tap “Create” to make your first deck!
                    </Text>
                ) : (
                    flashcards.map((set, i) => (
                        <View
                            key={set.id || i}
                            style={[
                                styles.cardContainer,
                                { backgroundColor: theme.colors.card },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.cardTitle,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {set.title}
                            </Text>

                            {/* Subject + Difficulty */}
                            <View style={styles.tagsRow}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {set.subject || "Unknown"}
                                    </Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {set.difficulty || "Medium"}
                                    </Text>
                                </View>
                            </View>

                            {/* Stats */}
                            <View style={styles.statDetailsRow}>
                                <View>
                                    <Text style={styles.statSmallLabel}>
                                        Total Cards
                                    </Text>
                                    <Text style={styles.statSmallValue}>
                                        {set.total_cards || 0}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.statSmallLabel}>
                                        Accuracy
                                    </Text>
                                    <Text style={styles.statSmallValue}>
                                        {set.accuracy
                                            ? `${set.accuracy}%`
                                            : "--"}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${
                                                ((set.studied_cards || 0) /
                                                    (set.total_cards || 1)) *
                                                100
                                            }%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.progressLabel,
                                    { color: theme.colors.text + "90" },
                                ]}
                            >
                                {set.studied_cards || 0}/{set.total_cards || 0}{" "}
                                Studied
                            </Text>

                            <TouchableOpacity
                                style={styles.reviewButton}
                                onPress={() =>
                                    router.navigate({
                                        pathname:
                                            "/study-hub/flash-cards/flash-card/[cardId]",
                                        params: { cardId: set.id },
                                    })
                                }
                            >
                                <Ionicons
                                    name="book-outline"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.reviewText}>Review</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    headerTitle: { fontSize: 20, fontWeight: "700" },
    headerSubtitle: { fontSize: 13 },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    createText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        paddingVertical: 12,
        marginHorizontal: 4,
    },
    statNumber: { fontSize: 18, fontWeight: "700" },
    statLabel: { fontSize: 12, color: "#555" },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    cardContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
    tagsRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
    tag: {
        backgroundColor: "#e5e5e5",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    tagText: { fontSize: 12, fontWeight: "500" },
    statDetailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statSmallLabel: { fontSize: 12, color: "#555" },
    statSmallValue: { fontSize: 14, fontWeight: "600" },
    progressBarContainer: {
        height: 6,
        borderRadius: 6,
        backgroundColor: "#ddd",
        marginBottom: 4,
    },
    progressBarFill: {
        height: 6,
        backgroundColor: "#000",
        borderRadius: 6,
    },
    progressLabel: { fontSize: 12, textAlign: "right", marginBottom: 6 },
    reviewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        paddingVertical: 10,
        borderRadius: 10,
    },
    reviewText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
});
