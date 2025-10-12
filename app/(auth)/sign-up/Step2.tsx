import GraduationCapIcon from "@/components/icons/GraduationCap";
import { useTheme } from "@react-navigation/native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
    role: "Student" | "Administrator" | null;
    fullName: string;
    setFullName: (v: string) => void;
    studentId: string;
    setStudentId: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    errors: {
        fullName?: string;
        studentId?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    };
    setErrors: React.Dispatch<
        React.SetStateAction<{
            fullName?: string;
            studentId?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        }>
    >;
    back: () => void;
    next: () => void;
};

export default function Step2({
    role,
    fullName,
    setFullName,
    studentId,
    setStudentId,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    setErrors,
    back,
    next,
}: Props) {
    const theme = useTheme();

    return (
        <ScrollView contentContainerStyle={styles.stepContainer}>
            <View style={styles.logoContainer}>
                <View
                    style={{
                        alignItems: "center",
                        backgroundColor: theme.colors.card,
                        borderRadius: 100,
                        padding: 20,
                    }}
                >
                    <GraduationCapIcon
                        width={60}
                        height={60}
                        color={theme.colors.text}
                    />
                </View>
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
                Join Campus Circle
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                Fill in your information
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Full Name
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: errors.fullName
                                ? "red"
                                : theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.border}
                    value={fullName}
                    onChangeText={(text) => {
                        setFullName(text);
                        if (errors.fullName)
                            setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                />
                {errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
            </View>

            {/* Student ID */}
            {role === "Student" && (
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Student ID
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                borderColor: errors.studentId
                                    ? "red"
                                    : theme.colors.text,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder="Enter your student ID"
                        placeholderTextColor={theme.colors.border}
                        value={studentId}
                        onChangeText={(text) => {
                            setStudentId(text);
                            if (errors.studentId)
                                setErrors((prev) => ({
                                    ...prev,
                                    studentId: "",
                                }));
                        }}
                    />
                    {errors.studentId && (
                        <Text style={styles.errorText}>{errors.studentId}</Text>
                    )}
                </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Email Address
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: errors.email
                                ? "red"
                                : theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.colors.border}
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email)
                            setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Password
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: errors.password
                                ? "red"
                                : theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Enter password"
                    placeholderTextColor={theme.colors.border}
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password)
                            setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    secureTextEntry
                />
                {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Confirm Password
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: errors.confirmPassword
                                ? "red"
                                : theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Confirm password"
                    placeholderTextColor={theme.colors.border}
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword)
                            setErrors((prev) => ({
                                ...prev,
                                confirmPassword: "",
                            }));
                    }}
                    secureTextEntry
                />
                {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                        {errors.confirmPassword}
                    </Text>
                )}
            </View>

            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        { borderColor: theme.colors.text },
                    ]}
                    onPress={back}
                >
                    <Text style={{ color: theme.colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={next}
                >
                    <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    stepContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    logoContainer: { alignItems: "center", marginBottom: 10, padding: 20 },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center" },
    input: { width: "100%", borderWidth: 1, borderRadius: 10, padding: 15 },
    inputGroup: { width: "100%", marginBottom: 15 },
    label: { marginBottom: 5, fontWeight: "500" },
    errorText: { color: "red", marginTop: 5, fontSize: 12 },
    navigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginTop: 10,
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
    continueButton: {
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
    continueText: { color: "#fff", fontWeight: "600" },
});
