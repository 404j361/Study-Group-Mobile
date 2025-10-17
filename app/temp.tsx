import Welcome from "@/components/Welcome";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SessionContext } from "./_layout"; // adjust path if necessary

export default function IndexScreen() {
    const theme = useTheme();
    const session = useContext(SessionContext);

    const user = session?.user ?? null;

    if (!user) {
        return <Welcome />;
    }

    async function signOut() {
        await supabase.auth.signOut();
        router.replace("/sign-in");
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Text style={[styles.text, { color: theme.colors.text }]}>
                {`Welcome back, ${user.email}`}
            </Text>
            <TouchableOpacity onPress={signOut} style={{ marginTop: 20 }}>
                <Text style={{ color: theme.colors.primary }}>Sign Out</Text>
            </TouchableOpacity>
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
