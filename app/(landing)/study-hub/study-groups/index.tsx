import AddPeopleIcon from "@/components/icons/AddPeopleIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import { getMyStudyGroups } from "@/components/landing/study-hub/study-group/_functions/study-group";
import { styles } from "@/components/landing/study-hub/study-group/styles";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
    {
        id: 4,
        title: "Physics Study Group",
        description: "Weekly discussions and problem solving",
        tag: "Physics",
        members: "11/15 members",
    },
];

const discoverGroups = [
    {
        id: 5,
        title: "Physics Exam Prep",
        description: "Focus on kinematics and electricity",
        tag: "Physics",
        members: "12/20 members",
    },
    {
        id: 6,
        title: "English Literature Review",
        description: "Discussing Shakespeare and poetry analysis",
        tag: "Literature",
        members: "7/15 members",
    },
];

export default function StudyGroups() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMyGroups = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return myGroups.filter(
            (group) =>
                group.title.toLowerCase().includes(query) ||
                group.description.toLowerCase().includes(query) ||
                group.tag.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const filteredDiscoverGroups = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return discoverGroups.filter(
            (group) =>
                group.title.toLowerCase().includes(query) ||
                group.description.toLowerCase().includes(query) ||
                group.tag.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    useEffect(() => {
        getMyStudyGroups().then((groups) => {
            console.log("Fetched my study groups:", groups);
        });
    }, []);

    return (
        <View
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

                <Link href="/study-hub/study-groups/create">
                    <View
                        style={[
                            styles.button,
                            {
                                backgroundColor: theme.colors.text,
                                paddingLeft: 10,
                                paddingRight: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
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
                    </View>
                </Link>
            </View>

            {/* 🔍 SEARCH */}
            <TextInput
                placeholder="Search groups"
                placeholderTextColor={theme.colors.text + "80"}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                    backgroundColor: theme.colors.card,
                    padding: 12,
                    borderRadius: 8,
                    marginHorizontal: 16,
                    marginTop: 10,
                    color: theme.colors.text,
                }}
            />

            {/* 🗂️ TABS */}
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

            {/* 📋 GROUP CARDS */}
            <ScrollView
                style={{
                    marginTop: 20,
                    paddingHorizontal: 16,
                    height: "78%",
                }}
            >
                {(activeTab === "my"
                    ? filteredMyGroups
                    : filteredDiscoverGroups
                ).length === 0 ? (
                    <Text
                        style={{
                            textAlign: "center",
                            color: theme.colors.text,
                            opacity: 0.6,
                            marginTop: 30,
                        }}
                    >
                        No groups found.
                    </Text>
                ) : (
                    (activeTab === "my"
                        ? filteredMyGroups
                        : filteredDiscoverGroups
                    ).map((group) => (
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

                            {/* ACTION BUTTONS */}
                            {activeTab === "my" ? (
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: theme.colors.text,
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        marginTop: 12,
                                        alignItems: "center",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <ChatIcon
                                        width={14}
                                        height={14}
                                        color={theme.colors.background}
                                    />
                                    <Text
                                        style={{
                                            color: theme.colors.background,
                                            fontWeight: "600",
                                            marginBottom: 2,
                                        }}
                                    >
                                        Chat
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 10,
                                        marginTop: 12,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flex: 1,
                                            borderWidth: 1,
                                            borderColor: theme.colors.text,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: "center",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <EyeIcon
                                            width={16}
                                            height={16}
                                            color={theme.colors.text}
                                        />
                                        <Text
                                            style={{
                                                color: theme.colors.text,
                                                fontWeight: "600",
                                            }}
                                        >
                                            View Details
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            flex: 1,
                                            backgroundColor: theme.colors.text,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: "center",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <AddPeopleIcon
                                            width={16}
                                            height={16}
                                            color={theme.colors.background}
                                        />
                                        <Text
                                            style={{
                                                color: theme.colors.background,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Join Group
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
