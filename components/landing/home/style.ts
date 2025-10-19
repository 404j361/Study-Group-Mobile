import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },
    cardTitle: {
        fontSize: 14,
        color: "#444",
        marginBottom: 8,
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: "700",
    },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#f2f2f2",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "500",
    },
    progressContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: "500",
    },
    progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressLabel: {
        fontSize: 14,
    },
    progressValue: {
        fontSize: 14,
        fontWeight: "500",
    },
    progressBarBackground: {
        width: "100%",
        height: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        marginTop: 4,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: "#000",
        borderRadius: 4,
    },
});

export default styles;
