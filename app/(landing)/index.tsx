import { useTheme } from "@react-navigation/native";
import React, { useContext } from "react";
import { ScrollView, Text, View } from "react-native";

import TrendingIcon from "@/components/icons/TrendingIcon";
import ProgressRow from "@/components/landing/home/ProgressRow";
import StatCard from "@/components/landing/home/StatCard";
import styles from "@/components/landing/home/style";
import Welcome from "@/components/Welcome";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { SessionContext } from "../_layout";

export default function LandingIndex() {
    const session = useContext(SessionContext);
    const theme = useTheme();
    const user = session?.user ?? null;

    if (!user) {
        return <Welcome />;
    }

    const fullName =
        (user.user_metadata as { fullName?: string })?.fullName ?? "Student";

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View>
                        <Text
                            style={[
                                styles.welcomeText,
                                { color: theme.colors.text },
                            ]}
                        >
                            Welcome {fullName}!
                        </Text>
                        <Text
                            style={{
                                ...styles.subtitle,
                                color: theme.colors.text,
                            }}
                        >
                            Ready to continue your learning journey?
                        </Text>
                    </View>
                    <Link href="/">
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color={theme.colors.text}
                        />
                    </Link>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Study Hours"
                        value={100}
                        icon={
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+10"
                    />
                    <StatCard
                        title="Groups Joined"
                        value={6}
                        icon={
                            <Ionicons
                                name="people-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+2"
                    />
                    <StatCard
                        title="Cards Reviewed"
                        value={80}
                        icon={
                            <MaterialCommunityIcons
                                name="brain"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+18"
                    />
                    <StatCard
                        title="Avg. Score"
                        value="90%"
                        icon={
                            <Ionicons
                                name="trophy-outline"
                                size={24}
                                color={theme.colors.text}
                            />
                        }
                        change="+5%"
                    />
                </View>

                {/* Weekly Progress */}
                <View
                    style={{
                        ...styles.progressContainer,
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <TrendingIcon
                            width={24}
                            height={24}
                            color={theme.colors.text}
                        />
                        <Text
                            style={{
                                ...styles.progressTitle,
                                color: theme.colors.text,
                            }}
                        >
                            This Week’s Progress
                        </Text>
                    </View>
                    <ProgressRow label="Study Goal" current={15} total={15} />
                    <ProgressRow
                        label="Flashcard Reviews"
                        current={234}
                        total={300}
                    />
                    <ProgressRow
                        label="Forum Participation"
                        current={8}
                        total={10}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
