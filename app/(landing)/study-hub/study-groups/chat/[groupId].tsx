import MembersTab from "@/components/landing/study-hub/study-group/chat/MemberTab";
import StudyMaterialsTab from "@/components/landing/study-hub/study-group/chat/StudyMaterialTab";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { decode } from "base64-arraybuffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Polyfill atob if needed
if (typeof atob === "undefined") {
    global.atob = (input: string) =>
        Buffer.from(input, "base64").toString("binary");
}

interface Message {
    id: string;
    message: string;
    senderId: string;
    filePath?: string | null;
    type?: string;
    groupId: string;
    created_at?: string;
}

type Tab = "chat" | "study_materials" | "members";

export default function ChatInbox() {
    const theme = useTheme();
    const scrollRef = useRef<ScrollView>(null);
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("chat");

    // Get current user
    useEffect(() => {
        (async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        })();
    }, []);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        if (!groupId) return;
        const { data, error } = await supabase
            .from("conversations")
            .select("*")
            .eq("groupId", groupId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error loading messages:", error.message);
            return;
        }

        setMessages(data || []);
        setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            300
        );
    }, [groupId]);

    // Real-time subscription
    useEffect(() => {
        if (!groupId) return;
        fetchMessages();

        const channel = supabase
            .channel(`group-${groupId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "conversations",
                    filter: `groupId=eq.${groupId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                    setTimeout(
                        () =>
                            scrollRef.current?.scrollToEnd({ animated: true }),
                        300
                    );
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [fetchMessages, groupId]);

    // Send text message
    const sendMessage = async () => {
        if (!messageText.trim() || !userId) return;

        const { error } = await supabase.from("conversations").insert([
            {
                message: messageText.trim(),
                senderId: userId,
                type: "message",
                groupId,
            },
        ]);

        if (error) console.error("Error sending message:", error.message);
        else setMessageText("");
    };

    const pickAndUploadFile = async () => {
        if (!userId || !groupId) return;

        try {
            const result = await DocumentPicker.getDocumentAsync({});
            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            const fileUri = asset.uri;
            const fileName = asset.name;
            const mimeType = asset.mimeType || "application/octet-stream";

            const base64Data = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const fileBuffer = decode(base64Data);

            const { data, error } = await supabase.storage
                .from("chat-files")
                .upload(`${groupId}/${Date.now()}-${fileName}`, fileBuffer, {
                    contentType: mimeType,
                    upsert: false,
                });

            if (error) throw error;

            const { data: urlData, error: urlError } = supabase.storage
                .from("chat-files")
                .getPublicUrl(data.path);

            if (urlError) throw urlError;
            const publicUrl = urlData.publicUrl;

            const { error: dbError } = await supabase
                .from("conversations")
                .insert([
                    {
                        message: fileName,
                        senderId: userId,
                        type: "file",
                        filePath: publicUrl,
                        groupId,
                    },
                ]);

            if (dbError) throw dbError;
        } catch (err: any) {
            console.error("File upload error:", err.message);
        }
    };

    // Filtered messages for study materials
    const fileMessages = messages.filter((msg) => msg.type === "file");

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={80}
        >
            {/* HEADER */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    padding: 16,
                }}
            >
                {/* Back and Title Section */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Link href={"/study-hub/study-groups"}>
                        <Ionicons
                            name="arrow-back"
                            color={theme.colors.text}
                            size={22}
                        />
                    </Link>

                    <View style={{ marginLeft: 10 }}>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontWeight: "600",
                                fontSize: 18,
                            }}
                        >
                            Group Chat
                        </Text>
                        <Text
                            style={{
                                color: theme.colors.text,
                                opacity: 0.6,
                                fontSize: 13,
                            }}
                        >
                            Group ID: {groupId}
                        </Text>
                    </View>
                </View>

                {/* Settings / Three Dot Icon */}
                <TouchableOpacity
                    onPress={() =>
                        router.push(
                            `/study-hub/study-groups/details/${groupId}`
                        )
                    }
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={theme.colors.text}
                    />
                </TouchableOpacity>
            </View>

            {/* TABS */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    marginBottom: 10,
                }}
            >
                {["chat", "study_materials", "members"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab as Tab)}
                        style={{
                            paddingVertical: 12,
                            borderBottomWidth: activeTab === tab ? 2 : 0,
                            borderBottomColor:
                                activeTab === tab
                                    ? theme.colors.text
                                    : "transparent",
                        }}
                    >
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontWeight: activeTab === tab ? "700" : "500",
                                textTransform: "capitalize",
                            }}
                        >
                            {tab.replace("_", " ")}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* CONTENT */}
            {activeTab === "chat" && (
                <ScrollView
                    ref={scrollRef}
                    style={{ flex: 1, paddingHorizontal: 16 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    {messages.map((msg) => {
                        const isMine = msg.senderId === userId;
                        return (
                            <View
                                key={msg.id}
                                style={{
                                    marginBottom: 12,
                                    alignSelf: isMine
                                        ? "flex-end"
                                        : "flex-start",
                                    maxWidth: "80%",
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: isMine
                                            ? theme.colors.text
                                            : theme.colors.card,
                                        padding: 10,
                                        borderRadius: 12,
                                    }}
                                >
                                    {msg.type === "file" ? (
                                        <TouchableOpacity
                                            onPress={() =>
                                                Linking.openURL(
                                                    msg.filePath || ""
                                                )
                                            }
                                        >
                                            <Text
                                                style={{
                                                    color: isMine
                                                        ? theme.colors
                                                              .background
                                                        : theme.colors.text,
                                                }}
                                            >
                                                📎 {msg.message}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text
                                            style={{
                                                color: isMine
                                                    ? theme.colors.background
                                                    : theme.colors.text,
                                            }}
                                        >
                                            {msg.message}
                                        </Text>
                                    )}
                                </View>
                                {msg.created_at && (
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            color: theme.colors.text,
                                            opacity: 0.6,
                                            marginTop: 2,
                                            alignSelf: isMine
                                                ? "flex-end"
                                                : "flex-start",
                                        }}
                                    >
                                        {new Date(
                                            msg.created_at
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {activeTab === "study_materials" && (
                <StudyMaterialsTab messages={fileMessages} />
            )}

            {activeTab === "members" && <MembersTab groupId={groupId} />}

            {/* MESSAGE INPUT (only in chat tab) */}
            {activeTab === "chat" && (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: theme.colors.card,
                        padding: 8,
                        marginHorizontal: 12,
                        marginBottom: Platform.OS === "ios" ? 16 : 8,
                        borderRadius: 16,
                    }}
                >
                    <TouchableOpacity
                        style={{ paddingHorizontal: 6 }}
                        onPress={pickAndUploadFile}
                    >
                        <Ionicons
                            name="attach"
                            size={22}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>

                    <TextInput
                        value={messageText}
                        onChangeText={setMessageText}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.text + "80"}
                        style={{
                            flex: 1,
                            color: theme.colors.text,
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                        }}
                    />

                    <TouchableOpacity
                        onPress={sendMessage}
                        style={{ paddingHorizontal: 6 }}
                    >
                        <Ionicons
                            name="send"
                            size={22}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
