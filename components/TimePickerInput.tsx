import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type TimePickerInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    mode?: "date" | "time"; // 👈 added this prop
};

export default function TimePickerInput({
    label,
    value,
    onChange,
    mode = "time", // 👈 defaults to time
}: TimePickerInputProps) {
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

    const handleChange = (_: any, selectedValue?: Date) => {
        setShowPicker(false);
        if (selectedValue) {
            setDateValue(selectedValue);

            let formatted = "";
            if (mode === "time") {
                formatted = selectedValue.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else {
                formatted = selectedValue.toISOString().split("T")[0]; // yyyy-mm-dd
            }

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
                    {value || (mode === "date" ? "Select date" : "--:-- --")}
                </Text>
                <Ionicons
                    name={mode === "date" ? "calendar-outline" : "time-outline"}
                    size={18}
                    color={theme.colors.text}
                />
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dateValue || new Date()}
                    mode={mode}
                    is24Hour={false}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleChange}
                />
            )}
        </View>
    );
}
