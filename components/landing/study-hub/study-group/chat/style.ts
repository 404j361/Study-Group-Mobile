import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headerSubContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    title: {
        fontWeight: "500",
        fontSize: 20,
    },
    content: {
        fontSize: 16,
    },
    button: {
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 14,
    },
});
