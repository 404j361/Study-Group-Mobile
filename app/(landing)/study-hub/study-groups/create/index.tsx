import DropdownSelect from "@/components/DropDownSelect";
import { styles } from "@/components/landing/study-hub/study-group/create/styles";
import TimePickerInput from "@/components/TimePickerInput";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateStudyGroup() {
    const theme = useTheme();

    const [groupName, setGroupName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [maxMembers, setMaxMembers] = useState("5 members");
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
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (loading) return; // Prevent double-tap

        setLoading(true);
        try {
            // Get the current user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            console.log(user);

            if (userError || !user) {
                console.error("No user logged in:", userError);
                alert("You must be logged in to create a study group.");
                return;
            }

            // Insert the new group
            const { data, error } = await supabase
                .from("study_groups")
                .insert([
                    {
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
                        creator: user.id, // <-- triggers function to add as member
                    },
                ])
                .select()
                .single();

            if (error) {
                console.error("Error creating group:", error);
                alert("Something went wrong creating the group.");
                return;
            }

            router.push("/study-hub/study-groups");
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
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
                        style={{ marginTop: 5 }}
                        href={"/study-hub/study-groups"}
                    >
                        <Ionicons
                            name="arrow-back"
                            color={theme.colors.text}
                            size={20}
                        />
                    </Link>
                    <Text style={{ ...styles.title, color: theme.colors.text }}>
                        Create Study Group
                    </Text>
                </View>

                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.text,
                        padding: 8,
                        borderRadius: 8,
                    }}
                    disabled={loading}
                    onPress={handleSave}
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

            {/* FORM */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginTop: 20 }}
            >
                {/* GROUP INFO */}
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
                    placeholder="Describe the group’s goals, study approach, and what members can expect"
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

                {/* MEETING DETAILS */}
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.colors.text,
                        marginBottom: 10,
                    }}
                >
                    Meeting Details
                </Text>

                {/* Meeting Type */}
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

                {/* PRIVACY */}
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
            </ScrollView>
        </View>
    );
}
