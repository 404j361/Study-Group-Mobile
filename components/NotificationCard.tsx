// components/NotificationCard.tsx
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

dayjs.extend(relativeTime);

export default function NotificationCard({ item }) {
    if (!item) return null;

    const icons = {
        study_reminder: "calendar-outline",
        material_update: "book-outline",
        group_message: "chatbubble-ellipses-outline",
        forum_reply: "chatbubble-outline",
        default: "notifications-outline",
    };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            // TODO: add navigation: onPress => navigate to item.link
            onPress={() => {
                if (item.link) {
                    console.log("TODO: navigate to", item.link);
                }
            }}
        >
            <View style={styles.row}>
                <Ionicons
                    name={icons[item.type] || icons.default}
                    size={24}
                    color="#444"
                />

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>

                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={14} color="#999" />
                        <Text style={styles.time}>
                            {dayjs(item.created_at).fromNow()}
                        </Text>
                    </View>
                </View>

                {!item.read && <View style={styles.dot} />}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    row: { flexDirection: "row", alignItems: "flex-start" },
    title: { fontWeight: "700", fontSize: 15 },
    message: { color: "#555", marginTop: 6 },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 6,
    },
    time: { color: "#999", fontSize: 12 },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 6,
        backgroundColor: "#111",
        marginLeft: 10,
        marginTop: 4,
    },
});
