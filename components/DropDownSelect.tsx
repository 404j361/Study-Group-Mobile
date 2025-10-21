import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

type DropdownSelectProps = {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
};

export default function DropdownSelect({
    label,
    value,
    options,
    onSelect,
}: DropdownSelectProps) {
    const [visible, setVisible] = useState(false);
    const theme = useTheme();

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
                {label}
            </Text>

            <TouchableOpacity
                style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 8,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                onPress={() => setVisible(true)}
            >
                <Text style={{ color: theme.colors.text, flex: 1 }}>
                    {value || "Select..."}
                </Text>
                <Ionicons
                    name="chevron-down"
                    color={theme.colors.text}
                    size={18}
                />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 20,
                    }}
                    activeOpacity={1}
                    onPressOut={() => setVisible(false)}
                >
                    <View
                        style={{
                            backgroundColor: theme.colors.background,
                            borderRadius: 12,
                            width: "100%",
                            maxHeight: 400,
                        }}
                    >
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelect(item);
                                        setVisible(false);
                                    }}
                                    style={{
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: theme.colors.border,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            fontWeight:
                                                item === value ? "600" : "400",
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
