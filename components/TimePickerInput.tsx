import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type TimePickerInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

export default function TimePickerInput({
    label,
    value,
    onChange,
}: TimePickerInputProps) {
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [time, setTime] = useState<Date | undefined>(undefined);

    const handleTimeChange = (_: any, selectedTime?: Date) => {
        setShowPicker(false);
        if (selectedTime) {
            setTime(selectedTime);
            const formatted = selectedTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
            onChange(formatted);
        }
    };

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
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
                onPress={() => setShowPicker(true)}
            >
                <Text style={{ color: theme.colors.text }}>
                    {value || "--:-- --"}
                </Text>
                <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.colors.text}
                />
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={time || new Date()}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
}
