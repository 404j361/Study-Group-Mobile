import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type UserProfile = {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    description?: string | null;
    studentId?: string | null;
    major?: string | null;
    academicYear?: string | null;
    interests?: string[] | null;
};

export default function EditProfile() {
    const navigation = useNavigation();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [newInterest, setNewInterest] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);

            const { data: authData } = await supabase.auth.getUser();
            const userId = authData.user?.id;
            if (!userId) return setLoading(false);

            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            setUserData(data || null);
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!userData) return;
        setSaving(true);

        const { error } = await supabase
            .from("users")
            .update({
                fullName: userData.fullName,
                email: userData.email,
                description: userData.description,
                phone: userData.phone,
                major: userData.major,
                academicYear: userData.academicYear,
                interests: userData.interests,
            })
            .eq("id", userData.id);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        }

        setSaving(false);
    };

    const handleAddInterest = () => {
        if (!newInterest.trim()) return;

        setUserData({
            ...userData!,
            interests: [...(userData?.interests || []), newInterest.trim()],
        });

        setNewInterest("");
    };

    const handleRemoveInterest = (interest: string) => {
        setUserData({
            ...userData!,
            interests: userData!.interests?.filter((i) => i !== interest),
        });
    };

    if (loading || !userData) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Edit Profile Information
            </Text>

            {/* Full Name */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
                Full Name
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                    },
                ]}
                value={userData.fullName}
                onChangeText={(text) =>
                    setUserData({ ...userData, fullName: text })
                }
            />

            {/* Phone */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
                Phone Number
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                    },
                ]}
                value={userData.phone || ""}
                placeholder="+65..."
                placeholderTextColor={theme.colors.text + "55"}
                keyboardType="phone-pad"
                onChangeText={(text) =>
                    setUserData({ ...userData, phone: text })
                }
            />

            {/* Email */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
                Email Address
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.colors.border,
                        color: theme.colors.text + "88",
                    },
                ]}
                editable={false}
                value={userData.email}
            />

            {/* Bio */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
                Bio
            </Text>
            <TextInput
                style={[
                    styles.input,
                    styles.textarea,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                    },
                ]}
                multiline
                value={userData.description || ""}
                placeholder="Write something about yourself..."
                placeholderTextColor={theme.colors.text + "55"}
                onChangeText={(text) =>
                    setUserData({ ...userData, description: text })
                }
            />

            {/* Major & Academic Year */}
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Major
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        value={userData.major || ""}
                        onChangeText={(text) =>
                            setUserData({ ...userData, major: text })
                        }
                    />
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Academic Year
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        value={userData.academicYear || ""}
                        onChangeText={(text) =>
                            setUserData({ ...userData, academicYear: text })
                        }
                    />
                </View>
            </View>

            {/* Interests */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
                Academic Interests
            </Text>

            <View style={styles.tagsContainer}>
                {userData.interests?.map((interest) => (
                    <TouchableOpacity
                        key={interest}
                        style={[
                            styles.tag,
                            { backgroundColor: theme.colors.border },
                        ]}
                        onPress={() => handleRemoveInterest(interest)}
                    >
                        <Text
                            style={[
                                styles.tagText,
                                { color: theme.colors.text },
                            ]}
                        >
                            {interest} ✕
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Add Interest */}
            <View style={styles.addInterestRow}>
                <TextInput
                    style={[
                        styles.input,
                        { flex: 1 },
                        {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="Add an interest..."
                    placeholderTextColor={theme.colors.text + "55"}
                    value={newInterest}
                    onChangeText={setNewInterest}
                />

                <TouchableOpacity
                    style={[
                        styles.addButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleAddInterest}
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    label: { fontWeight: "600", marginTop: 12, marginBottom: 6 },
    input: {
        borderRadius: 10,
        borderWidth: 1,
        padding: 12,
    },
    textarea: { height: 100, textAlignVertical: "top" },
    row: { flexDirection: "row", justifyContent: "space-between" },
    tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    tag: {
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: { fontWeight: "500" },
    addInterestRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 8,
    },
    addButton: {
        borderRadius: 10,
        padding: 10,
    },
    saveButton: {
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 25,
    },
    saveText: { color: "#fff", fontWeight: "600" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
