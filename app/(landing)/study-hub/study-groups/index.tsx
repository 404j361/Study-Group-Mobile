import { styles } from "@/components/landing/study-hub/study-group/styles";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const myGroups = [
    {
        id: 1,
        title: "Advanced Calculus Study Group",
        description: "Working through complex derivatives and integrals",
        tag: "Mathematics",
        members: "10/15 members",
    },
    {
        id: 2,
        title: "Data Structures & Algorithms",
        description: "Coding practices and algorithm optimization",
        tag: "Computer Science",
        members: "9/15 members",
    },
    {
        id: 3,
        title: "Organic Chemistry Prep",
        description: "Preparing for upcoming midterm exam",
        tag: "Chemistry",
        members: "8/15 members",
    },
];

const discoverGroups = [
    {
        id: 4,
        title: "Physics Exam Prep",
        description: "Focus on kinematics and electricity",
        tag: "Physics",
        members: "12/20 members",
    },
    {
        id: 5,
        title: "English Literature Review",
        description: "Discussing Shakespeare and poetry analysis",
        tag: "Literature",
        members: "7/15 members",
    },
];

export default function StudyGroups() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<"my" | "discover">("my");

    const groupsToRender = activeTab === "my" ? myGroups : discoverGroups;

    return (
        <ScrollView
            style={{
                ...styles.container,
                backgroundColor: theme.colors.background,
            }}
        >
            {/* HEADER */}
            <View style={styles.headerContainer}>
                <View style={styles.headerSubContainer}>
                    <Link style={{ marginTop: 5 }} href={"/study-hub"}>
                        <Ionicons
                            name="arrow-back"
                            color={theme.colors.text}
                            size={20}
                        />
                    </Link>
                    <View>
                        <Text
                            style={{
                                ...styles.title,
                                color: theme.colors.text,
                            }}
                        >
                            Study Groups
                        </Text>
                        <Text
                            style={{
                                ...styles.content,
                                color: theme.colors.text,
                            }}
                        >
                            Connect and learn together
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: theme.colors.text,
                            paddingLeft: 10,
                            paddingRight: 10,
                            flexDirection: "row",
                        },
                    ]}
                >
                    <Ionicons
                        name="add"
                        color={theme.colors.background}
                        size={20}
                    />
                    <Text
                        style={[
                            styles.buttonText,
                            { color: theme.colors.background },
                        ]}
                    >
                        Create Group
                    </Text>
                </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <TextInput
                placeholder="Search groups"
                placeholderTextColor={theme.colors.text + "80"}
                style={{
                    backgroundColor: theme.colors.card,
                    padding: 12,
                    borderRadius: 8,
                    marginHorizontal: 16,
                    marginTop: 10,
                    color: theme.colors.text,
                }}
            />

            {/* TABS */}
            <View
                style={{
                    flexDirection: "row",
                    marginTop: 15,
                    marginHorizontal: 16,
                    padding: 4,
                    backgroundColor: theme.colors.border,
                    borderRadius: 8,
                    overflow: "hidden",
                }}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        backgroundColor:
                            activeTab === "my"
                                ? theme.colors.background
                                : "transparent",
                        alignItems: "center",
                        borderRadius: 8,
                    }}
                    onPress={() => setActiveTab("my")}
                >
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontWeight: "600",
                        }}
                    >
                        My Groups ({myGroups.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        backgroundColor:
                            activeTab === "discover"
                                ? theme.colors.background
                                : "transparent",
                        alignItems: "center",
                        borderRadius: 8,
                    }}
                    onPress={() => setActiveTab("discover")}
                >
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontWeight: "600",
                        }}
                    >
                        Discover
                    </Text>
                </TouchableOpacity>
            </View>

            {/* GROUP CARDS (based on active tab) */}
            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                {groupsToRender.map((group) => (
                    <View
                        key={group.id}
                        style={{
                            backgroundColor: theme.colors.card,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: theme.colors.text,
                            }}
                        >
                            {group.title}
                        </Text>
                        <Text
                            style={{
                                marginTop: 4,
                                color: theme.colors.text,
                                opacity: 0.7,
                            }}
                        >
                            {group.description}
                        </Text>

                        {/* TAG */}
                        <View
                            style={{
                                marginTop: 8,
                                alignSelf: "flex-start",
                                backgroundColor: theme.colors.background,
                                paddingVertical: 4,
                                paddingHorizontal: 10,
                                borderRadius: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: theme.colors.text,
                                }}
                            >
                                {group.tag}
                            </Text>
                        </View>

                        {/* MEMBERS */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 8,
                            }}
                        >
                            <Ionicons
                                name="people"
                                size={16}
                                color={theme.colors.text}
                            />
                            <Text
                                style={{
                                    marginLeft: 6,
                                    color: theme.colors.text,
                                    opacity: 0.7,
                                }}
                            >
                                {group.members}
                            </Text>
                        </View>

                        {/* CHAT BUTTON */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: theme.colors.text,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.colors.background,
                                    fontWeight: "600",
                                }}
                            >
                                Chat
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
