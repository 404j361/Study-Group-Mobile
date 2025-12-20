import ForumIcon from "@/components/icons/FormIcon";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={"home-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="forum"
                options={{
                    title: "Forum",
                    tabBarIcon: ({ color }) => <ForumIcon color={color} />,
                }}
            />
            <Tabs.Screen
                name="study-groups"
                options={{
                    title: "Study Group",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "book-sharp" : "book-outline"}
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
                            name={"person-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
