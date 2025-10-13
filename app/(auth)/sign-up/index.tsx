// index.tsx
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { supabase } from "@/lib/supabase";
import Complete from "./Complete";
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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

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

    const handleCompleteStep2 = async () => {
        setIsLoading(true);
        const newErrors: typeof errors = {};

        // Basic validation
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
            setIsLoading(false);
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            // Register user in Auth + DB
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            fullName,
                            role,
                            studentId: role === "Student" ? studentId : null,
                        },
                    },
                });

            if (authError) {
                setErrors((prev) => ({ ...prev, email: authError.message }));
                return;
            }

            // Insert user into DB
            const { data: dbData, error: dbError } = await supabase
                .from("users")
                .insert([
                    {
                        id: authData.user?.id,
                        fullName,
                        role: role === "Student" ? "student" : "admin",
                        studentId: role === "Student" ? studentId : null,
                        email,
                    },
                ]);

            if (dbError) {
                setErrors((prev) => ({ ...prev, email: dbError.message }));
                return;
            }

            setStep(3);
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteStep3 = async () => {
        setIsLoading(true);
        try {
            const user = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("users")
                .update({ interests: selectedInterests })
                .eq("id", user.data.user?.id);

            if (error) {
                return;
            }

            // Redirect to register-success page
            // If using react-navigation:
            // navigation.navigate("RegisterSuccess");
            setIsCompleted(true);
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCompleted) return <Complete />;

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
                            next={handleCompleteStep2}
                            setErrors={setErrors}
                            isLoading={isLoading}
                        />
                    )}
                    {step === 3 && (
                        <Step3
                            interestsList={interestsList}
                            selectedInterests={selectedInterests}
                            toggleInterest={toggleInterest}
                            back={() => setStep(2)}
                            complete={handleCompleteStep3}
                            isLoading={isLoading}
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
