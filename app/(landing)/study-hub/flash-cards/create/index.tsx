import DropdownSelect from "@/components/DropDownSelect";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateFlashcardDeck() {
    const { colors } = useTheme();
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [description, setDescription] = useState("");
    const [flashcards, setFlashcards] = useState([
        { question: "", answer: "", difficulty: "Medium" },
    ]);
    const [loading, setLoading] = useState(false);

    function addFlashcard() {
        setFlashcards([
            ...flashcards,
            { question: "", answer: "", difficulty: "Medium" },
        ]);
    }

    function removeFlashcard(index: number) {
        const updated = [...flashcards];
        updated.splice(index, 1);
        setFlashcards(updated);
    }

    function updateFlashcard(index: number, key: string, value: string) {
        const updated = [...flashcards];
        (updated as any)[index][key] = value;
        setFlashcards(updated);
    }

    async function handleCreate() {
        if (!title.trim() || !subject.trim()) {
            Alert.alert(
                "Missing fields",
                "Please fill in the title and subject."
            );
            return;
        }

        if (flashcards.some((f) => !f.question.trim() || !f.answer.trim())) {
            Alert.alert(
                "Incomplete cards",
                "Every flashcard must have a question and answer."
            );
            return;
        }

        setLoading(true);
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("User not logged in");

            const { data: setData, error: setError } = await supabase
                .from("flashcard_sets")
                .insert([
                    {
                        user_id: user.user.id,
                        title: title.trim(),
                        subject: subject.trim(),
                        difficulty,
                        description: description.trim() || null,
                    },
                ])
                .select("id")
                .single();

            if (setError) throw setError;

            const cardsToInsert = flashcards.map((f) => ({
                set_id: setData.id,
                question: f.question.trim(),
                answer: f.answer.trim(),
                difficulty: f.difficulty,
            }));

            const { error: cardError } = await supabase
                .from("flashcards")
                .insert(cardsToInsert);

            if (cardError) throw cardError;

            Alert.alert("Success", "Flashcard deck created!");
            router.push("/study-hub/flash-cards");
        } catch (err: any) {
            console.error(err);
            Alert.alert(
                "Error",
                err.message || "Failed to create flashcard deck."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Create Flashcard Deck
                </Text>
                <TouchableOpacity
                    disabled={loading}
                    onPress={handleCreate}
                    style={[
                        styles.saveButton,
                        { backgroundColor: colors.primary },
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="save-outline" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Card Title*
                </Text>
                <TextInput
                    placeholder="Enter card title"
                    placeholderTextColor={colors.border}
                    value={title}
                    onChangeText={setTitle}
                    style={[
                        styles.input,
                        { color: colors.text, backgroundColor: colors.card },
                    ]}
                />

                <DropdownSelect
                    label="Select subject"
                    value={subject}
                    onSelect={setSubject}
                    options={[
                        "Mathematics",
                        "Chemistry",
                        "Physics",
                        "Biology",
                        "Economics",
                        "Computer Science",
                    ]}
                />

                <DropdownSelect
                    label="Select difficulty"
                    value={difficulty}
                    onSelect={setDifficulty}
                    options={["Easy", "Medium", "Hard"]}
                />

                <Text
                    style={[
                        styles.label,
                        { color: colors.text, marginTop: 12 },
                    ]}
                >
                    Description
                </Text>
                <TextInput
                    placeholder="Describe what this card covers"
                    placeholderTextColor={colors.border}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                            backgroundColor: colors.card,
                            minHeight: 80,
                        },
                    ]}
                />

                {/* Flashcards Section */}
                <View style={styles.flashcardHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Flashcards
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.addCardButton,
                            { backgroundColor: colors.card },
                        ]}
                        onPress={addFlashcard}
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={18}
                            color={colors.text}
                        />
                        <Text
                            style={[styles.addCardText, { color: colors.text }]}
                        >
                            Add Card
                        </Text>
                    </TouchableOpacity>
                </View>

                {flashcards.map((card, index) => (
                    <View
                        key={index}
                        style={[
                            styles.cardBox,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.card,
                            },
                        ]}
                    >
                        <View style={styles.cardHeader}>
                            <Text
                                style={[
                                    styles.cardTitle,
                                    { color: colors.text },
                                ]}
                            >
                                Card {index + 1}
                            </Text>
                            {flashcards.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => removeFlashcard(index)}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="red"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={[styles.label, { color: colors.text }]}>
                            Question*
                        </Text>
                        <TextInput
                            placeholder="Enter the question"
                            placeholderTextColor={colors.border}
                            value={card.question}
                            onChangeText={(v) =>
                                updateFlashcard(index, "question", v)
                            }
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    backgroundColor: colors.background,
                                },
                            ]}
                        />

                        <Text style={[styles.label, { color: colors.text }]}>
                            Answer*
                        </Text>
                        <TextInput
                            placeholder="Enter the answer"
                            placeholderTextColor={colors.border}
                            value={card.answer}
                            onChangeText={(v) =>
                                updateFlashcard(index, "answer", v)
                            }
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    backgroundColor: colors.background,
                                },
                            ]}
                        />

                        <DropdownSelect
                            label="Difficulty"
                            value={card.difficulty}
                            onSelect={(v) =>
                                updateFlashcard(index, "difficulty", v)
                            }
                            options={["Easy", "Medium", "Hard"]}
                        />
                    </View>
                ))}

                {/* Submit Button */}
                <TouchableOpacity
                    disabled={loading}
                    onPress={handleCreate}
                    style={[
                        styles.submitButton,
                        { backgroundColor: colors.primary },
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Create Deck</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    saveButton: {
        padding: 8,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    input: {
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
    },
    flashcardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    addCardButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addCardText: {
        marginLeft: 4,
        fontWeight: "500",
    },
    cardBox: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardTitle: {
        fontWeight: "600",
        fontSize: 15,
    },
    submitButton: {
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 8,
        marginBottom: 24,
    },
    submitText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 15,
    },
});
