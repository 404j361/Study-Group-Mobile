import GlobalLearning from "@/components/icons/GlobalLearning";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function Loading() {
    const { colors } = useTheme(); // ✅ get current theme colors
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const spinLoop = () => {
            spinAnim.setValue(0);
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => spinLoop());
        };

        spinLoop();
    }, [spinAnim]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <GlobalLearning width={120} height={120} color={colors.text} />
            <Text style={[styles.text, { color: colors.text }]}>
                Campus Circle
            </Text>

            {/* Spinning Icon */}
            <Animated.View
                style={{ transform: [{ rotate: spin }], marginTop: 20 }}
            >
                <Svg width={40} height={40} viewBox="0 0 50 50" fill="none">
                    <Circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke={colors.text} // ✅ dynamic color
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="31.4 31.4"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 10,
        fontSize: 30,
        fontWeight: "600",
    },
});
