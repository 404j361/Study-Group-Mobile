import GraduationCapIcon from "@/components/icons/GraduationCap";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignIn() {
    const router = useRouter();
    const { colors } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Error states
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");

    const handleSignIn = async () => {
        setEmailError("");
        setPasswordError("");
        setGeneralError("");

        if (!email) {
            setEmailError("Email is required");
            return;
        }

        if (!password) {
            setPasswordError("Password is required");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("Invalid login")) {
                    setGeneralError("Incorrect email or password");
                } else {
                    setGeneralError(error.message);
                }
                setLoading(false);
                return;
            }

            if (data.user) {
                if (!data.session) {
                    setGeneralError(
                        "Please verify your email before logging in."
                    );
                    setLoading(false);
                    return;
                }

                // Successful login, redirect
                router.replace("/"); // Change "/" to your main screen
            }
        } catch (err) {
            setGeneralError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View
                            style={{
                                alignItems: "center",
                                backgroundColor: colors.card,
                                borderRadius: 100,
                                padding: 20,
                            }}
                        >
                            <GraduationCapIcon
                                width={60}
                                height={60}
                                color={colors.text}
                            />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.text }]}>
                        Welcome Back
                    </Text>
                    <Text
                        style={[styles.subtitle, { color: colors.text + "99" }]}
                    >
                        Sign in to your Campus Circle Account
                    </Text>
                </View>

                {/* Email Input */}
                <View style={styles.inputWrapper}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Email Address
                    </Text>
                    <View
                        style={[
                            styles.inputContainer,
                            { borderColor: emailError ? "red" : colors.border },
                        ]}
                    >
                        <Feather
                            name="mail"
                            size={20}
                            color={colors.text + "99"}
                            style={styles.icon}
                        />
                        <TextInput
                            placeholder="Enter your email"
                            placeholderTextColor={colors.text + "99"}
                            style={[styles.input, { color: colors.text }]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {emailError ? (
                        <Text style={[styles.errorText, { color: "red" }]}>
                            {emailError}
                        </Text>
                    ) : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Password
                    </Text>
                    <View
                        style={[
                            styles.inputContainer,
                            {
                                borderColor: passwordError
                                    ? "red"
                                    : colors.border,
                            },
                        ]}
                    >
                        <Feather
                            name="lock"
                            size={20}
                            color={colors.text + "99"}
                            style={styles.icon}
                        />
                        <TextInput
                            placeholder="Enter your password"
                            placeholderTextColor={colors.text + "99"}
                            style={[styles.input, { color: colors.text }]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Feather
                                name={showPassword ? "eye" : "eye-off"}
                                size={20}
                                color={colors.text + "99"}
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? (
                        <Text style={[styles.errorText, { color: "red" }]}>
                            {passwordError}
                        </Text>
                    ) : null}
                </View>

                {/* General Error */}
                {generalError ? (
                    <Text
                        style={[
                            styles.errorText,
                            { color: "red", textAlign: "center" },
                        ]}
                    >
                        {generalError}
                    </Text>
                ) : null}

                {/* Sign In Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSignIn}
                    disabled={loading}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            { color: colors.background },
                        ]}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                    <Text style={{ color: colors.text + "99" }}>
                        Don&apos;t have an account?{" "}
                    </Text>
                    <Link href="/sign-up" style={{ marginLeft: 5 }}>
                        <Text style={{ fontWeight: "600", color: colors.text }}>
                            Sign Up
                        </Text>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 30,
        justifyContent: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
        padding: 20,
    },
    label: {
        fontSize: 15,
        marginBottom: 5,
        fontWeight: "400",
    },
    title: {
        fontSize: 28,
        fontWeight: "400",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 40,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    eyeIcon: {
        marginLeft: "auto",
    },
    input: {
        flex: 1,
        height: "100%",
    },
    errorText: {
        fontSize: 16,
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 16,
    },
    signUpContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
});
