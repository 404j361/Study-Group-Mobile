import { SessionContext } from "@/app/_layout";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function FlashCardReview() {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { cardId } = route.params as { cardId: string };
    const session = useContext(SessionContext);
    const user = session?.user ?? null;

    const [cards, setCards] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);

    const [reviewed, setReviewed] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("flashcards")
                .select("*")
                .eq("set_id", cardId)
                .order("created_at", { ascending: true });

            if (error) console.error(error);
            else setCards(data || []);
            setLoading(false);
        };
        fetchCards();
    }, [cardId]);

    const total = cards.length;
    const accuracy =
        reviewed === 0 ? 0 : Math.round((correct / reviewed) * 100);
    const progress = total === 0 ? 0 : Math.round((reviewed / total) * 100);
    const card = cards[current];

    const handleMark = async (isCorrect: boolean) => {
        setReviewed((r) => r + 1);
        if (isCorrect) setCorrect((c) => c + 1);
        else setIncorrect((i) => i + 1);
        setShowAnswer(false);

        if (current < total - 1) setCurrent((i) => i + 1);

        if (user) {
            const { data: existing } = await supabase
                .from("flashcard_user_stats")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            const today = new Date().toISOString().split("T")[0];
            let streak = 1;

            // Maintain study streak logic
            if (existing?.last_study_date) {
                const last = new Date(existing.last_study_date);
                const diffDays =
                    (new Date(today).getTime() - last.getTime()) /
                    (1000 * 3600 * 24);
                if (diffDays === 1) streak = existing.study_streak + 1;
                else if (diffDays === 0) streak = existing.study_streak;
            }

            if (existing) {
                await supabase
                    .from("flashcard_user_stats")
                    .update({
                        total_reviewed: existing.total_reviewed + 1,
                        total_correct:
                            existing.total_correct + (isCorrect ? 1 : 0),
                        total_incorrect:
                            existing.total_incorrect + (isCorrect ? 0 : 1),
                        study_streak: streak,
                        last_study_date: today,
                    })
                    .eq("user_id", user.id);
            } else {
                await supabase.from("flashcard_user_stats").insert([
                    {
                        user_id: user.id,
                        total_reviewed: 1,
                        total_correct: isCorrect ? 1 : 0,
                        total_incorrect: isCorrect ? 0 : 1,
                        study_streak: 1,
                        last_study_date: today,
                    },
                ]);
            }
        }
    };

    const handleSkip = () => {
        if (current < total - 1) setCurrent((i) => i + 1);
    };

    const handleRestart = () => {
        setCurrent(0);
        setReviewed(0);
        setCorrect(0);
        setIncorrect(0);
        setShowAnswer(false);
    };

    if (loading)
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );

    if (cards.length === 0)
        return (
            <View style={styles.centered}>
                <Text>No flashcards found.</Text>
            </View>
        );

    // ✅ Done screen
    if (reviewed >= total)
        return (
            <View
                style={[
                    styles.centered,
                    { padding: 24, backgroundColor: "#fff" },
                ]}
            >
                <Ionicons name="checkmark-circle" size={72} color="#000" />

                <Text style={styles.doneTitle}>Review Complete</Text>
                <Text style={styles.doneSub}>
                    You reviewed all {total} cards.
                </Text>

                {/* Professional stat box, matching the first screen */}
                <View style={styles.footerBox}>
                    <View style={styles.footerItem}>
                        <Text style={styles.footerValue}>{correct}</Text>
                        <Text style={styles.footerLabel}>Correct</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Text style={styles.footerValue}>{incorrect}</Text>
                        <Text style={styles.footerLabel}>Incorrect</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Text style={styles.footerValue}>{accuracy}%</Text>
                        <Text style={styles.footerLabel}>Accuracy</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => router.navigate("/study-hub/flash-cards")}
                >
                    <Text style={styles.doneButtonText}>Go to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRestart}>
                    <Text
                        style={{
                            marginTop: 12,
                            color: "#666",
                            fontWeight: "500",
                        }}
                    >
                        Restart Review
                    </Text>
                </TouchableOpacity>
            </View>
        );

    return (
        <ScrollView
            contentContainerStyle={[styles.container]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {card.title || "Flashcard Review"}
                </Text>
                <View style={{ width: 22 }} />
            </View>

            <Text style={styles.cardCounter}>
                Card {current + 1} of {total}
            </Text>

            {/* Progress */}
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressBar}>
                <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                />
            </View>

            <View style={styles.progressRow}>
                <Text style={styles.statText}>Reviewed: {reviewed}</Text>
                <Text style={styles.statText}>Correct: {correct}</Text>
                <Text style={styles.statText}>Accuracy: {accuracy}%</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
                <View style={styles.tagsRow}>
                    <View style={[styles.tag, { backgroundColor: "#ddd" }]}>
                        <Text style={styles.tagText}>
                            {card.difficulty || "Medium"}
                        </Text>
                    </View>
                    {card.tags &&
                        card.tags.split(",").map((t: string, i: number) => (
                            <View
                                key={i}
                                style={[
                                    styles.tag,
                                    { backgroundColor: "#eee" },
                                ]}
                            >
                                <Text style={styles.tagText}>{t.trim()}</Text>
                            </View>
                        ))}
                </View>

                <Text style={styles.questionLabel}>Question</Text>
                <Text style={styles.questionText}>{card.question}</Text>

                {!showAnswer && (
                    <TouchableOpacity
                        style={styles.showAnswerBtn}
                        onPress={() => setShowAnswer(true)}
                    >
                        <Ionicons name="eye" size={16} color="#fff" />
                        <Text style={styles.showAnswerText}>Show Answer</Text>
                    </TouchableOpacity>
                )}

                {showAnswer && (
                    <>
                        <Text style={styles.answerLabel}>Answer</Text>
                        <Text style={styles.answerText}>{card.answer}</Text>

                        <View style={styles.answerButtons}>
                            <TouchableOpacity
                                style={styles.incorrectBtn}
                                onPress={() => handleMark(false)}
                            >
                                <Ionicons name="close" size={16} color="#000" />
                                <Text style={styles.incorrectText}>
                                    Incorrect
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.correctBtn}
                                onPress={() => handleMark(true)}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.correctText}>Correct</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {/* Navigation buttons */}
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.navBtn]}
                    disabled={current === 0}
                    onPress={() => setCurrent((i) => Math.max(0, i - 1))}
                >
                    <Text style={styles.navBtnText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navBtn]} onPress={handleSkip}>
                    <Ionicons name="play-skip-forward" size={14} color="#000" />
                    <Text style={[styles.navBtnText, { marginLeft: 4 }]}>
                        Skip
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navBtn]}
                    onPress={() =>
                        setCurrent((i) => Math.min(total - 1, i + 1))
                    }
                >
                    <Text style={styles.navBtnText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Footer stats box */}
            <View style={styles.footerBox}>
                <View style={styles.footerItem}>
                    <Text style={styles.footerValue}>{reviewed}</Text>
                    <Text style={styles.footerLabel}>Reviewed</Text>
                </View>
                <View style={styles.footerItem}>
                    <Text style={styles.footerValue}>{correct}</Text>
                    <Text style={styles.footerLabel}>Correct</Text>
                </View>
                <View style={styles.footerItem}>
                    <Text style={styles.footerValue}>{incorrect}</Text>
                    <Text style={styles.footerLabel}>Incorrect</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#fff", flexGrow: 1 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    headerTitle: { fontWeight: "600", fontSize: 16 },
    cardCounter: { fontSize: 13, marginBottom: 4 },
    progressLabel: { fontWeight: "500", marginTop: 6 },
    progressBar: {
        height: 6,
        backgroundColor: "#eee",
        borderRadius: 6,
        marginVertical: 6,
    },
    progressFill: { height: 6, backgroundColor: "#000", borderRadius: 6 },
    progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statText: { fontSize: 12, color: "#666" },

    card: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 16,
    },
    tagsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    tag: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tagText: { fontSize: 12 },
    questionLabel: { fontWeight: "600", marginBottom: 4 },
    questionText: { fontSize: 15, marginBottom: 16 },
    answerLabel: { fontWeight: "600", marginBottom: 4 },
    answerText: { fontSize: 15, marginBottom: 16 },
    showAnswerBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        borderRadius: 8,
        paddingVertical: 10,
    },
    showAnswerText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
    answerButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    incorrectBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 8,
        paddingVertical: 10,
        flex: 0.48,
        justifyContent: "center",
    },
    correctBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000",
        borderRadius: 8,
        paddingVertical: 10,
        flex: 0.48,
        justifyContent: "center",
    },
    incorrectText: { color: "#000", marginLeft: 6, fontWeight: "500" },
    correctText: { color: "#fff", marginLeft: 6, fontWeight: "500" },

    navRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    navBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        paddingVertical: 10,
        flex: 0.3,
    },
    navBtnText: { fontSize: 16, fontWeight: "500", color: "#000" },

    footerBox: {
        flexDirection: "row",
        justifyContent: "space-around",
        gap: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
    },
    footerItem: { alignItems: "center" },
    footerValue: { fontSize: 18, fontWeight: "600", color: "#000" },
    footerLabel: { fontSize: 14, color: "#000", marginTop: 4 },

    doneTitle: { fontSize: 22, fontWeight: "700", marginTop: 10 },
    doneSub: { color: "#666", marginTop: 4 },
    doneStats: { marginTop: 16, gap: 4, alignItems: "center" },
    doneButton: {
        backgroundColor: "#000",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 16,
    },
    doneButtonText: { color: "#fff", fontWeight: "600" },
});
