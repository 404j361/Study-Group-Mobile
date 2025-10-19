import { Text, View } from "react-native";
import styles from "./style";

type ProgressRowProps = {
    label: string;
    current: number;
    total: number;
};

export default function ProgressRow({
    label,
    current,
    total,
}: ProgressRowProps) {
    const progress = Math.min(current / total, 1);

    return (
        <View style={{ marginBottom: 16 }}>
            <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={styles.progressValue}>
                    {current}/{total}
                </Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${progress * 100}%` },
                    ]}
                />
            </View>
        </View>
    );
}
