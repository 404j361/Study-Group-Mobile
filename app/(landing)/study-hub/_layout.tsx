import { Stack } from "expo-router";

export default function StudyHubLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="study-group/index" />
        </Stack>
    );
}
