import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MaterialDetail() {
    const { subject, id } = useLocalSearchParams();

    const book = {
        title: "Advanced Calculus Integration Techniques",
        author: "Dr. Johnson",
        description:
            "Comprehensive guide covering advanced integration techniques including integration by parts, trigonometric, substitution, and partial fractions.",
        views: 3456,
        downloads: 1236,
        tags: ["Mathematics", "PDF"],
        topics: ["Calculus", "Integration"],
        authorDetails: {
            name: "Dr. Johnson",
            role: "Professor of Mathematics",
            date: "2025-08-23",
            image: "https://cdn-icons-png.flaticon.com/512/194/194938.png",
        },
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.subtitle}>by {book.author}</Text>

            <View style={styles.imageCard}>
                <Ionicons name="stats-chart-outline" size={40} color="#555" />
                <TouchableOpacity style={styles.viewButton}>
                    <Ionicons name="eye-outline" size={18} color="#fff" />
                    <Text style={styles.viewText}>View PDF</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tagRow}>
                {book.tags.map((tag, i) => (
                    <View
                        key={i}
                        style={[
                            styles.tag,
                            tag === "PDF" && { backgroundColor: "#111" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.tagText,
                                tag === "PDF" && { color: "#fff" },
                            ]}
                        >
                            {tag}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.statsRow}>
                <Ionicons name="eye-outline" size={14} color="#777" />
                <Text style={styles.statText}>{book.views}</Text>
                <Ionicons
                    name="download-outline"
                    size={14}
                    color="#777"
                    style={{ marginLeft: 8 }}
                />
                <Text style={styles.statText}>{book.downloads}</Text>
            </View>

            <Text style={styles.desc}>{book.description}</Text>

            <View style={styles.topicRow}>
                {book.topics.map((topic, i) => (
                    <View key={i} style={styles.topicTag}>
                        <Text style={styles.topicText}>{topic}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.downloadBtn}>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>

            <View style={styles.authorCard}>
                <Text style={styles.authorHeader}>About the Author</Text>
                <View style={styles.authorRow}>
                    <Image
                        source={{ uri: book.authorDetails.image }}
                        style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.authorName}>
                            {book.authorDetails.name}
                        </Text>
                        <Text style={styles.authorRole}>
                            {book.authorDetails.role}
                        </Text>
                        <Text style={styles.authorDate}>
                            Updated on {book.authorDetails.date}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: "700", color: "#111" },
    subtitle: { color: "#666", marginBottom: 16 },
    imageCard: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        marginBottom: 12,
    },
    viewButton: {
        backgroundColor: "#111",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginTop: 8,
    },
    viewText: { color: "#fff", marginLeft: 6, fontWeight: "500" },
    tagRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
    tag: {
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tagText: { fontSize: 12, color: "#111" },
    statsRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    statText: { color: "#777", fontSize: 13, marginLeft: 4 },
    desc: { color: "#333", marginBottom: 12, lineHeight: 20 },
    topicRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    topicTag: {
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    topicText: { fontSize: 13, color: "#111" },
    downloadBtn: {
        backgroundColor: "#111",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        marginBottom: 20,
    },
    downloadText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
    authorCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 14,
    },
    authorHeader: {
        fontWeight: "700",
        color: "#111",
        marginBottom: 10,
    },
    authorRow: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    authorName: { fontWeight: "600", color: "#111" },
    authorRole: { color: "#666" },
    authorDate: { color: "#999", fontSize: 12 },
});
