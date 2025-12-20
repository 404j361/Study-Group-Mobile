import DropdownSelect from "@/components/DropDownSelect";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

type Option = { id: string; label: string };

export default function CreateForum() {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState<Option | null>(null);
    const [category, setCategory] = useState<Option | null>(null);
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [active, setActive] = useState(true);
    const [allowAnonymous, setAllowAnonymous] = useState(false);
    const [requireApproval, setRequireApproval] = useState(false);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Mock subject and category lists
    const subjects: Option[] = [
        { id: "cs", label: "Computer Science" },
        { id: "math", label: "Mathematics" },
        { id: "chem", label: "Chemistry" },
    ];

    const categories: Option[] = [
        { id: "academic", label: "Academic Discussion" },
        { id: "study", label: "Study Help" },
        { id: "reviews", label: "Course Reviews" },
        { id: "career", label: "Career Advice" },
        { id: "resources", label: "Resources" },
    ];

    useEffect(() => {
        setErrors([]);
    }, [name, subject, category, description]);

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) return;
        if (!tags.includes(t)) {
            setTags((prev) => [...prev, t]);
        }
        setTagInput("");
    };

    const removeTag = (t: string) => {
        setTags((prev) => prev.filter((x) => x !== t));
    };

    const validate = () => {
        const missing: string[] = [];
        if (!name.trim()) missing.push("Add a forum name");
        if (!subject) missing.push("Select a subject");
        if (!category) missing.push("Select a category");
        if (!description.trim()) missing.push("Write a description");
        setErrors(missing);
        return missing.length === 0;
    };

    const handleCreate = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData.user?.id ?? null;

            const insertPayload = {
                name: name.trim(),
                subject: subject?.label ?? "",
                category: category?.label ?? "",
                description: description.trim(),
                tags: tags.length ? tags : null,
                active,
                allow_anonymous: allowAnonymous,
                require_approval: requireApproval,
                created_by: userId,
            };

            const { error } = await supabase
                .from("forums")
                .insert([insertPayload]);

            if (error) {
                console.error("Create forum error:", error);
                Alert.alert("Error", error.message || "Failed to create forum");
            } else {
                Alert.alert("Success", "Forum created successfully");
                router.push("/(admin)/forum");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

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
                    style={styles.publishBtn}
                    onPress={handleCreate}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons
                                name="send-outline"
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.publishText}>Publish</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Forum Information</Text>

                <Text style={styles.label}>Forum Name*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Computer Science Q&A"
                    value={name}
                    onChangeText={setName}
                />

                {/* Subject Dropdown */}
                <DropdownSelect
                    label="Subject*"
                    value={subject?.label ?? ""}
                    options={subjects.map((s) => s.label)}
                    onSelect={(label: string) =>
                        setSubject(
                            subjects.find((s) => s.label === label) || null
                        )
                    }
                />

                {/* Category Dropdown */}
                <DropdownSelect
                    label="Category*"
                    value={category?.label ?? ""}
                    options={categories.map((c) => c.label)}
                    onSelect={(label: string) =>
                        setCategory(
                            categories.find((c) => c.label === label) || null
                        )
                    }
                />

                <Text style={styles.label}>Description*</Text>
                <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder="To communicate and learn from each other about Computer Science"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Tags</Text>
                <View style={styles.tagRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Add a tag"
                        value={tagInput}
                        onChangeText={setTagInput}
                        onSubmitEditing={addTag}
                    />
                    <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
                        <Text style={{ color: "#fff" }}>Add</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tagsContainer}>
                    {tags.map((t) => (
                        <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                            <TouchableOpacity
                                onPress={() => removeTag(t)}
                                style={styles.tagRemove}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Visibility & Access */}
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

            <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <TouchableOpacity
                    style={[styles.createBtn, saving && { opacity: 0.7 }]}
                    onPress={handleCreate}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.createBtnText}>Create Forum</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F7F7F8" },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 12,
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
    headerSubtitle: { fontSize: 12, color: "#666", marginTop: 4 },
    publishBtn: {
        backgroundColor: "#111",
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    publishText: { color: "#fff", marginLeft: 8, fontWeight: "600" },

    section: {
        paddingHorizontal: 20,
        paddingTop: 18,
        backgroundColor: "#fff",
        marginTop: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
    label: { fontWeight: "600", marginBottom: 6, color: "#111" },

    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E6E6E8",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    textarea: { height: 110, textAlignVertical: "top" },

    tagRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    addTagBtn: {
        marginLeft: 8,
        backgroundColor: "#111",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
        marginTop: 6,
    },
    tagText: { color: "#fff", marginRight: 8 },
    tagRemove: { opacity: 0.9 },

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

    createBtn: {
        backgroundColor: "#111",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    createBtnText: { color: "#fff", fontWeight: "700" },
});
