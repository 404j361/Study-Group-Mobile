import BooksIcon from "@/components/icons/BooksIcon";
import BrainIcon from "@/components/icons/BrainIcon";
import ForumIcon from "@/components/icons/FormIcon";
import ProfilesIcon from "@/components/icons/Profiles";
import StudyCard from "@/components/landing/study-hub/StudyCard";
import { styles } from "@/components/landing/study-hub/styles";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function StudyHubIndex() {
    const theme = useTheme();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <View
                style={{
                    ...styles.headerContainer,
                    backgroundColor: theme.colors.background,
                }}
            >
                <Text style={{ ...styles.mainTitle, color: theme.colors.text }}>
                    Study Hub
                </Text>
                <Text
                    style={{
                        ...styles.subtitle,
                        color: theme.colors.text,
                    }}
                >
                    Access curated educational resources based on Subjects{" "}
                </Text>
            </View>

            {/* Study Cards */}
            <View style={styles.studyCardsContainer}>
                <StudyCard
                    icon={
                        <BooksIcon
                            width={40}
                            height={40}
                            color={theme.colors.text}
                        />
                    }
                    title="Study Materials"
                    onPress={() => router.push("/")}
                />
                <StudyCard
                    icon={
                        <ProfilesIcon
                            width={40}
                            height={40}
                            color={theme.colors.text}
                        />
                    }
                    title="Study Groups"
                    onPress={() => router.push("/study-hub/study-groups")}
                />
                <StudyCard
                    icon={
                        <BrainIcon
                            width={40}
                            height={40}
                            color={theme.colors.text}
                        />
                    }
                    title="Flash Cards"
                    onPress={() => router.push("/")}
                />
                <StudyCard
                    icon={
                        <ForumIcon
                            width={40}
                            height={40}
                            color={theme.colors.text}
                        />
                    }
                    title="Forums"
                    onPress={() => router.push("/")}
                />
            </View>
        </ScrollView>
    );
}
