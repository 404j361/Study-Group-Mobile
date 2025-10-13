import CheckMark from "@/components/icons/CheckMarkIcon";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Complete() {
    const theme = useTheme();

    const handleGetStarted = () => {
        router.replace("/");
    };

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.card },
                ]}
            >
                <CheckMark color={theme.colors.text} />
            </View>
            <Text style={[styles.text, { color: theme.colors.text }]}>
                You’re verified! {"\n"} Let’s get started on your study journey!
            </Text>

            {/* Get Started Button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleGetStarted}
            >
                <Text
                    style={[
                        styles.buttonText,
                        { color: theme.colors.background },
                    ]}
                >
                    Get Started
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 40, // space for button
    },
    text: {
        fontSize: 24,
        fontWeight: "500",
        textAlign: "center",
        marginTop: 20,
        paddingHorizontal: 20,
    },
    iconContainer: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 20,
    },
    button: {
        position: "absolute",
        bottom: 40,
        width: "80%",
        paddingVertical: 15,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
    },
});
