import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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

export default function PostDetails() {
    const { postId } = useLocalSearchParams<{ postId: string }>();

    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const [replyText, setReplyText] = useState("");
    const [replyTo, setReplyTo] = useState<any>(null);

    const inputRef = useRef<TextInput>(null);

    // LOAD CURRENT USER
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            setUserId(data.user?.id ?? null);
        })();
    }, []);

    // LOAD PAGE
    useEffect(() => {
        if (!userId) return;
        loadPage();
    }, [userId, postId]);

    const loadPage = async () => {
        setLoading(true);
        await Promise.all([fetchPost(), fetchReplies(), recordView()]);
        setLoading(false);
    };

    // FETCH POST
    const fetchPost = async () => {
        const { data, error } = await supabase
            .from("forum_posts")
            .select(
                `
                *,
                users(fullName, avatarUrl),
                forum_post_likes(user_id),
                forum_post_views(user_id)
            `
            )
            .eq("id", postId)
            .single();

        if (!error && data) {
            setPost({
                ...data,
                likedByUser: data.forum_post_likes.some(
                    (l: any) => l.user_id === userId
                ),
            });
        }
    };

    // FETCH REPLIES
    const fetchReplies = async () => {
        const { data, error } = await supabase
            .from("forum_replies")
            .select("*, users(fullName, avatarUrl)")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (!error) setReplies(data || []);
    };

    // RECORD VIEW
    const recordView = async () => {
        if (!userId) return;

        await supabase.from("forum_post_views").insert({
            post_id: Number(postId),
            user_id: userId,
        });
    };

    // TIME AGO
    const timeAgo = (dateString: string) => {
        const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // LIKE TOGGLE
    const toggleLike = async () => {
        if (!userId || !post) return;

        const liked = post.likedByUser;

        if (liked) {
            await supabase
                .from("forum_post_likes")
                .delete()
                .eq("post_id", Number(postId))
                .eq("user_id", userId);

            setPost({
                ...post,
                likedByUser: false,
                like_count: post.like_count - 1,
            });
        } else {
            await supabase.from("forum_post_likes").insert({
                post_id: Number(postId),
                user_id: userId,
            });

            setPost({
                ...post,
                likedByUser: true,
                like_count: post.like_count + 1,
            });
        }
    };

    // SEND REPLY
    const submitReply = async () => {
        if (!replyText.trim() || !userId) return;

        await supabase.from("forum_replies").insert({
            post_id: Number(postId),
            user_id: userId,
            content: replyTo
                ? `@${replyTo.users.fullName}: ${replyText}`
                : replyText,
        });

        setReplyText("");
        setReplyTo(null);
        await fetchReplies();
    };

    if (loading || !post) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    // ========================================================
    // UI STARTS HERE
    // ========================================================

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView style={styles.container}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color="#111"
                            />
                        </TouchableOpacity>

                        <View>
                            <Text style={styles.headerTitle}>
                                Forum Discussion
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {post.subject}
                            </Text>
                        </View>
                    </View>

                    <View style={{ width: 28 }} />
                </View>

                {/* POST CARD */}
                <View style={styles.postCard}>
                    {/* AUTHOR */}
                    <View style={styles.authorRow}>
                        <Image
                            source={{
                                uri:
                                    post.users?.avatarUrl ??
                                    "https://i.pravatar.cc/150",
                            }}
                            style={styles.avatar}
                        />
                        <View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <Text style={styles.authorName}>
                                    {post.users?.fullName}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: "#666",
                                        backgroundColor: post.solved
                                            ? "#d1fae5"
                                            : "#fee2e2",
                                        padding: 4,
                                        borderRadius: 6,
                                        textAlign: "center",
                                    }}
                                >
                                    {post.solved ? "solved" : "unsolved"}
                                </Text>
                            </View>
                            <Text style={styles.timeText}>
                                {timeAgo(post.created_at)}
                            </Text>
                        </View>
                    </View>

                    {/* ACTIVE / INACTIVE STATUS */}
                    <View style={styles.statusRow}>
                        <Ionicons
                            name={
                                post.active ? "eye-outline" : "eye-off-outline"
                            }
                            size={16}
                            color={post.active ? "#16a34a" : "#b91c1c"}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: post.active ? "#16a34a" : "#b91c1c",
                                },
                            ]}
                        >
                            {post.active ? "Active" : "Inactive"}
                        </Text>
                    </View>

                    {/* TITLE */}
                    <Text style={styles.postTitle}>{post.title}</Text>

                    {/* TAGS */}
                    <View style={styles.tagRow}>
                        {post.tags?.map((tag: string, i: number) => (
                            <View key={i} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* ATTACHMENTS */}
                    {post.attachments?.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 12 }}
                        >
                            {post.attachments.map(
                                (file: string, index: number) =>
                                    file.match(
                                        /\.(jpg|jpeg|png|gif|webp)$/i
                                    ) ? (
                                        <Image
                                            key={index}
                                            source={{
                                                uri: supabase.storage
                                                    .from("forum_attachments")
                                                    .getPublicUrl(file).data
                                                    .publicUrl,
                                            }}
                                            style={styles.galleryImage}
                                        />
                                    ) : (
                                        <View
                                            key={index}
                                            style={styles.nonImageAttachment}
                                        >
                                            <Ionicons
                                                name="document"
                                                size={20}
                                                color="#555"
                                            />
                                            <Text style={styles.nonImageText}>
                                                Attachment
                                            </Text>
                                        </View>
                                    )
                            )}
                        </ScrollView>
                    )}

                    {/* FULL CONTENT */}
                    <Text style={styles.postContent}>{post.content}</Text>

                    {/* ACTION BAR */}
                    <View style={styles.actionsRow}>
                        {/* Comments */}
                        <View style={styles.metaItem}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={18}
                                color="#555"
                            />
                            <Text style={styles.metaText}>
                                {replies.length}
                            </Text>
                        </View>

                        {/* Likes */}
                        <TouchableOpacity
                            onPress={toggleLike}
                            style={styles.metaItem}
                        >
                            <Ionicons
                                name={
                                    post.likedByUser ? "heart" : "heart-outline"
                                }
                                size={18}
                                color={post.likedByUser ? "#e11d48" : "#555"}
                            />
                            <Text style={styles.metaText}>
                                {post.like_count}
                            </Text>
                        </TouchableOpacity>

                        {/* Views */}
                        <View style={styles.metaItem}>
                            <Ionicons
                                name="eye-outline"
                                size={18}
                                color="#555"
                            />
                            <Text style={styles.metaText}>
                                {post.view_count}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* REPLIES HEADER */}
                <Text style={styles.replyHeader}>
                    Replies ({replies.length})
                </Text>

                {/* REPLY INPUT */}
                <View style={styles.replyBox}>
                    {replyTo && (
                        <View style={styles.replyingTo}>
                            <Text style={styles.replyingToText}>
                                Replying to {replyTo.users.fullName}
                            </Text>
                            <TouchableOpacity onPress={() => setReplyTo(null)}>
                                <Ionicons name="close" size={16} color="#555" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TextInput
                        ref={inputRef}
                        style={styles.replyInput}
                        placeholder="Share your thoughts..."
                        placeholderTextColor="#999"
                        multiline
                        value={replyText}
                        onChangeText={setReplyText}
                    />

                    <TouchableOpacity
                        style={styles.replyButton}
                        onPress={submitReply}
                    >
                        <Text style={styles.replyButtonText}>Reply</Text>
                    </TouchableOpacity>
                </View>

                {/* REPLIES LIST */}
                {replies.map((rep, index) => (
                    <View key={index} style={styles.replyCard}>
                        <View style={styles.replyRow}>
                            <Image
                                source={{
                                    uri:
                                        rep.users?.avatarUrl ??
                                        "https://i.pravatar.cc/150",
                                }}
                                style={styles.replyAvatar}
                            />

                            <View style={{ flex: 1 }}>
                                <Text style={styles.replyAuthor}>
                                    {rep.users?.fullName}
                                </Text>

                                <Text style={styles.replyText}>
                                    {rep.content}
                                </Text>

                                <View style={styles.replyMetaRow}>
                                    <Text style={styles.replyTime}>
                                        {timeAgo(rep.created_at)}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setReplyTo(rep);
                                            inputRef.current?.focus();
                                        }}
                                    >
                                        <Text style={styles.replyAction}>
                                            Reply
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 20,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        justifyContent: "space-between",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    headerSubtitle: { fontSize: 13, color: "#666" },

    postCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },

    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    authorName: { fontWeight: "600", fontSize: 15, color: "#111" },
    timeText: { fontSize: 12, color: "#666" },

    /* ACTIVE/INACTIVE STATUS */
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        marginTop: 2,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },

    postTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 10,
        color: "#111",
    },

    tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    tag: {
        backgroundColor: "#E5E7EB",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: { color: "#333", fontSize: 12 },

    galleryImage: {
        width: 200,
        height: 150,
        borderRadius: 10,
        marginRight: 10,
    },
    nonImageAttachment: {
        width: 120,
        height: 80,
        backgroundColor: "#EEE",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    nonImageText: { fontSize: 12, color: "#333", marginTop: 4 },

    postContent: {
        color: "#333",
        fontSize: 14,
        lineHeight: 20,
        marginTop: 10,
    },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
    },

    metaItem: { flexDirection: "row", alignItems: "center" },
    metaText: { marginLeft: 4, fontSize: 13, color: "#444" },

    replyHeader: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },

    replyBox: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 20,
    },
    replyingTo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    replyingToText: { fontSize: 12, color: "#555" },
    replyInput: { minHeight: 60, fontSize: 14, color: "#111" },
    replyButton: {
        alignSelf: "flex-end",
        backgroundColor: "#111",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    replyButtonText: { color: "#fff", fontWeight: "600" },

    replyCard: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 14,
    },
    replyRow: { flexDirection: "row" },
    replyAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    replyAuthor: { fontWeight: "600", fontSize: 14, marginBottom: 4 },
    replyText: { color: "#333", fontSize: 14, lineHeight: 20 },

    replyMetaRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    replyTime: { fontSize: 12, color: "#777" },
    replyAction: { fontSize: 12, color: "#4F46E5", fontWeight: "600" },
});
