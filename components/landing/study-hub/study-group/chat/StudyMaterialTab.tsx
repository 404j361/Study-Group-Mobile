import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import {
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Message {
    id: string;
    message: string;
    senderId: string;
    filePath?: string | null;
    type?: string;
    groupId: string;
    created_at?: string;
}

const StudyMaterialsTab = ({ messages }: { messages: Message[] }) => {
    const theme = useTheme();

    // Filter only files
    const fileMessages = messages.filter((msg) => msg.type === "file");

    // Get file icon based on extension
    const getFileIcon = (name: string) => {
        const ext = name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") return "document-outline";
        if (["png", "jpg", "jpeg", "gif"].includes(ext || ""))
            return "image-outline";
        return "document-text-outline";
    };

    if (fileMessages.length === 0) {
        return (
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 12,
                        marginBottom: 12,
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: theme.colors.text }}>
                        No study materials found.
                    </Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
            {fileMessages.map((msg) => {
                const fileName = msg.message;
                const uploadedAt = msg.created_at
                    ? new Date(msg.created_at)
                    : null;

                // Extract file extension
                const fileExt =
                    fileName.split(".").pop()?.toLowerCase() || "file";

                return (
                    <View
                        key={msg.id}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 12,
                            marginBottom: 12,
                            backgroundColor: theme.colors.card,
                            borderRadius: 12,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                flex: 1,
                            }}
                        >
                            <Ionicons
                                name={getFileIcon(fileName)}
                                size={24}
                                color={theme.colors.text}
                                style={{ marginRight: 12 }}
                            />
                            <View style={{ flexShrink: 1 }}>
                                <Text
                                    style={{
                                        color: theme.colors.text,
                                        fontWeight: "500",
                                        marginBottom: 2,
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {fileName}
                                </Text>
                                {uploadedAt && (
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            opacity: 0.6,
                                            fontSize: 12,
                                        }}
                                    >
                                        {fileExt} •{" "}
                                        {uploadedAt.toLocaleDateString("en-GB")}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => Linking.openURL(msg.filePath || "")}
                            style={{ padding: 8 }}
                        >
                            <Ionicons
                                name="download-outline"
                                size={22}
                                color={theme.colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                );
            })}
        </ScrollView>
    );
};

export default StudyMaterialsTab;
