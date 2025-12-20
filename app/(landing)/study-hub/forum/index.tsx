import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* Helpers */
const isImageFile = (filename: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

const getImageUrl = (path: string) => {
    const { data } = supabase.storage
        .from("forum_attachments")
        .getPublicUrl(path);
    return data.publicUrl;
};

export default function Forum() {
    const { colors } = useTheme();

    const [activeTab, setActiveTab] = useState<"categories" | "myposts">(
        "categories"
    );
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [forums, setForums] = useState<any[]>([]);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    /* Menu open state */
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            setUserId(data.user?.id ?? null);
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        fetchForums();
        fetchMyPosts();
    }, [userId]);

    const fetchForums = async () => {
        const { data, error } = await supabase
            .from("forums")
            .select("id, name, category, subject")
            .order("created_at", { ascending: false });

        if (!error) setForums(data || []);
        setLoading(false);
    };

    /* ---------------------------------------
       FETCH MY POSTS WITH FULL DETAILS
    ---------------------------------------- */
    const fetchMyPosts = async () => {
        if (!userId) return;

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
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            const formatted = data.map((post) => ({
                ...post,
                likedByUser: post.forum_post_likes.some(
                    (l: any) => l.user_id === userId
                ),
                like_count: post.forum_post_likes.length,
                view_count: post.forum_post_views.length,
                comment_count: post.forum_replies?.[0]?.count ?? 0,
            }));
            setMyPosts(formatted);
        }
    };

    /* ---------------------------------------
       ACTION HANDLERS
    ---------------------------------------- */
    const toggleSolved = async (post: any) => {
        await supabase
            .from("forum_posts")
            .update({ solved: !post.solved })
            .eq("id", post.id);

        setMyPosts((prev) =>
            prev.map((p) =>
                p.id === post.id ? { ...p, solved: !p.solved } : p
            )
        );

        setOpenMenuId(null);
    };

    const toggleActive = async (post: any) => {
        await supabase
            .from("forum_posts")
            .update({ active: !post.active })
            .eq("id", post.id);

        setMyPosts((prev) =>
            prev.map((p) =>
                p.id === post.id ? { ...p, active: !p.active } : p
            )
        );

        setOpenMenuId(null);
    };

    const deletePost = async (post: any) => {
        await supabase.from("forum_posts").delete().eq("id", post.id);

        setMyPosts((prev) => prev.filter((p) => p.id !== post.id));
        setOpenMenuId(null);
    };

    const toggleLike = async (post: any) => {
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

        setMyPosts((prev) =>
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

    const timeAgo = (dateString: string) => {
        const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const filteredForums = forums.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <View
                style={[styles.center, { backgroundColor: colors.background }]}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Forums
                    </Text>
                    <Text
                        style={[styles.headerSubtitle, { color: colors.text }]}
                    >
                        Connect with your study community
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.newPostButton,
                        { backgroundColor: colors.primary },
                    ]}
                    onPress={() => router.push("/study-hub/forum/create")}
                >
                    <Ionicons name="add" size={18} color={colors.background} />
                    <Text
                        style={[
                            styles.newPostText,
                            { color: colors.background },
                        ]}
                    >
                        New Post
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                <Ionicons
                    name="search-outline"
                    size={18}
                    color={colors.border}
                />
                <TextInput
                    placeholder="Search discussions"
                    placeholderTextColor={colors.border}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Tabs */}
            <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    onPress={() => setActiveTab("categories")}
                    style={[
                        styles.tabButton,
                        activeTab === "categories" && {
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "categories" && {
                                color: colors.text,
                            },
                        ]}
                    >
                        Categories
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab("myposts")}
                    style={[
                        styles.tabButton,
                        activeTab === "myposts" && {
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "myposts" && { color: colors.text },
                        ]}
                    >
                        My Posts
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Categories */}
            {activeTab === "categories" && (
                <View style={{ marginTop: 8 }}>
                    {filteredForums.length === 0 ? (
                        <Text
                            style={[styles.emptyText, { color: colors.border }]}
                        >
                            No forums available.
                        </Text>
                    ) : (
                        filteredForums.map((forum) => (
                            <TouchableOpacity
                                key={forum.id}
                                style={[
                                    styles.categoryCard,
                                    { backgroundColor: colors.card },
                                ]}
                                onPress={() =>
                                    router.push(`/study-hub/forum/${forum.id}`)
                                }
                            >
                                <View>
                                    <Text
                                        style={[
                                            styles.categoryTitle,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {forum.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.categorySubtitle,
                                            { color: colors.border },
                                        ]}
                                    >
                                        {forum.category} • {forum.subject}
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={20}
                                    color={colors.border}
                                />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}

            {/* ================================================
                MY POSTS — REAL DATA DISPLAY
            ================================================= */}
            {activeTab === "myposts" && (
                <View style={{ marginTop: 12 }}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Your Recent Posts
                    </Text>

                    {myPosts.length === 0 ? (
                        <Text
                            style={[styles.emptyText, { color: colors.border }]}
                        >
                            No posts yet.
                        </Text>
                    ) : (
                        myPosts.map((post) => (
                            <TouchableOpacity
                                key={post.id}
                                onPress={() =>
                                    router.push(
                                        `/study-hub/forum/posts/${post.id}`
                                    )
                                }
                                style={[
                                    styles.postCard,
                                    { backgroundColor: colors.card },
                                ]}
                                activeOpacity={0.9}
                            >
                                {/* 3 DOTS MENU */}
                                <View style={styles.menuContainer}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setOpenMenuId(
                                                openMenuId === post.id
                                                    ? null
                                                    : post.id
                                            )
                                        }
                                    >
                                        <Ionicons
                                            name="ellipsis-vertical"
                                            size={20}
                                            color={colors.border}
                                        />
                                    </TouchableOpacity>

                                    {openMenuId === post.id && (
                                        <View
                                            style={[
                                                styles.dropdown,
                                                {
                                                    backgroundColor:
                                                        colors.card,
                                                },
                                            ]}
                                        >
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
                                                    color={colors.text}
                                                />
                                                <Text
                                                    style={[
                                                        styles.dropdownText,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    Edit Post
                                                </Text>
                                            </TouchableOpacity>

                                            {/* SOLVE */}
                                            <TouchableOpacity
                                                style={styles.dropdownItem}
                                                onPress={() =>
                                                    toggleSolved(post)
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        post.solved
                                                            ? "alert-circle-outline"
                                                            : "checkmark-done-outline"
                                                    }
                                                    size={18}
                                                    color={colors.text}
                                                />
                                                <Text
                                                    style={[
                                                        styles.dropdownText,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    {post.solved
                                                        ? "Mark as Unsolved"
                                                        : "Mark as Solve"}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* ACTIVATE */}
                                            <TouchableOpacity
                                                style={styles.dropdownItem}
                                                onPress={() =>
                                                    toggleActive(post)
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        post.active
                                                            ? "eye-off-outline"
                                                            : "eye-outline"
                                                    }
                                                    size={18}
                                                    color={colors.text}
                                                />
                                                <Text
                                                    style={[
                                                        styles.dropdownText,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    {post.active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* DELETE */}
                                            <TouchableOpacity
                                                style={[
                                                    styles.dropdownItem,
                                                    {
                                                        borderTopWidth: 1,
                                                        borderColor:
                                                            colors.border,
                                                    },
                                                ]}
                                                onPress={() => deletePost(post)}
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

                                {/* AUTHOR */}
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
                                            <Text
                                                style={[
                                                    styles.authorName,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {post.users?.fullName}
                                            </Text>

                                            {/* SOLVED / UNSOLVED BADGE */}
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    color: post.solved
                                                        ? "#065f46"
                                                        : "#991b1b",
                                                    backgroundColor: post.solved
                                                        ? "#d1fae5"
                                                        : "#fee2e2",
                                                    padding: 4,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                {post.solved
                                                    ? "solved"
                                                    : "unsolved"}
                                            </Text>
                                        </View>

                                        <Text
                                            style={[
                                                styles.timeText,
                                                { color: colors.border },
                                            ]}
                                        >
                                            {timeAgo(post.created_at)}
                                        </Text>
                                    </View>
                                </View>

                                {/* TITLE */}
                                <Text
                                    style={[
                                        styles.postTitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    {post.title}
                                </Text>

                                {/* TAGS */}
                                <View style={styles.tagRow}>
                                    {post.tags?.map(
                                        (tag: string, i: number) => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.tag,
                                                    {
                                                        backgroundColor:
                                                            colors.border,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.tagText,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    {tag}
                                                </Text>
                                            </View>
                                        )
                                    )}
                                </View>

                                {/* IMAGE PREVIEW */}
                                {post.attachments &&
                                    post.attachments.length > 0 &&
                                    isImageFile(post.attachments[0]) && (
                                        <Image
                                            source={{
                                                uri: getImageUrl(
                                                    post.attachments[0]
                                                ),
                                            }}
                                            style={styles.postImage}
                                            resizeMode="cover"
                                        />
                                    )}

                                {/* CONTENT PREVIEW */}
                                <Text
                                    style={[
                                        styles.postContent,
                                        { color: colors.text },
                                    ]}
                                >
                                    {post.content?.length > 200
                                        ? post.content.slice(0, 200) + "..."
                                        : post.content}
                                </Text>

                                {/* ACTIONS */}
                                <View style={styles.actionsRow}>
                                    <View style={styles.metaItem}>
                                        <Ionicons
                                            name="chatbubble-outline"
                                            size={18}
                                            color={colors.border}
                                        />
                                        <Text
                                            style={[
                                                styles.metaText,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {post.comment_count}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => toggleLike(post)}
                                        style={styles.metaItem}
                                    >
                                        <Ionicons
                                            name={
                                                post.likedByUser
                                                    ? "heart"
                                                    : "heart-outline"
                                            }
                                            size={18}
                                            color={
                                                post.likedByUser
                                                    ? "#e11d48"
                                                    : colors.border
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.metaText,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {post.like_count}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.metaItem}>
                                        <Ionicons
                                            name="eye-outline"
                                            size={18}
                                            color={colors.border}
                                        />
                                        <Text
                                            style={[
                                                styles.metaText,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {post.view_count}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}
        </ScrollView>
    );
}

/* ============================================================
   STYLES
============================================================ */
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: "700" },
    headerSubtitle: { fontSize: 13, marginTop: 2 },

    newPostButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    newPostText: { fontWeight: "500", marginLeft: 6 },

    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

    tabRow: {
        flexDirection: "row",
        borderRadius: 10,
        padding: 4,
        marginBottom: 12,
    },
    tabButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        borderRadius: 8,
    },
    tabText: { fontWeight: "500" },

    categoryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    categoryTitle: { fontWeight: "600", fontSize: 15 },
    categorySubtitle: { fontSize: 13 },

    emptyText: {
        textAlign: "center",
        fontSize: 14,
        marginTop: 20,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

    /* MY POSTS CARD */
    postCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        position: "relative",
    },

    menuContainer: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 999,
        elevation: 10,
    },

    dropdown: {
        position: "absolute",
        right: 0,
        top: 28,
        paddingVertical: 8,
        width: 180,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 9999,
    },

    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    dropdownText: { marginLeft: 10, fontSize: 14 },

    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 6,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    authorName: { fontWeight: "600", fontSize: 15 },
    timeText: { fontSize: 12 },

    postTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
    },

    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
    },
    tag: {
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: { fontSize: 12 },

    postImage: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginBottom: 14,
        backgroundColor: "#f3f4f6",
    },

    postContent: {
        fontSize: 14,
        marginBottom: 14,
        lineHeight: 20,
    },

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
    metaText: { marginLeft: 4, fontSize: 13 },
});
