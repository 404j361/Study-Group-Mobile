import { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import Loading from "../components/Loading";

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";

// ✅ Create a context for session
export const SessionContext = createContext<Session | null>(null);

export default function RootLayout() {
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const insets = useSafeAreaInsets();

    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

    useEffect(() => {
        // 1️⃣ Fetch existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        // 2️⃣ Subscribe to auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

    // 3️⃣ Show loading screen while fetching session
    if (isLoading) return <Loading />;

    // 4️⃣ Conditionally render stacks based on session
    return (
        <ThemeProvider value={theme}>
            <SessionContext.Provider value={session}>
                {session ? (
                    // ✅ Authenticated user stack
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { paddingTop: insets.top },
                        }}
                    >
                        <Stack.Screen name="(landing)" />
                    </Stack>
                ) : (
                    // ✅ Unauthenticated user stack
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { paddingTop: insets.top },
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                    </Stack>
                )}
            </SessionContext.Provider>
        </ThemeProvider>
    );
}
