import NotificationCard from "@/components/NotificationCard";
import NotificationSettingSheet from "@/components/NotificationSettingSheet";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {
    const theme = useTheme(); // ← THEME HERE

    const [settingsVisible, setSettingsVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef(null);

    const getCurrentUserId = async () => {
        const { data } = await supabase.auth.getUser();
        return data?.user?.id ?? null;
    };

    const fetchNotifications = async () => {
        setLoading(true);

        const userId = await getCurrentUserId();
        if (!userId) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) console.error(error);

        setNotifications(data || []);
        setLoading(false);
    };

    const markAllRead = async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", userId);

        fetchNotifications();
    };

    useEffect(() => {
        fetchNotifications();

        const ch = supabase
            .channel("notifications-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "notifications" },
                async () => fetchNotifications()
            )
            .subscribe();

        channelRef.current = ch;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <View
                style={[
                    styles.center,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <ActivityIndicator size="large" color={theme.colors.text} />
            </View>
        );
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <SafeAreaView
            style={[styles.safe, { backgroundColor: theme.colors.background }]}
            edges={["top"]}
        >
            <View style={[styles.inner]}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text
                            style={[styles.title, { color: theme.colors.text }]}
                        >
                            Notifications
                        </Text>
                        <Text
                            style={[
                                styles.subtitle,
                                { color: theme.colors.text + "99" },
                            ]}
                        >
                            You have {unreadCount} unread notifications
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => setSettingsVisible(true)}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={22}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* MARK ALL READ */}
                {unreadCount > 0 && (
                    <TouchableOpacity
                        onPress={markAllRead}
                        style={styles.markReadBtn}
                    >
                        <Text
                            style={[
                                styles.markReadText,
                                { color: theme.colors.text },
                            ]}
                        >
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                )}

                {/* LIST */}
                <FlatList
                    data={notifications}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <NotificationCard item={item} />}
                    ListEmptyComponent={
                        <View style={{ padding: 20 }}>
                            <Text style={{ color: theme.colors.text + "99" }}>
                                No notifications
                            </Text>
                        </View>
                    }
                />

                {/* SETTINGS SHEET */}
                <NotificationSettingSheet
                    visible={settingsVisible}
                    onClose={() => setSettingsVisible(false)}
                    onSaved={() => fetchNotifications()}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    settingsIcon: {
        padding: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    markReadBtn: {
        alignSelf: "flex-end",
        marginBottom: 12,
    },
    markReadText: {
        fontWeight: "600",
        textDecorationLine: "underline",
        fontSize: 14,
    },
});
