import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
    icon: React.ReactNode;
    title: string;
    onPress?: () => void;
};

export default function StudyCard({ icon, title, onPress }: Props) {
    return (
        <View style={styles.card} onTouchEnd={onPress}>
            {icon}
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
    );
}
