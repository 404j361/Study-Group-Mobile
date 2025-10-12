// index.tsx
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

export type Role = "Student" | "Administrator" | null;

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

export default function SignUpIndex() {
    const theme = useTheme();

    // Step control
    const [step, setStep] = useState<number>(1);

    // Form state
    const [role, setRole] = useState<Role>(null);
    const [fullName, setFullName] = useState<string>("");
    const [studentId, setStudentId] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // Per-field error state
    const [errors, setErrors] = useState<{
        fullName?: string;
        studentId?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

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
        const newErrors: typeof errors = {};

        if (!fullName.trim()) newErrors.fullName = "Full Name is required";
        if (role === "Student" && !studentId.trim())
            newErrors.studentId = "Student ID is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email))
            newErrors.email = "Email is invalid";

        if (!password.trim()) newErrors.password = "Password is required";
        if (!confirmPassword.trim())
            newErrors.confirmPassword = "Confirm Password is required";
        if (password && confirmPassword && password !== confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // stop navigation
        }

        setErrors({});
        setStep(3);
    };

    const handleComplete = () => {
        Alert.alert("Sign Up Complete!", `Welcome ${fullName}`);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.stepContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[
                        styles.container,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    {step === 1 && (
                        <Step1
                            role={role}
                            setRole={setRole}
                            next={() => role && setStep(2)}
                        />
                    )}
                    {step === 2 && (
                        <Step2
                            role={role}
                            fullName={fullName}
                            setFullName={setFullName}
                            studentId={studentId}
                            setStudentId={setStudentId}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                            errors={errors}
                            back={() => setStep(1)}
                            next={handleContinueStep2}
                            setErrors={setErrors}
                        />
                    )}
                    {step === 3 && (
                        <Step3
                            interestsList={interestsList}
                            selectedInterests={selectedInterests}
                            toggleInterest={toggleInterest}
                            back={() => setStep(2)}
                            complete={handleComplete}
                        />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    stepContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
