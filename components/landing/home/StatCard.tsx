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
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{value}</Text>
                {icon}
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{change}</Text>
            </View>
        </View>
    );
}
