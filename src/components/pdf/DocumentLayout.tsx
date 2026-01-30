
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed (optional for V1, default standard fonts are fine)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 10,
        color: '#374151',
        fontWeight: 'bold',
    },
    headerSub: {
        fontSize: 9,
        color: '#6B7280',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageNumber: {
        fontSize: 9,
        color: '#9CA3AF',
    },
    brand: {
        fontSize: 9,
        color: '#2563EB',
        fontWeight: 'bold',
    }
});

interface DocumentLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const DocumentLayout: React.FC<DocumentLayoutProps> = ({ children, title }) => (
    <Document title={title}>
        {children}
    </Document>
);

export const PageLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
    <Page size="A4" style={styles.page}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>Dossier Prévisionnel</Text>
        </View>

        {children}

        <View style={styles.footer} fixed>
            <Text style={styles.brand}>Moni - Expert Comptable</Text>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                `${pageNumber} / ${totalPages}`
            )} />
        </View>
    </Page>
);
