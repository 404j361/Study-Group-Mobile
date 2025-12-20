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
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            if (!user) throw new Error("No user.");

            const email = user.email!;
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

            if (updateError) Alert.alert("Error", updateError.message);
            else {
                Alert.alert("Success", "Password updated successfully.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
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
        >
            {/* TITLE */}
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Settings
            </Text>
            <Text
                style={[styles.subtitle, { color: theme.colors.text + "99" }]}
            >
                Manage your account and preferences
            </Text>

            {/* CARD */}
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <View style={styles.sectionHeader}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={theme.colors.text}
                    />
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        Change Password
                    </Text>
                </View>

                {/* PASSWORD FIELDS */}
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
                    <View
                        key={index}
                        style={[
                            styles.inputContainer,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                            },
                        ]}
                    >
                        <Ionicons
                            name="lock-closed-outline"
                            size={18}
                            color={theme.colors.text + "77"}
                        />
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder={field.label}
                            placeholderTextColor={theme.colors.text + "55"}
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
                                color={theme.colors.text + "77"}
                            />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* PASSWORD INFO */}
                <View
                    style={[
                        styles.passwordInfo,
                        { backgroundColor: theme.colors.border + "33" },
                    ]}
                >
                    <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color={theme.colors.text + "77"}
                    />
                    <Text
                        style={[
                            styles.infoText,
                            { color: theme.colors.text + "88" },
                        ]}
                    >
                        Password must be at least 8 characters long and include
                        uppercase, lowercase, numbers, and special characters.
                    </Text>
                </View>

                {/* UPDATE BUTTON */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: theme.colors.primary,
                            opacity: loading ? 0.7 : 1,
                        },
                    ]}
                    onPress={handlePasswordUpdate}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Updating..." : "Update Password"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* LOGOUT BUTTON */}
            <TouchableOpacity
                style={[
                    styles.logoutButton,
                    {
                        borderColor: theme.colors.border,
                    },
                ]}
                onPress={handleLogout}
            >
                <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={theme.colors.text}
                />
                <Text style={[styles.logoutText, { color: theme.colors.text }]}>
                    Logout
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", marginTop: 10 },
    subtitle: { marginBottom: 20 },
    card: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
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
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
    },
    passwordInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
    },
    infoText: { flex: 1, fontSize: 13, marginLeft: 4 },
    button: {
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    logoutButton: {
        marginTop: 24,
        borderWidth: 1,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 6,
    },
});
