import { useTheme } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
    icon: React.ReactNode;
    title: string;
    onPress?: () => void;
};

export default function StudyCard({ icon, title, onPress }: Props) {
    const theme = useTheme();

    return (
        <View
            style={{
                ...styles.card,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
            }}
            onTouchEnd={onPress}
        >
            {icon}
            <Text style={{ ...styles.cardTitle, color: theme.colors.text }}>
                {title}
            </Text>
        </View>
    );
}
