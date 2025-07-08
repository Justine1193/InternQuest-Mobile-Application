import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WeeklyReportScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Weekly Report Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default WeeklyReportScreen;
