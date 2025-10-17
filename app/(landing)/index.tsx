import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function LandingIndex() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text>LandingIndex</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
