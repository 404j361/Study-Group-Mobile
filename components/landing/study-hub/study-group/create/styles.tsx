import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontWeight: "500",
        fontSize: 20,
    },
    headerSubContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
