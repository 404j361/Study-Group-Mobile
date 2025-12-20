import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native"; // ← THEME
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function NotificationSettingSheet({
    visible,
    onClose,
    onSaved,
}) {
    const theme = useTheme(); // ← USE EXISTING THEME (NO CUSTOM HOOK)

    const [settings, setSettings] = useState(null);
    const defaultSettings = {
        study_reminders: true,
        group_updates: true,
        material_updates: true,
        forum_replies: true,
    };

    const getUserId = async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) return null;
            return data?.user?.id ?? null;
        } catch {
            return null;
        }
    };

    const fetchSettings = async () => {
        const userId = await getUserId();
        if (!userId) {
            setSettings(defaultSettings);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("notification_settings")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error && error.code === "PGRST116") {
                const { data: insertData } = await supabase
                    .from("notification_settings")
                    .insert([{ user_id: userId, ...defaultSettings }]);

                setSettings(insertData?.[0] || defaultSettings);
            } else {
                setSettings(data || defaultSettings);
            }
        } catch {
            setSettings(defaultSettings);
        }
    };

    const updateSetting = async (key, value) => {
        const userId = await getUserId();
        if (!userId) {
            Alert.alert("Not signed in", "Sign in to update settings.");
            return;
        }

        try {
            const { error } = await supabase
                .from("notification_settings")
                .upsert(
                    { user_id: userId, [key]: value, updated_at: new Date() },
                    { onConflict: "user_id" }
                );

            if (error) {
                Alert.alert("Error", "Could not save setting.");
            } else {
                setSettings((prev) => ({
                    ...(prev || defaultSettings),
                    [key]: value,
                }));
                onSaved?.();
            }
        } catch {}
    };

    useEffect(() => {
        if (visible) fetchSettings();
    }, [visible]);

    if (!visible || !settings) return null;

    const settingLabels = {
        study_reminders: "Study Reminders",
        group_updates: "Group Updates",
        material_updates: "Material Updates",
        forum_replies: "Forum Replies",
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            {/* BACKDROP */}
            <TouchableOpacity
                style={[
                    styles.backdrop,
                    { backgroundColor: theme.colors.border + "66" },
                ]}
                onPress={onClose}
            />

            {/* SHEET */}
            <View
                style={[styles.sheet, { backgroundColor: theme.colors.card }]}
            >
                <View
                    style={[
                        styles.dragLine,
                        { backgroundColor: theme.colors.border },
                    ]}
                />

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Notification Settings
                    </Text>

                    <TouchableOpacity onPress={onClose}>
                        <Ionicons
                            name="close"
                            size={22}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {Object.entries(settingLabels).map(([key, label]) => (
                    <View
                        key={key}
                        style={[
                            styles.row,
                            { borderBottomColor: theme.colors.border },
                        ]}
                    >
                        <Text
                            style={[styles.label, { color: theme.colors.text }]}
                        >
                            {label}
                        </Text>

                        <Switch
                            value={!!settings[key]}
                            onValueChange={(v) => updateSetting(key, v)}
                        />
                    </View>
                ))}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        padding: 20,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    dragLine: {
        width: 40,
        height: 5,
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 14,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    label: {
        fontSize: 15,
    },
});
