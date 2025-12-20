import DropdownSelect from "@/components/DropDownSelect";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditPost() {
    const { postId } = useLocalSearchParams<{ postId: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [forums, setForums] = useState<any[]>([]);

    // Form states
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState(""); // forum_id
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [content, setContent] = useState("");
    const [attachment, setAttachment] = useState<any>(null); // new file
    const [existingAttachment, setExistingAttachment] = useState<string | null>(
        null
    );

    const subjects = [
        "Computer Science",
        "Mathematics",
        "Biology",
        "Physics",
        "Chemistry",
        "Engineering",
    ];

    useEffect(() => {
        loadData();
    }, [postId]);

    const loadData = async () => {
        setLoading(true);

        await fetchForums();
        await fetchPostDetails();

        setLoading(false);
    };

    const fetchForums = async () => {
        const { data, error } = await supabase
            .from("forums")
            .select("id, name")
            .order("name");

        if (!error) setForums(data || []);
    };

    const fetchPostDetails = async () => {
        const { data, error } = await supabase
            .from("forum_posts")
            .select("*")
            .eq("id", postId)
            .single();

        if (error) {
            Alert.alert("Error", "Failed to load post details.");
            return;
        }

        setTitle(data.title);
        setSubject(data.subject);
        setCategory(data.forum_id);
        setTags(data.tags || []);
        setContent(data.content);

        if (data.attachments?.length) {
            setExistingAttachment(data.attachments[0]);
        }
    };

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        if (!tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
        }
        setNewTag("");
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (result.canceled) return;
        setAttachment(result.assets[0]);
    };

    const handleSaveChanges = async () => {
        if (!title || !content || !category) {
            Alert.alert(
                "Missing fields",
                "Please fill in all required fields."
            );
            return;
        }

        setSaving(true);

        let filePath = existingAttachment;

        // ============================
        // UPLOAD NEW FILE (if chosen)
        // ============================
        if (attachment) {
            try {
                const fileUri = attachment.uri;
                const fileName = `${Date.now()}-${attachment.name}`;
                const mimeType =
                    attachment.mimeType || "application/octet-stream";

                const base64Data = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const fileBuffer = decode(base64Data);

                const { data, error } = await supabase.storage
                    .from("forum_attachments")
                    .upload(fileName, fileBuffer, {
                        contentType: mimeType,
                        upsert: false,
                    });

                if (error) throw error;

                filePath = data.path;
            } catch (err: any) {
                Alert.alert("Upload failed", err.message);
                setSaving(false);
                return;
            }
        }

        // ============================
        // UPDATE POST
        // ============================
        const { error } = await supabase
            .from("forum_posts")
            .update({
                title,
                subject,
                forum_id: category,
                tags,
                content,
                attachments: filePath ? [filePath] : [],
            })
            .eq("id", postId);

        setSaving(false);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Updated!", "Your post has been updated.");
            router.back();
        }
    };

    // -----------------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------------

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#111" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={22} color="#111" />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Edit Post</Text>
                        <Text style={styles.headerSubtitle}>
                            Update your discussion
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.publishButton}
                        onPress={handleSaveChanges}
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
                                <Text style={styles.publishText}>Save</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Section title */}
                <Text style={styles.sectionTitle}>Edit Details</Text>

                {/* Title */}
                <Text style={styles.label}>Title*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Subject */}
                <DropdownSelect
                    label="Subject*"
                    value={subject}
                    options={subjects}
                    onSelect={setSubject}
                />

                {/* Category */}
                <DropdownSelect
                    label="Category*"
                    value={
                        forums.find((f) => f.id === category)?.name || "Select"
                    }
                    options={forums.map((f) => f.name)}
                    onSelect={(val) => {
                        const selected = forums.find((f) => f.name === val);
                        setCategory(selected?.id || "");
                    }}
                />

                {/* Tags */}
                <Text style={styles.label}>Tags</Text>
                <View style={styles.tagInputRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Add a tag"
                        value={newTag}
                        onChangeText={setNewTag}
                    />
                    <TouchableOpacity
                        style={styles.addTagButton}
                        onPress={handleAddTag}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Display Tags */}
                <View style={styles.tagsContainer}>
                    {tags.map((tag, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.tag}
                            onPress={() => handleRemoveTag(tag)}
                        >
                            <Text style={styles.tagText}>#{tag}</Text>
                            <Ionicons
                                name="close"
                                size={14}
                                color="#555"
                                style={{ marginLeft: 4 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                <Text style={styles.label}>Content*</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Write your post content..."
                    multiline
                    value={content}
                    onChangeText={setContent}
                />

                {/* Attachments */}
                <Text style={styles.label}>Attachment</Text>

                {/* Existing attachment preview */}
                {existingAttachment && (
                    <Image
                        source={{
                            uri: supabase.storage
                                .from("forum_attachments")
                                .getPublicUrl(existingAttachment).data
                                .publicUrl,
                        }}
                        style={styles.previewImage}
                    />
                )}

                <TouchableOpacity
                    style={styles.fileUploadBox}
                    onPress={pickFile}
                >
                    <Ionicons
                        name="cloud-upload-outline"
                        size={24}
                        color="#666"
                    />
                    <Text style={styles.uploadText}>
                        {attachment
                            ? attachment.name
                            : existingAttachment
                            ? "Replace Attachment"
                            : "Browse Files"}
                    </Text>
                </TouchableOpacity>

                {/* Warning */}
                {!title || !content || !category ? (
                    <View style={styles.warningBox}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={20}
                            color="#B45309"
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.warningTitle}>
                                Please complete required fields
                            </Text>
                            <Text style={styles.warningList}>
                                • Title{"\n"}• Content{"\n"}• Category
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        padding: 20,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        justifyContent: "space-between",
    },

    backButton: {
        padding: 6,
        marginRight: 8,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },

    headerSubtitle: {
        color: "#555",
        fontSize: 13,
        marginTop: 2,
    },

    publishButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
    },

    publishText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 6,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
        marginTop: 8,
    },

    label: {
        fontWeight: "600",
        marginTop: 14,
        marginBottom: 6,
        color: "#333",
    },

    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        fontSize: 14,
    },

    textArea: {
        height: 140,
        textAlignVertical: "top",
        lineHeight: 20,
    },

    tagInputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    addTagButton: {
        backgroundColor: "#4F46E5",
        borderRadius: 10,
        padding: 10,
    },

    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },

    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E5E7EB",
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },

    tagText: {
        color: "#333",
        fontSize: 13,
    },

    fileUploadBox: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        borderStyle: "dashed",
        paddingVertical: 24,
        alignItems: "center",
        backgroundColor: "#fff",
        marginTop: 6,
    },

    uploadText: {
        marginTop: 6,
        color: "#111",
        fontWeight: "500",
        fontSize: 14,
    },

    previewImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#eee",
    },

    warningBox: {
        flexDirection: "row",
        backgroundColor: "#FEF3C7",
        borderRadius: 12,
        padding: 14,
        marginTop: 22,
        borderWidth: 1,
        borderColor: "#FCD34D",
    },

    warningTitle: {
        color: "#B45309",
        fontWeight: "700",
        fontSize: 14,
    },

    warningList: {
        color: "#B45309",
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
});
