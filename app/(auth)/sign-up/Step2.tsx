import GraduationCapIcon from "@/components/icons/GraduationCap";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ActivityIndicator,
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
    isLoading: boolean;
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
    isLoading,
}: Props) {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
            keyboardShouldPersistTaps="handled"
        >
            {/* Logo */}
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
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Full Name
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            borderColor: errors.fullName
                                ? "red"
                                : theme.colors.border,
                        },
                    ]}
                >
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.text}
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            if (errors.fullName)
                                setErrors((prev) => ({
                                    ...prev,
                                    fullName: "",
                                }));
                        }}
                    />
                </View>
                {errors.fullName && (
                    <Text style={[styles.errorText, { color: "red" }]}>
                        {errors.fullName}
                    </Text>
                )}
            </View>

            {/* Student ID */}
            {role === "Student" && (
                <View style={styles.inputWrapper}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Student ID
                    </Text>
                    <View
                        style={[
                            styles.inputContainer,
                            {
                                borderColor: errors.studentId
                                    ? "red"
                                    : theme.colors.border,
                            },
                        ]}
                    >
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="Enter your student ID"
                            placeholderTextColor={theme.colors.text}
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
                    </View>
                    {errors.studentId && (
                        <Text style={[styles.errorText, { color: "red" }]}>
                            {errors.studentId}
                        </Text>
                    )}
                </View>
            )}

            {/* Email */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Email Address
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            borderColor: errors.email
                                ? "red"
                                : theme.colors.border,
                        },
                    ]}
                >
                    <Feather
                        name="mail"
                        size={20}
                        color={theme.colors.text}
                        style={styles.icon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.text}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                {errors.email && (
                    <Text style={[styles.errorText, { color: "red" }]}>
                        {errors.email}
                    </Text>
                )}
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Password
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            borderColor: errors.password
                                ? "red"
                                : theme.colors.border,
                        },
                    ]}
                >
                    <Feather
                        name="lock"
                        size={20}
                        color={theme.colors.text}
                        style={styles.icon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder="Enter password"
                        placeholderTextColor={theme.colors.text}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password)
                                setErrors((prev) => ({
                                    ...prev,
                                    password: "",
                                }));
                        }}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Feather
                            name={showPassword ? "eye" : "eye-off"}
                            size={20}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>
                {errors.password && (
                    <Text style={[styles.errorText, { color: "red" }]}>
                        {errors.password}
                    </Text>
                )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    Confirm Password
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            borderColor: errors.confirmPassword
                                ? "red"
                                : theme.colors.border,
                        },
                    ]}
                >
                    <Feather
                        name="lock"
                        size={20}
                        color={theme.colors.text}
                        style={styles.icon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder="Confirm password"
                        placeholderTextColor={theme.colors.text}
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword)
                                setErrors((prev) => ({
                                    ...prev,
                                    confirmPassword: "",
                                }));
                        }}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={styles.eyeIcon}
                    >
                        <Feather
                            name={showConfirmPassword ? "eye" : "eye-off"}
                            size={20}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                    <Text style={[styles.errorText, { color: "red" }]}>
                        {errors.confirmPassword}
                    </Text>
                )}
            </View>

            {/* Navigation Buttons */}
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
                        {
                            backgroundColor: theme.colors.primary,
                            opacity: isLoading ? 0.7 : 1,
                        },
                    ]}
                    onPress={next}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.continueText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    logoContainer: { alignItems: "center", marginBottom: 20 },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center" },
    inputWrapper: { marginBottom: 15 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 50,
    },
    icon: { marginRight: 10 },
    eyeIcon: { marginLeft: "auto" },
    input: { flex: 1, height: "100%" },
    label: { fontSize: 15, marginBottom: 5 },
    errorText: { fontSize: 12, marginTop: 5 },
    navigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    backButton: {
        paddingVertical: 15,
        borderWidth: 1,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
    continueButton: {
        paddingVertical: 15,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
    continueText: { color: "#fff", fontWeight: "600" },
});
