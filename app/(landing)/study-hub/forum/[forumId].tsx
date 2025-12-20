import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/* --------------------------------------------- */
/* Helpers */
/* --------------------------------------------- */

const PAGE_SIZE = 10;

const isImageFile = (filename: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

const getImageUrl = (path: string) => {
    const { data } = supabase.storage
        .from("forum_attachments")
        .getPublicUrl(path);
    return data.publicUrl;
};

export default function ForumPosts() {
    const { forumId } = useLocalSearchParams<{ forumId: string }>();

    const [loading, setLoading] = useState(true);
    const [forum, setForum] = useState<any>(null);

    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [userId, setUserId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    /* ---------------- Load user ----------------- */
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            setUserId(data.user?.id ?? null);
        })();
    }, []);

    /* ---------------- Refresh when focus ----------------- */
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                resetFeed();
            }
        }, [forumId, userId])
    );

    const resetFeed = async () => {
        setLoading(true);
        setPage(0);
        setHasMore(true);
        setPosts([]);
        await Promise.all([fetchForum(), fetchPosts(true)]);
        setLoading(false);
    };

    /* ---------------- Fetch forum ----------------- */
    const fetchForum = async () => {
        const { data } = await supabase
            .from("forums")
            .select("*")
            .eq("id", forumId)
            .single();
        setForum(data);
    };

    /* ---------------- Fetch posts (paginated) ----------------- */
    const fetchPosts = async (reset = false) => {
        if (!hasMore && !reset) return;

        const from = reset ? 0 : page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from("forum_posts")
            .select(
                `
                *,
                users(fullName, avatarUrl),
                forum_post_likes(user_id),
                forum_post_views(user_id),
                forum_replies(count)
            `
            )
            .eq("forum_id", forumId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) return;

        if (reset) {
            setPosts(formatPosts(data));
        } else {
            setPosts((prev) => [...prev, ...formatPosts(data)]);
        }

        if (!data || data.length < PAGE_SIZE) {
            setHasMore(false);
        } else {
            setPage((prev) => prev + 1);
        }
    };

    const formatPosts = (data: any[]) =>
        data.map((post) => ({
            ...post,
            likedByUser: post.forum_post_likes.some(
                (l: any) => l.user_id === userId
            ),
            like_count: post.forum_post_likes.length,
            view_count: post.forum_post_views.length,
            comment_count: post.forum_replies?.[0]?.count ?? 0,
        }));

    /* ---------------- Toggle Like ----------------- */
    const toggleLike = async (post: any) => {
        if (!userId) return;
        const liked = post.likedByUser;

        if (liked) {
            await supabase
                .from("forum_post_likes")
                .delete()
                .eq("post_id", post.id)
                .eq("user_id", userId);
        } else {
            await supabase.from("forum_post_likes").insert({
                post_id: post.id,
                user_id: userId,
            });
        }

        setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id
                    ? {
                          ...p,
                          likedByUser: !liked,
                          like_count: liked
                              ? p.like_count - 1
                              : p.like_count + 1,
                      }
                    : p
            )
        );
    };

    /* ---------------- Toggle Solved ----------------- */
    const toggleSolved = async (post: any) => {
        await supabase
            .from("forum_posts")
            .update({ solved: !post.solved })
            .eq("id", post.id);

        setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id ? { ...p, solved: !p.solved } : p
            )
        );
        setOpenMenuId(null);
    };

    /* ---------------- Toggle Active ----------------- */
    const toggleActive = async (post: any) => {
        await supabase
            .from("forum_posts")
            .update({ active: !post.active })
            .eq("id", post.id);

        setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id ? { ...p, active: !p.active } : p
            )
        );
        setOpenMenuId(null);
    };

    /* ---------------- Delete Post ---------------- */
    const deletePost = async (post: any) => {
        await supabase.from("forum_posts").delete().eq("id", post.id);
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        setOpenMenuId(null);
    };

    const confirmDelete = (post: any) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone and will remove all replies and interactions associated with the post.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deletePost(post),
                },
            ]
        );
    };

    /* ---------------- Record View ----------------- */
    const recordView = async (postId: number) => {
        if (!userId) return;

        await supabase.from("forum_post_views").insert({
            post_id: postId,
            user_id: userId,
        });
    };

    const timeAgo = (dateString: string) => {
        const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    /* ============================
       RENDER POST ITEM
    ============================ */
    const renderPost = ({ item: post }: any) => (
        <TouchableOpacity
            key={post.id}
            onPress={() => {
                recordView(post.id);
                router.push(`/study-hub/forum/posts/${post.id}`);
            }}
            style={styles.postCard}
            activeOpacity={0.9}
        >
            {/* MENU */}
            {post.user_id === userId && (
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            setOpenMenuId(
                                openMenuId === post.id ? null : post.id
                            )
                        }
                    >
                        <Ionicons
                            name="ellipsis-vertical"
                            size={20}
                            color="#555"
                        />
                    </TouchableOpacity>

                    {openMenuId === post.id && (
                        <View style={styles.dropdown}>
                            {/* EDIT */}
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() =>
                                    router.push(
                                        `/study-hub/forum/posts/edit/${post.id}`
                                    )
                                }
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18}
                                    color="#111"
                                />
                                <Text style={styles.dropdownText}>
                                    Edit Post
                                </Text>
                            </TouchableOpacity>

                            {/* SOLVE */}
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => toggleSolved(post)}
                            >
                                <Ionicons
                                    name={
                                        post.solved
                                            ? "alert-circle-outline"
                                            : "checkmark-done-outline"
                                    }
                                    size={18}
                                    color="#111"
                                />
                                <Text style={styles.dropdownText}>
                                    {post.solved
                                        ? "Mark as Unsolved"
                                        : "Mark as Solved"}
                                </Text>
                            </TouchableOpacity>

                            {/* ACTIVE */}
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => toggleActive(post)}
                            >
                                <Ionicons
                                    name={
                                        post.active
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={18}
                                    color="#111"
                                />
                                <Text style={styles.dropdownText}>
                                    {post.active ? "Deactivate" : "Activate"}
                                </Text>
                            </TouchableOpacity>

                            {/* DELETE */}
                            <TouchableOpacity
                                style={[
                                    styles.dropdownItem,
                                    { borderTopWidth: 1, borderColor: "#eee" },
                                ]}
                                onPress={() => confirmDelete(post)}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={18}
                                    color="#d11"
                                />
                                <Text
                                    style={[
                                        styles.dropdownText,
                                        { color: "#d11" },
                                    ]}
                                >
                                    Delete Post
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Author row */}
            <View style={styles.authorRow}>
                <Image
                    source={{
                        uri:
                            post.users?.avatarUrl ||
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
                            }}
                        >
                            {post.solved ? "Solved" : "Unsolved"}
                        </Text>
                    </View>
                    <Text style={styles.timeText}>
                        {timeAgo(post.created_at)}
                    </Text>
                </View>
            </View>

            {/* Title */}
            <Text style={styles.postTitle}>{post.title}</Text>

            {/* Tags */}
            <View style={styles.tagRow}>
                {post.tags?.map((tag: string, i: number) => (
                    <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>

            {/* Attachment */}
            {post.attachments &&
                post.attachments.length > 0 &&
                isImageFile(post.attachments[0]) && (
                    <Image
                        source={{ uri: getImageUrl(post.attachments[0]) }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}

            {/* Content */}
            <Text style={styles.postContent}>
                {post.content.length > 200
                    ? post.content.slice(0, 200) + "..."
                    : post.content}
            </Text>

            {/* Actions */}
            <View style={styles.actionsRow}>
                {/* Comments */}
                <View style={styles.metaItem}>
                    <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="#555"
                    />
                    <Text style={styles.metaText}>{post.comment_count}</Text>
                </View>

                {/* Likes */}
                <TouchableOpacity
                    onPress={() => toggleLike(post)}
                    style={styles.metaItem}
                >
                    <Ionicons
                        name={post.likedByUser ? "heart" : "heart-outline"}
                        size={18}
                        color={post.likedByUser ? "#e11d48" : "#555"}
                    />
                    <Text style={styles.metaText}>{post.like_count}</Text>
                </TouchableOpacity>

                {/* Views */}
                <View style={styles.metaItem}>
                    <Ionicons name="eye-outline" size={18} color="#555" />
                    <Text style={styles.metaText}>{post.view_count}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    /* ============================
       MAIN RENDER
    ============================ */
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>

                <View>
                    <Text style={styles.headerTitle}>Forum Discussion</Text>
                    <Text style={styles.headerSubtitle}>{forum?.subject}</Text>
                </View>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 50 }}
                onEndReached={() => fetchPosts(false)}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    hasMore ? (
                        <ActivityIndicator
                            size="small"
                            color="#4F46E5"
                            style={{ marginVertical: 20 }}
                        />
                    ) : (
                        <Text style={{ textAlign: "center", margin: 10 }}>
                            No more posts
                        </Text>
                    )
                }
            />
        </View>
    );
}

/* --------------------------------------------- */
/* Styles */
/* --------------------------------------------- */

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
        gap: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    headerSubtitle: { fontSize: 13, color: "#666" },

    postCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        position: "relative",
    },

    menuContainer: {
        position: "absolute",
        top: 16,
        right: 12,
        zIndex: 999,
    },

    dropdown: {
        marginTop: 6,
        backgroundColor: "#fff",
        width: 200,
        borderRadius: 14,
        paddingVertical: 10,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        position: "absolute",
        right: 0,
        top: 22,
        zIndex: 9999,
    },

    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
    },

    dropdownText: { marginLeft: 10, fontSize: 14, color: "#111" },

    authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    authorName: { fontWeight: "600", fontSize: 15, color: "#111" },
    timeText: { fontSize: 12, color: "#666" },

    postTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
        color: "#111",
    },

    postImage: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginBottom: 14,
        backgroundColor: "#f3f4f6",
    },

    postContent: {
        color: "#333",
        fontSize: 14,
        marginBottom: 14,
        lineHeight: 20,
    },

    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
    },

    tag: {
        backgroundColor: "#E5E7EB",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
    },

    tagText: { color: "#333", fontSize: 12 },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },

    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 18,
    },

    metaText: { marginLeft: 4, fontSize: 13, color: "#444" },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
