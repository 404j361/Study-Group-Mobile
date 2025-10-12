// Step1.tsx
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import GraduationCapIcon from "@/components/icons/GraduationCap";
import ShieldIcon from "@/components/icons/ShieldIcon";

import type { Role } from "./index";

type Props = {
    role: Role;
    setRole: (r: Role) => void;
    next: () => void;
};

export default function Step1({ role, setRole, next }: Props) {
    const theme = useTheme();

    return (
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
                <GraduationCapIcon
                    width={60}
                    height={60}
                    color={role === "Student" ? "#fff" : theme.colors.text}
                />
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
                <ShieldIcon
                    width={60}
                    height={60}
                    color={
                        role === "Administrator" ? "#fff" : theme.colors.text
                    }
                />
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
                    { backgroundColor: theme.colors.primary, width: "100%" },
                ]}
                onPress={next}
                disabled={!role}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    stepContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 10,
        padding: 20,
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
        minWidth: "100%",
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
    },
    roleText: { fontWeight: "500", marginTop: 8 },
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
