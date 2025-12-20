import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SettingsScreen() {
    const theme = useTheme();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const validatePassword = (password: string) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/;
        return regex.test(password);
    };

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        if (!validatePassword(newPassword)) {
            Alert.alert(
                "Weak Password",
                "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters."
            );
            return;
        }

        setLoading(true);
        try {
            const { data: userData, error: userError } =
                await supabase.auth.getUser();
            if (userError || !userData.user) throw userError;

            const email = userData.user.email!;
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password: currentPassword,
                });

            if (signInError) {
                Alert.alert("Error", "Current password is incorrect.");
                setLoading(false);
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                Alert.alert("Error", updateError.message);
            } else {
                Alert.alert("Success", "Password updated successfully.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/sign-in");
    };

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
                Manage your account and preferences
            </Text>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color="#111"
                    />
                    <Text style={styles.sectionTitle}>Change Password</Text>
                </View>

                {[
                    {
                        label: "Current Password",
                        value: currentPassword,
                        setValue: setCurrentPassword,
                        show: showCurrent,
                        toggle: () => setShowCurrent(!showCurrent),
                    },
                    {
                        label: "New Password",
                        value: newPassword,
                        setValue: setNewPassword,
                        show: showNew,
                        toggle: () => setShowNew(!showNew),
                    },
                    {
                        label: "Confirm New Password",
                        value: confirmPassword,
                        setValue: setConfirmPassword,
                        show: showConfirm,
                        toggle: () => setShowConfirm(!showConfirm),
                    },
                ].map((field, index) => (
                    <View key={index} style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={18}
                            color="#777"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={field.label}
                            placeholderTextColor="#999"
                            secureTextEntry={!field.show}
                            value={field.value}
                            onChangeText={field.setValue}
                        />
                        <TouchableOpacity onPress={field.toggle}>
                            <Ionicons
                                name={
                                    field.show
                                        ? "eye-outline"
                                        : "eye-off-outline"
                                }
                                size={18}
                                color="#777"
                            />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.passwordInfo}>
                    <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color="#777"
                    />
                    <Text style={styles.infoText}>
                        Password must be at least 8 characters long and include
                        uppercase, lowercase, numbers, and special characters.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handlePasswordUpdate}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Updating..." : "Update Password"}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={20} color="#111" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 10 },
    subtitle: { color: "#666", marginBottom: 20 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#eee",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
        color: "#111",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fafafa",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
        color: "#111",
    },
    passwordInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
    },
    infoText: { flex: 1, color: "#777", fontSize: 13, marginLeft: 4 },
    button: {
        backgroundColor: "#111",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    logoutButton: {
        marginTop: 24,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
        marginLeft: 6,
    },
});
