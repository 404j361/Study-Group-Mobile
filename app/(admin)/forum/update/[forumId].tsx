import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function UpdateForum() {
    const { forumId } = useLocalSearchParams<{ forumId: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // form fields
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string>("");
    const [active, setActive] = useState(true);
    const [allowAnonymous, setAllowAnonymous] = useState(false);
    const [requireApproval, setRequireApproval] = useState(false);

    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (forumId) fetchForumData();
    }, [forumId]);

    const fetchForumData = async () => {
        try {
            const { data, error } = await supabase
                .from("forums")
                .select("*")
                .eq("id", forumId)
                .single();

            if (error) {
                console.error(error);
                Alert.alert("Error", "Failed to fetch forum data.");
                router.back();
                return;
            }

            if (data) {
                setName(data.name ?? "");
                setSubject(data.subject ?? "");
                setCategory(data.category ?? "");
                setDescription(data.description ?? "");
                setTags(data.tags ? data.tags.join(", ") : "");
                setActive(data.active ?? true);
                setAllowAnonymous(data.allow_anonymous ?? false);
                setRequireApproval(data.require_approval ?? false);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Unable to load forum information.");
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const missing: string[] = [];
        if (!name.trim()) missing.push("Forum name is required");
        if (!subject.trim()) missing.push("Subject is required");
        if (!category.trim()) missing.push("Category is required");
        if (!description.trim()) missing.push("Description is required");
        setErrors(missing);
        return missing.length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from("forums")
                .update({
                    name: name.trim(),
                    subject: subject.trim(),
                    category: category.trim(),
                    description: description.trim(),
                    tags: tags
                        ? tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : [],
                    active,
                    allow_anonymous: allowAnonymous,
                    require_approval: requireApproval,
                })
                .eq("id", forumId);

            if (error) {
                console.error(error);
                Alert.alert("Error", "Failed to update forum.");
            } else {
                Alert.alert("Success", "Forum updated successfully!");
                router.back();
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Forum Management</Text>
                    <Text style={styles.headerSubtitle}>
                        Monitor and moderate discussions
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons
                                name="save-outline"
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.saveButtonText}>Save</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Forum Information</Text>

                <Text style={styles.label}>Forum Name*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Forum Name"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Subject*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Subject"
                    value={subject}
                    onChangeText={setSubject}
                />

                <Text style={styles.label}>Category*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Category"
                    value={category}
                    onChangeText={setCategory}
                />

                <Text style={styles.label}>Description*</Text>
                <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder="Forum description"
                    value={description}
                    multiline
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Tags</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Comma separated tags (e.g. CS, Programming)"
                    value={tags}
                    onChangeText={setTags}
                />
            </View>

            {/* Visibility Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visibility & Access</Text>

                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.switchLabel}>Active Forum</Text>
                        <Text style={styles.switchSub}>
                            Forum is open for new posts and discussions
                        </Text>
                    </View>
                    <Switch value={active} onValueChange={setActive} />
                </View>

                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.switchLabel}>
                            Allow Anonymous Posts
                        </Text>
                        <Text style={styles.switchSub}>
                            Users can post without showing their identity
                        </Text>
                    </View>
                    <Switch
                        value={allowAnonymous}
                        onValueChange={setAllowAnonymous}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.switchLabel}>
                            Require Post Approval
                        </Text>
                        <Text style={styles.switchSub}>
                            New posts must be approved by moderators
                        </Text>
                    </View>
                    <Switch
                        value={requireApproval}
                        onValueChange={setRequireApproval}
                    />
                </View>
            </View>

            {/* Validation Errors */}
            {errors.length > 0 && (
                <View style={styles.errorBox}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#713F12"
                    />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.errorTitle}>
                            Please complete required fields
                        </Text>
                        {errors.map((e, idx) => (
                            <Text key={idx} style={styles.errorItem}>
                                • {e}
                            </Text>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 12,
    },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
    headerSubtitle: { fontSize: 12, color: "#666", marginTop: 4 },
    saveButton: {
        backgroundColor: "#111",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    saveButtonText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
    section: {
        paddingHorizontal: 20,
        paddingTop: 18,
        marginTop: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
    label: { fontWeight: "600", marginBottom: 6, color: "#111" },
    input: {
        borderWidth: 1,
        borderColor: "#E6E6E8",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    textarea: { height: 100, textAlignVertical: "top" },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F1F1",
    },
    switchLabel: { fontWeight: "600", color: "#111" },
    switchSub: { color: "#666", fontSize: 12, marginTop: 4 },
    errorBox: {
        margin: 20,
        backgroundColor: "#FEF3E8",
        borderRadius: 10,
        padding: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: "#F7D2AC",
    },
    errorTitle: { fontWeight: "700", color: "#713F12" },
    errorItem: { color: "#713F12", marginTop: 6 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
