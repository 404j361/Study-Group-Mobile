import Welcome from "@/components/Welcome";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { SessionContext } from "../_layout";

export default function LandingLayout() {
    const session = useContext(SessionContext);
    const user = session?.user ?? null;
    const [userFromDb, setUserFromDb] = useState<any>(null);

    useEffect(() => {
        async function fetchUser() {
            if (user) {
                const { data } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setUserFromDb(data);
            }
        }
        fetchUser();
    }, [user]);

    useEffect(() => {
        if (userFromDb && userFromDb.role === "admin") {
            router.replace("/(admin)/home");
        }
    }, [userFromDb]);

    if (!user || !userFromDb) {
        return <Welcome />;
    }

    return (
        <>
            {userFromDb?.role === "student" ? (
                <Tabs
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: "Home",
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={
                                        focused ? "home-sharp" : "home-outline"
                                    }
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="study-hub"
                        options={{
                            title: "Study Hub",
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={
                                        focused ? "book-sharp" : "book-outline"
                                    }
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="progress"
                        options={{
                            title: "Progress",
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? "trending-up-sharp"
                                            : "trending-up-outline"
                                    }
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: "Profile",
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? "person-sharp"
                                            : "person-outline"
                                    }
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="notification"
                        options={{
                            href: null,
                        }}
                    />
                </Tabs>
            ) : null}
        </>
    );
}
