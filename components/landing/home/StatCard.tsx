import { useTheme } from "@react-navigation/native";
import { Text, View } from "react-native";
import styles from "./style";

// ✅ TypeScript types for props
type StatCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change: string;
};

export default function StatCard({
    title,
    value,
    icon,
    change,
}: StatCardProps) {
    const theme = useTheme();
    return (
        <View
            style={{
                ...styles.card,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
            }}
        >
            <Text style={{ ...styles.cardTitle, color: theme.colors.text }}>
                {title}
            </Text>
            <View style={{ ...styles.cardContent }}>
                <Text style={{ ...styles.cardValue, color: theme.colors.text }}>
                    {value}
                </Text>
                {icon}
            </View>
            <View
                style={{
                    ...styles.badge,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: theme.colors.text,
                }}
            >
                <Text style={{ ...styles.badgeText, color: theme.colors.text }}>
                    {change}
                </Text>
            </View>
        </View>
    );
}
