import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Forum() {
    const [activeTab, setActiveTab] = useState<"categories" | "recent">(
        "categories"
    );
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalPosts: 0,
        solvedToday: 0,
        activeToday: 0,
    });

    const [forums, setForums] = useState<any[]>([]);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    // Modal state
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [selectedForum, setSelectedForum] = useState<any>(null);

    /* ---------------- Refresh on focus ---------------- */
    useFocusEffect(
        useCallback(() => {
            fetchAll();
        }, [])
    );

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchForums(), fetchRecentPosts(), fetchStats()]);
        setLoading(false);
    };

    /* ---------------- Fetch Forums ---------------- */
    const fetchForums = async () => {
        const { data } = await supabase
            .from("forums")
            .select("*")
            .order("created_at", { ascending: false });

        setForums(data || []);
    };

    /* ---------------- Fetch Recent Posts ---------------- */
    const isImageFile = (filename: string) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

    const getImageUrl = (path: string) => {
        const { data } = supabase.storage
            .from("forum_attachments")
            .getPublicUrl(path);
        return data.publicUrl;
    };

    const fetchRecentPosts = async () => {
        const { data, error } = await supabase
            .from("forum_posts")
            .select(
                `
            id,
            title,
            tags,
            content,
            attachments,
            solved,
            created_at,
            forums(name),
            forum_replies(count),
            forum_post_views(user_id),
            forum_post_likes(user_id)
        `
            )
            .order("created_at", { ascending: false })
            .limit(10);

        if (!data || error) return;

        const formatted = data.map((post: any) => ({
            ...post,
            commentCount: post.forum_replies?.[0]?.count ?? 0,
            viewCount: post.forum_post_views?.length ?? 0,
            likeCount: post.forum_post_likes?.length ?? 0,
        }));

        setRecentPosts(formatted);
    };

    /* ---------------- Stats ---------------- */
    const fetchStats = async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const isoStart = startOfDay.toISOString();

        const { count: totalPosts } = await supabase
            .from("forum_posts")
            .select("id", { count: "exact", head: true });

        const { count: solvedToday } = await supabase
            .from("forum_posts")
            .select("id", { count: "exact", head: true })
            .eq("solved", true)
            .gte("created_at", isoStart);

        const { count: activeToday } = await supabase
            .from("forum_posts")
            .select("id", { count: "exact", head: true })
            .gte("created_at", isoStart);

        setStats({
            totalPosts: totalPosts ?? 0,
            solvedToday: solvedToday ?? 0,
            activeToday: activeToday ?? 0,
        });
    };

    /* ---------------- Disable Forum ---------------- */
    const disableForum = async () => {
        if (!selectedForum) return;

        await supabase
            .from("forums")
            .update({ active: false })
            .eq("id", selectedForum.id);

        setShowDisableModal(false);
        setSelectedForum(null);
        fetchForums();
    };

    /* ---------------- Loading Screen ---------------- */
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>Forum Management</Text>
                        <Text style={styles.headerSubtitle}>
                            Monitor and moderate discussions
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push("/(admin)/forum/create")}
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.createButtonText}>
                            Create Forum
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.totalPosts}</Text>
                        <Text style={styles.statLabel}>Total Posts</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {stats.solvedToday}
                        </Text>
                        <Text style={styles.statLabel}>Solved Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {stats.activeToday}
                        </Text>
                        <Text style={styles.statLabel}>Active Today</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        onPress={() => setActiveTab("categories")}
                        style={[
                            styles.tabButton,
                            activeTab === "categories" && styles.activeTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "categories" &&
                                    styles.activeTabText,
                            ]}
                        >
                            Categories
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab("recent")}
                        style={[
                            styles.tabButton,
                            activeTab === "recent" && styles.activeTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "recent" && styles.activeTabText,
                            ]}
                        >
                            Recent Posts
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                {activeTab === "categories" ? (
                    <View>
                        {forums.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No forums available.
                            </Text>
                        ) : (
                            forums.map((forum) => (
                                <TouchableOpacity
                                    key={forum.id}
                                    style={styles.categoryCard}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        router.push(
                                            `/(admin)/forum/${forum.id}`
                                        )
                                    } // <-- Navigate on card tap
                                >
                                    <View>
                                        <Text style={styles.categoryTitle}>
                                            {forum.name}
                                        </Text>
                                        <Text style={styles.categorySubtitle}>
                                            {forum.category} • {forum.subject}
                                        </Text>
                                    </View>

                                    <View style={styles.categoryActions}>
                                        {/* EDIT BUTTON */}
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation(); // prevent card navigation
                                                router.push(
                                                    `/(admin)/forum/update/${forum.id}`
                                                );
                                            }}
                                            style={{ marginRight: 10 }}
                                        >
                                            <Ionicons
                                                name="create-outline"
                                                size={18}
                                                color="#555"
                                            />
                                        </TouchableOpacity>

                                        {/* DISABLE BUTTON */}
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation(); // prevent card navigation
                                                setSelectedForum(forum);
                                                setShowDisableModal(true);
                                            }}
                                        >
                                            <Ionicons
                                                name="eye-off-outline"
                                                size={20}
                                                color="#555"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                ) : (
                    /* Recent Posts tab */
                    <View>
                        {recentPosts.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No recent posts yet.
                            </Text>
                        ) : (
                            recentPosts.map((post) => (
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push(
                                            `/(admin)/forum/posts/${post.id}`
                                        )
                                    }
                                    key={post.id}
                                    style={styles.postCard}
                                >
                                    <Text style={styles.postTitle}>
                                        {post.title}
                                    </Text>

                                    {post.tags?.length > 0 && (
                                        <View style={styles.tagRow}>
                                            {post.tags.map(
                                                (tag: string, i: number) => (
                                                    <View
                                                        key={i}
                                                        style={styles.tag}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.tagText
                                                            }
                                                        >
                                                            {tag}
                                                        </Text>
                                                    </View>
                                                )
                                            )}
                                        </View>
                                    )}

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

                                    <Text style={styles.postContent}>
                                        {post.content.length > 150
                                            ? post.content.slice(0, 150) + "..."
                                            : post.content}
                                    </Text>

                                    <View style={styles.postMetaRow}>
                                        <View style={styles.metaItem}>
                                            <Ionicons
                                                name="chatbubble-outline"
                                                size={16}
                                                color="#555"
                                            />
                                            <Text style={styles.metaText}>
                                                {post.commentCount}
                                            </Text>
                                        </View>

                                        <View style={styles.metaItem}>
                                            <Ionicons
                                                name="eye-outline"
                                                size={16}
                                                color="#555"
                                            />
                                            <Text style={styles.metaText}>
                                                {post.viewCount}
                                            </Text>
                                        </View>

                                        <View style={styles.metaItem}>
                                            <Ionicons
                                                name="heart-outline"
                                                size={16}
                                                color="#555"
                                            />
                                            <Text style={styles.metaText}>
                                                {post.likeCount}
                                            </Text>
                                        </View>

                                        <Text style={styles.timeText}>
                                            {new Date(
                                                post.created_at
                                            ).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ---------- Disable Modal ---------- */}
            <Modal visible={showDisableModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Disable Forum</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to disable this forum?
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setShowDisableModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.deleteBtn]}
                                onPress={disableForum}
                            >
                                <Text style={styles.deleteText}>Disable</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
    headerSubtitle: { color: "#555", fontSize: 13, marginTop: 2 },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    createButtonText: { color: "#fff", fontWeight: "500", marginLeft: 6 },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: "#fff",
        flex: 1,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: { fontSize: 18, fontWeight: "700", color: "#111" },
    statLabel: { fontSize: 12, color: "#555", marginTop: 4 },
    tabRow: {
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
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
    activeTab: { backgroundColor: "#fff", elevation: 2 },
    tabText: { fontWeight: "500", color: "#555" },
    activeTabText: { color: "#111" },

    categoryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },

    categoryTitle: { fontWeight: "600", fontSize: 15, color: "#111" },
    categorySubtitle: { color: "#666", fontSize: 13 },
    categoryActions: { flexDirection: "row" },

    emptyText: {
        textAlign: "center",
        color: "#777",
        marginTop: 20,
        fontSize: 14,
    },

    /* Post UI */
    postCard: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    postTitle: { fontWeight: "600", fontSize: 15, marginBottom: 8 },
    tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    tag: {
        backgroundColor: "#E5E7EB",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        marginRight: 6,
    },
    tagText: { fontSize: 12, color: "#333" },
    postImage: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginBottom: 14,
        backgroundColor: "#f3f4f6",
    },
    postContent: { color: "#333", fontSize: 14, marginBottom: 14 },
    postMetaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    metaItem: { flexDirection: "row", alignItems: "center" },
    metaText: { marginLeft: 4, fontSize: 13, color: "#444" },
    timeText: { fontSize: 12, color: "#666" },

    /* Modal */
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    modalCard: {
        backgroundColor: "#fff",
        width: "80%",
        borderRadius: 14,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 15,
        textAlign: "center",
        color: "#333",
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 10,
    },
    cancelBtn: { backgroundColor: "#E5E7EB", marginRight: 8 },
    deleteBtn: { backgroundColor: "#dc2626", marginLeft: 8 },

    cancelText: { color: "#111", fontWeight: "600" },
    deleteText: { color: "#fff", fontWeight: "700" },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
