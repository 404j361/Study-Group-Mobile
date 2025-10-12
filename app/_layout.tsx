import { useEffect, useState } from "react";
import "react-native-reanimated";

import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { router, Stack } from "expo-router";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import Loading from "../components/Loading";

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
    useTheme,
} from "@react-navigation/native";

export default function RootLayout() {
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    // ✅ Get system theme ("light" / "dark")
    const colorScheme = useColorScheme();

    // ✅ Pick built-in theme
    const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    async function signOut() {
        await supabase.auth.signOut();
        setSession(null);
        router.replace("/sign-in");
    }

    // ✅ Wrap everything in ThemeProvider
    return (
        <ThemeProvider value={theme}>
            {isLoading ? (
                <Loading />
            ) : session?.user ? (
                <AuthenticatedView
                    email={session.user.email}
                    onSignOut={signOut}
                />
            ) : (
                <UnauthenticatedStack />
            )}
        </ThemeProvider>
    );
}

// ✅ Authenticated UI (uses theme colors automatically)
function AuthenticatedView({
    email,
    onSignOut,
}: {
    email?: string | null;
    onSignOut: () => void;
}) {
    const theme = useTheme();

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.background,
            }}
        >
            <Text style={{ color: theme.colors.text }}>
                {`Welcome back, ${email}`}
            </Text>
            <TouchableOpacity onPress={onSignOut} style={{ marginTop: 20 }}>
                <Text style={{ color: theme.colors.primary }}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

// ✅ Public screens stack
function UnauthenticatedStack() {
    const theme = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
            </Stack>
        </View>
    );
}
