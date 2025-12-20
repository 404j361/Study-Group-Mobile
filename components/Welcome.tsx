import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

import BooksIcon from "./icons/BooksIcon";
import GraduationCap from "./icons/GraduationCap";
import ProfilesIcon from "./icons/Profiles";
import SettingIcon from "./icons/SettingIcon";
import TrendingIcon from "./icons/TrendingIcon";

const { width } = Dimensions.get("window");

// Use the icon components directly
const icons = [
    GraduationCap,
    ProfilesIcon,
    BooksIcon,
    TrendingIcon,
    SettingIcon,
];

// Data for carousel
const data = [
    {
        title: "Welcome to Campus Circle",
        subtitle: "Your comprehensive study companion for academic success",
        icon: icons[0],
        button: "Next",
    },
    {
        title: "Join Study Groups",
        subtitle: "Connect with peers and collaborate on challenging subjects",
        icon: icons[1],
        button: "Next",
    },
    {
        title: "Access Study Materials",
        subtitle: "Find curated resources, notes, and practice materials",
        icon: icons[2],
        button: "Next",
    },
    {
        title: "Track Your Progress",
        subtitle: "Monitor your learning journey with detailed analytics",
        icon: icons[3],
        button: "Next",
    },
    {
        title: "Tools to Help Your Study",
        subtitle:
            "Boost your focus, stay organized, and reach your study goals",
        icon: icons[4],
        button: "Continue",
    },
];

export default function Welcome() {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<any>(null);

    const renderItem = ({ item }: any) => {
        const Icon = item.icon;
        return (
            <View style={styles.slide}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Icon color={colors.text} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                    {item.title}
                </Text>
                <Text style={[styles.subtitle, { color: colors.text + "99" }]}>
                    {item.subtitle}
                </Text>
            </View>
        );
    };

    const handleNext = () => {
        if (currentIndex < data.length - 1) {
            carouselRef.current?.scrollTo({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            router.replace("/(auth)/sign-in");
        }
    };

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.carouselWrapper}>
                <Carousel
                    ref={carouselRef}
                    loop={false}
                    width={width}
                    height={230}
                    data={data}
                    scrollAnimationDuration={500}
                    onSnapToItem={(index) => setCurrentIndex(index)}
                    renderItem={renderItem}
                />

                {/* Pagination dots */}
                <View style={styles.dots}>
                    {data.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        index === currentIndex
                                            ? colors.primary
                                            : colors.border,
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Button */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleNext}
            >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                    {data[currentIndex].button}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    carouselWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    slide: {
        width,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    iconContainer: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 10,
    },
    dots: {
        flexDirection: "row",
        marginTop: 20,
        marginBottom: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    button: {
        minWidth: "90%",
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 10,
        marginBottom: 30,
    },
    buttonText: {
        fontWeight: "600",
        textAlign: "center",
    },
});
