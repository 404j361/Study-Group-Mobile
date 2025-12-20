import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function StudyMaterials() {
    const theme = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const materials = [
        { title: "Mathematics", count: 45 },
        { title: "Chemistry", count: 20 },
        { title: "Physics", count: 45 },
        { title: "Biology", count: 20 },
        { title: "Computer Science", count: 45 },
        { title: "English", count: 20 },
    ];

    const filtered = materials.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Study Materials</Text>
            <Text style={styles.subtitle}>Explore learning resources</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#777" />
                <TextInput
                    placeholder="Search materials"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
            </View>

            <View style={styles.grid}>
                {filtered.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push(
                                `/study-hub/study-materials/${item.title}`
                            )
                        }
                    >
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>
                            {item.count} Materials
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 10 },
    subtitle: { color: "#666", marginBottom: 16 },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f1f1",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 20,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: "#111" },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#eee",
        width: "48%",
        padding: 16,
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
        marginBottom: 4,
    },
    cardSubtitle: { fontSize: 14, color: "#777" },
});
