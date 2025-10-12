import Welcome from "@/components/Welcome";
import { useTheme } from "@react-navigation/native";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
    const theme = useTheme(); // ✅ get theme colors
    const user = null; // to replace with actual user authentication logic

    if (!user) {
        return <Welcome />;
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Text style={[styles.text, { color: theme.colors.text }]}>
                Index screen
            </Text>
            <Link
                href="/about"
                style={[styles.button, { color: theme.colors.primary }]}
            >
                Go to About screen!
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
    },
    button: {
        fontSize: 20,
        textDecorationLine: "underline",
        marginTop: 10,
    },
});
