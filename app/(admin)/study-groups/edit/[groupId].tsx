import DropdownSelect from "@/components/DropDownSelect";
import { styles } from "@/components/landing/study-hub/study-group/create/styles";
import TimePickerInput from "@/components/TimePickerInput";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditStudyGroup() {
    const theme = useTheme();
    const { groupId } = useLocalSearchParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [groupName, setGroupName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [maxMembers, setMaxMembers] = useState("5");
    const [meetingType, setMeetingType] = useState<
        "in_person" | "virtual_only" | "hybrid"
    >("hybrid");
    const [location, setLocation] = useState("");
    const [virtualLink, setVirtualLink] = useState("");
    const [frequency, setFrequency] = useState("Weekly");
    const [dayOfWeek, setDayOfWeek] = useState("Sunday");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("1 Hour");
    const [isPublic, setIsPublic] = useState(true);
    const [allowRequests, setAllowRequests] = useState(true);

    // Fetch group details
    useEffect(() => {
        async function fetchGroup() {
            if (!groupId) return;
            setFetching(true);
            try {
                const { data, error } = await supabase
                    .from("study_groups")
                    .select("*")
                    .eq("id", groupId)
                    .single();

                if (error) {
                    console.error("Error fetching group:", error);
                    alert("Failed to load group details.");
                    return;
                }

                setGroupName(data.groupName || "");
                setSubject(
                    data.subject
                        ? data.subject
                              .replaceAll("_", " ")
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())
                        : ""
                );
                setDescription(data.description || "");
                setMaxMembers(String(data.maxMembers || "5"));
                setMeetingType(data.meetingType || "hybrid");
                setLocation(data.meetingLocation || "");
                setVirtualLink(data.meetingLink || "");
                setFrequency(data.frequency || "Weekly");
                setDayOfWeek(data.dayOfWeek || "Sunday");
                setStartTime(data.startTime || "");
                setDuration(data.duration || "1 Hour");
                setIsPublic(data.publicGroup ?? true);
                setAllowRequests(data.allowJoinRequests ?? true);
            } catch (err) {
                console.error("Unexpected error fetching group:", err);
                alert("Unexpected error occurred while loading group.");
            } finally {
                setFetching(false);
            }
        }

        fetchGroup();
    }, [groupId]);

    async function handleUpdate() {
        if (loading) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("study_groups")
                .update({
                    groupName: groupName.trim(),
                    description: description.trim() || null,
                    subject: subject.toLowerCase().replaceAll(" ", "_"),
                    maxMembers: parseInt(maxMembers),
                    meetingType,
                    meetingLocation: location.trim() || null,
                    meetingLink: virtualLink.trim() || null,
                    frequency,
                    dayOfWeek,
                    startTime,
                    duration,
                    publicGroup: isPublic,
                    allowJoinRequests: allowRequests,
                })
                .eq("id", groupId);

            if (error) {
                console.error("Error updating group:", error);
                alert("Something went wrong updating the group.");
                return;
            }

            alert("Group updated successfully!");
            router.push("/study-hub/study-groups");
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!groupId) return;

        Alert.alert(
            "Delete Study Group",
            "Are you sure you want to delete this study group?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase
                                .from("study_groups")
                                .delete()
                                .eq("id", groupId);

                            if (error) {
                                console.error("Error deleting group:", error);
                                Alert.alert(
                                    "Error",
                                    "Failed to delete study group."
                                );
                                return;
                            }

                            Alert.alert(
                                "Deleted",
                                "Study group deleted successfully."
                            );
                            router.push("/study-hub/study-groups");
                        } catch (err) {
                            console.error(
                                "Unexpected error deleting group:",
                                err
                            );
                            Alert.alert(
                                "Error",
                                "Unexpected error occurred while deleting the group."
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    }

    if (fetching) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.background,
                }}
            >
                <ActivityIndicator color={theme.colors.text} size="large" />
            </View>
        );
    }

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
                    <Link
                        href={"/study-hub/study-groups"}
                        style={{ marginTop: 5 }}
                    >
                        <Ionicons
                            name="arrow-back"
                            color={theme.colors.text}
                            size={20}
                        />
                    </Link>
                    <Text style={{ ...styles.title, color: theme.colors.text }}>
                        Edit Study Group
                    </Text>
                </View>

                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.text,
                        padding: 8,
                        borderRadius: 8,
                    }}
                    disabled={loading}
                    onPress={handleUpdate}
                >
                    {loading ? (
                        <ActivityIndicator
                            color={theme.colors.background}
                            size="small"
                        />
                    ) : (
                        <Ionicons
                            name="save-outline"
                            color={theme.colors.background}
                            size={20}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* FORM (same as create) */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginTop: 20 }}
            >
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.colors.text,
                        marginBottom: 10,
                    }}
                >
                    Group Information
                </Text>

                {/* Group Name */}
                <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
                    Group Name*
                </Text>
                <TextInput
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="Mathematics Study Group"
                    placeholderTextColor={theme.colors.text + "80"}
                    style={{
                        backgroundColor: theme.colors.card,
                        color: theme.colors.text,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                    }}
                />

                {/* Subject */}
                <DropdownSelect
                    label="Subject*"
                    value={subject}
                    onSelect={setSubject}
                    options={[
                        "Computer Science",
                        "Mathematics",
                        "Physics",
                        "Chemistry",
                        "Biology",
                        "Engineering",
                        "Business",
                        "Economics",
                        "Psychology",
                        "Literature",
                        "Art and Design",
                        "Music",
                        "Law",
                        "Medicine",
                    ]}
                />

                {/* Description */}
                <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
                    Description
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the group’s goals and approach"
                    placeholderTextColor={theme.colors.text + "80"}
                    multiline
                    style={{
                        backgroundColor: theme.colors.card,
                        color: theme.colors.text,
                        borderRadius: 8,
                        padding: 12,
                        minHeight: 80,
                        marginBottom: 16,
                    }}
                />

                {/* Max Members */}
                <DropdownSelect
                    label="Maximum Members"
                    value={maxMembers}
                    onSelect={setMaxMembers}
                    options={["3", "5", "10", "15", "20"]}
                />

                {/* Meeting Type */}
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.colors.text,
                        marginVertical: 10,
                    }}
                >
                    Meeting Details
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    {[
                        {
                            label: "In-Person",
                            value: "in_person",
                            icon: "location-outline",
                        },
                        {
                            label: "Virtual Only",
                            value: "virtual_only",
                            icon: "globe-outline",
                        },
                        {
                            label: "Hybrid",
                            value: "hybrid",
                            icon: "people-outline",
                        },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.value}
                            onPress={() => setMeetingType(item.value as any)}
                            style={{
                                flex: 1,
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor:
                                    meetingType === item.value
                                        ? theme.colors.text
                                        : theme.colors.card,
                                alignItems: "center",
                                marginHorizontal: 4,
                            }}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={18}
                                color={
                                    meetingType === item.value
                                        ? theme.colors.background
                                        : theme.colors.text
                                }
                            />
                            <Text
                                style={{
                                    color:
                                        meetingType === item.value
                                            ? theme.colors.background
                                            : theme.colors.text,
                                    marginTop: 4,
                                    fontWeight: "500",
                                }}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Meeting Location */}
                <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
                    Meeting Location
                </Text>
                <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Library Room"
                    placeholderTextColor={theme.colors.text + "80"}
                    style={{
                        backgroundColor: theme.colors.card,
                        color: theme.colors.text,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                    }}
                />

                {/* Virtual Link */}
                <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
                    Virtual Meeting Link
                </Text>
                <TextInput
                    value={virtualLink}
                    onChangeText={setVirtualLink}
                    placeholder="Zoom"
                    placeholderTextColor={theme.colors.text + "80"}
                    style={{
                        backgroundColor: theme.colors.card,
                        color: theme.colors.text,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                    }}
                />

                {/* Frequency */}
                <DropdownSelect
                    label="Frequency"
                    value={frequency}
                    onSelect={setFrequency}
                    options={["Daily", "Weekly", "Bi-weekly", "Monthly"]}
                />

                {/* Day */}
                <DropdownSelect
                    label="Day of Week"
                    value={dayOfWeek}
                    onSelect={setDayOfWeek}
                    options={[
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                    ]}
                />

                {/* Start Time */}
                <TimePickerInput
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                />

                {/* Duration */}
                <DropdownSelect
                    label="Duration (Hour)"
                    value={duration}
                    onSelect={setDuration}
                    options={[
                        "30 Minutes",
                        "1 Hour",
                        "1.5 Hours",
                        "2 Hours",
                        "3 Hours",
                    ]}
                />

                {/* Privacy */}
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.colors.text,
                        marginBottom: 10,
                    }}
                >
                    Privacy & Visibility
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <View>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontWeight: "500",
                            }}
                        >
                            Public Group
                        </Text>
                        <Text
                            style={{ color: theme.colors.text, opacity: 0.6 }}
                        >
                            Anyone can discover and join this group
                        </Text>
                    </View>
                    <Switch
                        value={isPublic}
                        onValueChange={setIsPublic}
                        trackColor={{
                            false: theme.colors.border,
                            true: theme.colors.text,
                        }}
                        thumbColor={theme.colors.background}
                    />
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 60,
                    }}
                >
                    <View>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontWeight: "500",
                            }}
                        >
                            Allow Join Requests
                        </Text>
                        <Text
                            style={{ color: theme.colors.text, opacity: 0.6 }}
                        >
                            Students can request to join your group
                        </Text>
                    </View>
                    <Switch
                        value={allowRequests}
                        onValueChange={setAllowRequests}
                        trackColor={{
                            false: theme.colors.border,
                            true: theme.colors.text,
                        }}
                        thumbColor={theme.colors.background}
                    />
                </View>
                <TouchableOpacity
                    style={{
                        backgroundColor: "red",
                        padding: 14,
                        borderRadius: 8,
                        alignItems: "center",
                        marginBottom: 80,
                    }}
                    disabled={loading}
                    onPress={handleDelete}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={{ color: "white", fontWeight: "600" }}>
                            Delete Study Group
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
