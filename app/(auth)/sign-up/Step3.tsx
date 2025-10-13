// Step3.tsx
import BooksIcon from "@/components/icons/BooksIcon";
import { useTheme } from "@react-navigation/native";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
    interestsList: string[];
    selectedInterests: string[];
    toggleInterest: (interest: string) => void;
    back: () => void;
    complete: () => void;
    isLoading?: boolean;
};

export default function Step3({
    interestsList,
    selectedInterests,
    toggleInterest,
    back,
    complete,
    isLoading,
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
                {interestsList.map((interest) => {
                    const selected = selectedInterests.includes(interest);
                    return (
                        <TouchableOpacity
                            key={interest}
                            style={[
                                styles.interestButtonGrid,
                                { borderColor: theme.colors.text },
                                selected && {
                                    backgroundColor: theme.colors.primary,
                                },
                            ]}
                            onPress={() => toggleInterest(interest)}
                        >
                            <Text
                                style={[
                                    styles.interestText,
                                    {
                                        color: selected
                                            ? "#fff"
                                            : theme.colors.text,
                                    },
                                ]}
                            >
                                {interest}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
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
                        {
                            backgroundColor: theme.colors.primary,
                            opacity: isLoading ? 0.7 : 1,
                        },
                    ]}
                    onPress={complete}
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
    interestsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },
    interestButtonGrid: {
        width: "48%",
        paddingVertical: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 10,
        alignItems: "center",
    },
    interestText: { fontWeight: "500" },
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
