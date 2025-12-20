import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
    avatarUrl?: string | null;
    role?: string | null;
    createdat?: string | null;
};

export default function EditProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData.user?.id;
            if (!userId) return setLoading(false);

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) console.error("Error loading profile:", error);
            else setUserData(data);

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

        if (error) Alert.alert("Error", error.message);
        else Alert.alert("Success", "Profile updated successfully!");

        setSaving(false);
    };

    if (loading || !userData) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const joinDate = userData.createdat
        ? new Date(userData.createdat).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
          })
        : "Unknown";

    return (
        <ScrollView style={styles.container}>
            {/* --- PROFILE CARD --- */}
            <View style={styles.profileCard}>
                <View style={{ position: "relative", alignItems: "center" }}>
                    <Image
                        source={{
                            uri:
                                userData.avatarUrl ||
                                "https://i.pravatar.cc/150?img=15",
                        }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.cameraIcon}>
                        <Ionicons
                            name="camera-outline"
                            size={16}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.name}>{userData.fullName}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {userData.role || "Student"}
                    </Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={18} color="#555" />
                        <Text style={styles.infoText}>{userData.email}</Text>
                    </View>

                    {userData.phone && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="call-outline"
                                size={18}
                                color="#555"
                            />
                            <Text style={styles.infoText}>
                                {userData.phone}
                            </Text>
                        </View>
                    )}

                    {userData.studentId && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="id-card-outline"
                                size={18}
                                color="#555"
                            />
                            <Text style={styles.infoText}>
                                {userData.studentId}
                            </Text>
                        </View>
                    )}

                    <View style={styles.infoRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#555"
                        />
                        <Text style={styles.infoText}>Joined {joinDate}</Text>
                    </View>
                </View>
            </View>

            {/* --- EDIT FORM --- */}
            <Text style={styles.title}>Edit Profile Information</Text>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
                style={styles.input}
                value={userData.fullName}
                onChangeText={(text) =>
                    setUserData({ ...userData, fullName: text })
                }
            />

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                style={styles.input}
                value={userData.phone || ""}
                placeholder="+65..."
                keyboardType="phone-pad"
                onChangeText={(text) =>
                    setUserData({ ...userData, phone: text })
                }
            />

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
                style={[styles.input, { backgroundColor: "#f9fafb" }]}
                editable={false}
                value={userData.email}
            />

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButton}
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
    container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
    // --- Profile Card Styles ---
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
    },
    cameraIcon: {
        position: "absolute",
        bottom: 6,
        right: "36%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 4,
        elevation: 3,
    },
    name: { fontSize: 18, fontWeight: "600", textAlign: "center" },
    badge: {
        backgroundColor: "#E0E7FF",
        borderRadius: 8,
        paddingVertical: 3,
        paddingHorizontal: 10,
        marginTop: 4,
        marginBottom: 10,
    },
    badgeText: { color: "#4338CA", fontWeight: "500", fontSize: 12 },
    infoContainer: { width: "100%", marginTop: 4 },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    infoText: { marginLeft: 8, color: "#333", fontSize: 14 },

    // --- Form Styles ---
    title: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#111" },
    label: { fontWeight: "600", marginTop: 12, marginBottom: 6, color: "#333" },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
    },
    saveButton: {
        backgroundColor: "#4F46E5",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 25,
    },
    saveText: { color: "#fff", fontWeight: "600" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
