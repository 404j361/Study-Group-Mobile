import { useTheme } from "@react-navigation/native";
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
    const theme = useTheme();

    const rawProgress = total > 0 ? current / total : 0;
    const progress = Math.min(rawProgress, 1);

    return (
        <View style={{ marginBottom: 16 }}>
            <View style={styles.progressRow}>
                <Text
                    style={{
                        ...styles.progressLabel,
                        color: theme.colors.text,
                    }}
                >
                    {label}
                </Text>
                <Text
                    style={{
                        ...styles.progressValue,
                        color: theme.colors.text,
                    }}
                >
                    {current}/{total}
                </Text>
            </View>
            <View
                style={{
                    ...styles.progressBarBackground,
                    backgroundColor: theme.colors.border,
                }}
            >
                <View
                    style={[
                        styles.progressBarFill,
                        {
                            width: `${progress * 100}%`,
                            backgroundColor: theme.colors.text,
                        },
                    ]}
                />
            </View>
        </View>
    );
}
