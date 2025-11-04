import AddPeopleIcon from "@/components/icons/AddPeopleIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import {
    getDiscoverStudyGroups,
    getMyStudyGroups,
} from "@/components/landing/study-hub/study-group/_query/study-group";
import { StudyGroup } from "@/components/landing/study-hub/study-group/_query/types";
import { styles } from "@/components/landing/study-hub/study-group/styles";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function StudyGroups() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
    const [searchQuery, setSearchQuery] = useState("");

    const [myStudyGroups, setMyStudyGroups] = useState<StudyGroup[]>([]);
    const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([]);
    const [discoverPage, setDiscoverPage] = useState(1);
    const [discoverTotalPages, setDiscoverTotalPages] = useState(1);
    const [loadingDiscover, setLoadingDiscover] = useState(false);
    const [requestingGroupId, setRequestingGroupId] = useState<number | null>(
        null
    );

    // Filter My Groups locally
    const filteredMyGroups = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return myStudyGroups.filter(
            (group) =>
                group.groupName.toLowerCase().includes(query) ||
                group.description.toLowerCase().includes(query) ||
                group.subject.toLowerCase().includes(query)
        );
    }, [myStudyGroups, searchQuery]);

    // Filter Discover Groups locally
    const filteredDiscoverGroups = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return discoverGroups.filter(
            (group) =>
                group.groupName.toLowerCase().includes(query) ||
                group.description.toLowerCase().includes(query) ||
                group.subject.toLowerCase().includes(query)
        );
    }, [discoverGroups, searchQuery]);

    // Fetch My Groups
    useEffect(() => {
        getMyStudyGroups().then((groups) => {
            const normalized = (groups || []).map((g: any) => ({
                ...g,
                study_group_members: Array.isArray(g.study_group_members)
                    ? g.study_group_members.map((m: any) => ({
                          id: Number(m.memberId ?? m.id ?? 0),
                          name: m.name ?? "",
                          email: m.email ?? "",
                      }))
                    : [],
            })) as StudyGroup[];
            setMyStudyGroups(normalized);
        });
    }, []);

    // Fetch Discover Groups
    const fetchDiscoverGroups = async (page: number = 1) => {
        setLoadingDiscover(true);
        try {
            const result = await getDiscoverStudyGroups({
                searchQuery,
                page,
                pageSize: 10,
            });
            setDiscoverGroups(result.data);
            setDiscoverPage(result.page || 1);
            setDiscoverTotalPages(result.totalPages || 1);
        } catch (err) {
            console.error("Error fetching discover groups:", err);
        } finally {
            setLoadingDiscover(false);
        }
    };

    // Fetch Discover Groups when tab or search changes
    useEffect(() => {
        if (activeTab === "discover") {
            fetchDiscoverGroups(1);
        }
    }, [activeTab, searchQuery]);

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

            {/* SEARCH */}
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
                        style={{ color: theme.colors.text, fontWeight: "600" }}
                    >
                        My Groups ({myStudyGroups.length})
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
                        style={{ color: theme.colors.text, fontWeight: "600" }}
                    >
                        Discover
                    </Text>
                </TouchableOpacity>
            </View>

            {/* LOADING INDICATOR FOR FETCHING */}
            {activeTab === "discover" && loadingDiscover && (
                <View
                    style={{
                        marginTop: 40,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ActivityIndicator size="large" color={theme.colors.text} />
                    <Text
                        style={{
                            color: theme.colors.text,
                            opacity: 0.7,
                            marginTop: 10,
                        }}
                    >
                        Fetching groups...
                    </Text>
                </View>
            )}

            {/* GROUP CARDS */}
            {!loadingDiscover && (
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
                                    {group.groupName}
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
                                        backgroundColor:
                                            theme.colors.background,
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
                                        {group.subject}
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
                                        {group.study_group_members?.length ?? 0}{" "}
                                        / {group.maxMembers} members
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
                                        onPress={() =>
                                            navigate({
                                                pathname:
                                                    "/study-hub/study-groups/chat/[groupId]",
                                                params: {
                                                    groupId:
                                                        group.id.toString(),
                                                },
                                            })
                                        }
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
                                            onPress={() =>
                                                navigate({
                                                    pathname:
                                                        "/study-hub/study-groups/details/[groupId]",
                                                    params: {
                                                        groupId: group.id,
                                                    },
                                                })
                                            }
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
                                                backgroundColor:
                                                    theme.colors.text,
                                                opacity:
                                                    group.alreadyRequested ||
                                                    requestingGroupId ===
                                                        group.id
                                                        ? 0.6
                                                        : 1,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: "center",
                                                flexDirection: "row",
                                                justifyContent: "center",
                                                gap: 8,
                                            }}
                                            disabled={
                                                group.alreadyRequested ||
                                                requestingGroupId === group.id
                                            }
                                            onPress={async () => {
                                                setRequestingGroupId(group.id);
                                                try {
                                                    const {
                                                        data: { user },
                                                        error: userError,
                                                    } =
                                                        await supabase.auth.getUser();

                                                    if (userError || !user) {
                                                        Alert.alert(
                                                            "Error",
                                                            "You must be logged in to join a group."
                                                        );
                                                        return;
                                                    }

                                                    const {
                                                        error: insertError,
                                                    } = await supabase
                                                        .from(
                                                            "study_group_members"
                                                        )
                                                        .insert([
                                                            {
                                                                groupId:
                                                                    group.id,
                                                                memberId:
                                                                    user.id,
                                                                role: "member",
                                                                status: "pending",
                                                            },
                                                        ]);

                                                    if (insertError) {
                                                        if (
                                                            insertError.message.includes(
                                                                "duplicate key"
                                                            )
                                                        ) {
                                                            Alert.alert(
                                                                "Already joined",
                                                                "You have already requested to join this group."
                                                            );
                                                        } else {
                                                            throw insertError;
                                                        }
                                                        return;
                                                    }

                                                    Alert.alert(
                                                        "Request Sent",
                                                        "Your request to join this group has been sent!"
                                                    );

                                                    setDiscoverGroups((prev) =>
                                                        prev.map((g) =>
                                                            g.id === group.id
                                                                ? {
                                                                      ...g,
                                                                      alreadyRequested:
                                                                          true,
                                                                  }
                                                                : g
                                                        )
                                                    );
                                                } catch (error: any) {
                                                    console.error(
                                                        "Join group error:",
                                                        error
                                                    );
                                                    Alert.alert(
                                                        "Error",
                                                        "Failed to join the group. Try again later."
                                                    );
                                                } finally {
                                                    setRequestingGroupId(null);
                                                }
                                            }}
                                        >
                                            {requestingGroupId === group.id ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color={
                                                        theme.colors.background
                                                    }
                                                />
                                            ) : group.alreadyRequested ? (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={16}
                                                    color={
                                                        theme.colors.background
                                                    }
                                                />
                                            ) : (
                                                <AddPeopleIcon
                                                    width={16}
                                                    height={16}
                                                    color={
                                                        theme.colors.background
                                                    }
                                                />
                                            )}

                                            <Text
                                                style={{
                                                    color: theme.colors
                                                        .background,
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {requestingGroupId === group.id
                                                    ? "Requesting..."
                                                    : group.alreadyRequested
                                                    ? "Requested"
                                                    : "Join Group"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
