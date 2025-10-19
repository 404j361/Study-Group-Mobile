import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    headerContainer: {
        marginBottom: 24,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    studyCardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "500",
    },
});
