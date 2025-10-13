import { createContext, useEffect, useState } from "react";
import "react-native-reanimated";

import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import Loading from "../components/Loading";

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";

// ✅ Create a context for session (optional)
export const SessionContext = createContext<Session | null>(null);

export default function RootLayout() {
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

    useEffect(() => {
        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        // Subscribe to auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    if (isLoading) return <Loading />;

    return (
        <ThemeProvider value={theme}>
            <SessionContext.Provider value={session}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                </Stack>
            </SessionContext.Provider>
        </ThemeProvider>
    );
}
