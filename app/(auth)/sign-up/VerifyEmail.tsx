// VerifyEmail.tsx
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
    email: string;
    otp: string;
    setOtp: (v: string) => void;
    verify: () => void;
    resend: () => void;
    isLoading: boolean;
    error?: string | null;
    back: () => void;
};

export default function VerifyEmail({
    email,
    otp,
    setOtp,
    verify,
    resend,
    isLoading,
    error,
    back,
}: Props) {
    const theme = useTheme();
    const [countdown, setCountdown] = useState<number>(60);

    useEffect(() => {
        setCountdown(60);
        const t = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(t);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, []); // run once on mount

    const onResend = async () => {
        if (countdown > 0) return;
        await resend();
        setCountdown(60);
        // restart timer
        const t = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(t);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <View
                style={{
                    alignItems: "center",
                    backgroundColor: theme.colors.card,
                    borderRadius: 100,
                    padding: 20,
                    marginBottom: 20,
                }}
            >
                {/* You can replace with an icon */}
                <Text style={{ fontSize: 28 }}>✉️</Text>
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
                Verify Your Email
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                Please enter the verification code sent to
            </Text>
            <Text style={[styles.emailText, { color: theme.colors.text }]}>
                {email}
            </Text>

            <View
                style={[
                    styles.inputContainer,
                    { borderColor: error ? "red" : theme.colors.border },
                ]}
            >
                <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Enter OTP Code"
                    placeholderTextColor={theme.colors.text}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </View>
            {error ? (
                <Text style={[styles.errorText, { color: "red" }]}>
                    {error}
                </Text>
            ) : null}

            <TouchableOpacity
                style={[
                    styles.verifyButton,
                    { backgroundColor: theme.colors.primary },
                    isLoading && { opacity: 0.7 },
                ]}
                onPress={verify}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.verifyButtonText}>Verify Email</Text>
                )}
            </TouchableOpacity>

            <View style={styles.row}>
                <TouchableOpacity
                    onPress={back}
                    style={[
                        styles.backButton,
                        { borderColor: theme.colors.text },
                    ]}
                >
                    <Text style={{ color: theme.colors.text }}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onResend}
                    disabled={countdown > 0}
                    style={[
                        styles.resendButton,
                        {
                            borderColor: theme.colors.text,
                            backgroundColor:
                                countdown > 0
                                    ? "transparent"
                                    : theme.colors.card,
                        },
                    ]}
                >
                    <Text style={{ color: theme.colors.text }}>
                        {countdown > 0
                            ? `Resend code in ${countdown}s`
                            : "Resend code"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: "center",
    },
    emailText: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 50,
        justifyContent: "center",
        marginBottom: 10,
    },
    input: {
        height: "100%",
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginBottom: 8,
    },
    verifyButton: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    verifyButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        marginTop: 8,
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
    resendButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 10,
        width: "48%",
        alignItems: "center",
    },
});
