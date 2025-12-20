import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SubjectMaterials() {
    const { subject } = useLocalSearchParams();
    const router = useRouter();

    const mockBooks = Array(5).fill({
        title: "Advanced Calculus Integration Techniques",
        author: "Dr. Johnson",
        views: 3456,
        downloads: 1236,
        tags: ["Mathematics", "PDF"],
    });

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Study Materials</Text>
            <Text style={styles.subtitle}>Explore learning resources</Text>

            <Text style={styles.sectionHeader}>{subject}</Text>

            {mockBooks.map((book, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() =>
                        navigate({
                            pathname:
                                "/study-hub/study-materials/[subject]/[id]",
                            params: {
                                subject: subject as string,
                                id: index.toString(),
                            },
                        })
                    }
                >
                    <View style={styles.row}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="stats-chart-outline"
                                size={22}
                                color="#333"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bookTitle}>{book.title}</Text>
                            <Text style={styles.bookAuthor}>
                                by {book.author}
                            </Text>

                            <View style={styles.tagRow}>
                                {book.tags.map((tag, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.tag,
                                            tag === "PDF" && {
                                                backgroundColor: "#111",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.tagText,
                                                tag === "PDF" && {
                                                    color: "#fff",
                                                },
                                            ]}
                                        >
                                            {tag}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.statsRow}>
                                <Ionicons
                                    name="eye-outline"
                                    size={14}
                                    color="#777"
                                />
                                <Text style={styles.statText}>
                                    {book.views}
                                </Text>
                                <Ionicons
                                    name="download-outline"
                                    size={14}
                                    color="#777"
                                    style={{ marginLeft: 8 }}
                                />
                                <Text style={styles.statText}>
                                    {book.downloads}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 10 },
    subtitle: { color: "#666", marginBottom: 16 },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 14,
        marginBottom: 14,
    },
    row: { flexDirection: "row", alignItems: "flex-start" },
    iconContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 10,
        marginRight: 12,
    },
    bookTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
    bookAuthor: { color: "#777", marginBottom: 8 },
    tagRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
    tag: {
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tagText: { fontSize: 12, color: "#111" },
    statsRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    statText: { color: "#777", fontSize: 13, marginLeft: 4 },
});
