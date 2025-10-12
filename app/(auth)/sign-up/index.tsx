import BooksIcon from "@/components/icons/BooksIcon";
import GraduationCapIcon from "@/components/icons/GraduationCap";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const interestsList = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Business",
    "Economics",
    "Psychology",
    "Literature",
    "Art & Design",
    "Music",
    "Law",
    "Medicine",
];

export default function SignUp() {
    const theme = useTheme();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"Student" | "Administrator" | null>(null);
    const [fullName, setFullName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [passwordError, setPasswordError] = useState("");

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(
                selectedInterests.filter((i) => i !== interest)
            );
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleContinueStep2 = () => {
        // Check required fields
        if (!fullName.trim()) {
            setPasswordError("Full Name is required");
            return;
        }

        if (role === "Student" && !studentId.trim()) {
            setPasswordError("Student ID is required");
            return;
        }

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setPasswordError("Valid Email is required");
            return;
        }

        if (!password) {
            setPasswordError("Password is required");
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setPasswordError(""); // clear any previous error
        setStep(3);
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
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
                Create your account to get started
            </Text>
            <TouchableOpacity
                style={[
                    styles.roleButton,
                    { borderColor: theme.colors.text },
                    role === "Student" && {
                        backgroundColor: theme.colors.primary,
                    },
                ]}
                onPress={() => setRole("Student")}
            >
                <Text
                    style={[
                        styles.roleText,
                        {
                            color:
                                role === "Student" ? "#fff" : theme.colors.text,
                        },
                    ]}
                >
                    Student
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.roleButton,
                    { borderColor: theme.colors.text },
                    role === "Administrator" && {
                        backgroundColor: theme.colors.primary,
                    },
                ]}
                onPress={() => setRole("Administrator")}
            >
                <Text
                    style={[
                        styles.roleText,
                        {
                            color:
                                role === "Administrator"
                                    ? "#fff"
                                    : theme.colors.text,
                        },
                    ]}
                >
                    Administrator
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => role && setStep(2)}
                disabled={!role}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
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
                            borderColor: theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.border}
                    value={fullName}
                    onChangeText={setFullName}
                />
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
                                borderColor: theme.colors.text,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder="Enter your student ID"
                        placeholderTextColor={theme.colors.border}
                        value={studentId}
                        onChangeText={setStudentId}
                    />
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
                            borderColor: theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.colors.border}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
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
                            borderColor: theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Enter password"
                    placeholderTextColor={theme.colors.border}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
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
                            borderColor: theme.colors.text,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Confirm password"
                    placeholderTextColor={theme.colors.border}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
            </View>

            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        { borderColor: theme.colors.text },
                    ]}
                    onPress={() => setStep(1)}
                >
                    <Text style={{ color: theme.colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleContinueStep2}
                >
                    <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderStep3 = () => (
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
                    <BooksIcon
                        width={60}
                        height={60}
                        color={theme.colors.text}
                    />
                </View>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Academic Interests
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                Choose your areas of study
            </Text>
            <View style={styles.interestsContainer}>
                {interestsList.map((interest) => (
                    <TouchableOpacity
                        key={interest}
                        style={[
                            styles.interestButtonGrid,
                            { borderColor: theme.colors.text },
                            selectedInterests.includes(interest) && {
                                backgroundColor: theme.colors.primary,
                            },
                        ]}
                        onPress={() => toggleInterest(interest)}
                    >
                        <Text
                            style={[
                                styles.interestText,
                                {
                                    color: selectedInterests.includes(interest)
                                        ? "#fff"
                                        : theme.colors.text,
                                },
                            ]}
                        >
                            {interest}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        { borderColor: theme.colors.text },
                    ]}
                    onPress={() => setStep(2)}
                >
                    <Text style={{ color: theme.colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => alert("Sign Up Complete!")}
                >
                    <Text style={styles.continueText}>Complete</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
        padding: 20,
    },
    stepContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: "center",
    },
    roleButton: {
        width: "80%",
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
    },
    roleText: { fontWeight: "500" },
    continueButton: {
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
    continueText: { color: "#fff", fontWeight: "600" },
    input: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
    },
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
    interestsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between", // ensures two items fit nicely per row
        marginTop: 10,
    },
    interestButtonGrid: {
        width: "48%", // roughly two items per row
        paddingVertical: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 10,
        alignItems: "center",
    },
    interestButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 20,
        margin: 5,
    },
    interestText: { fontWeight: "500" },
});
