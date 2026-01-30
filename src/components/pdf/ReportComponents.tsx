
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { RapportFinancier } from '@/lib/pdf/data-aggregation';
import { formatCurrency } from '@/lib/utils'; // Assurez-vous que formatCurrency est compatible PDF (pas de Intl ?)

// Styles spécifiques
const styles = StyleSheet.create({
    coverPage: {
        flexDirection: 'column',
        backgroundColor: '#111827', // Slate 900
        padding: 40,
        height: '100%',
        justifyContent: 'center',
    },
    coverTitle: {
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    coverSubtitle: {
        fontSize: 18,
        color: '#9CA3AF',
        marginBottom: 60,
    },
    coverHighlight: {
        backgroundColor: '#2563EB',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
    },
    coverHighlightText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
    label: {
        color: '#9CA3AF',
        fontSize: 10,
        marginBottom: 5,
    },
    value: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    // Tableaux
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#4B5563',
        textAlign: 'right',
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F3F4F6',
    },
    tableRowLabel: {
        flex: 2,
        fontSize: 9,
        color: '#1F2937',
    },
    tableCell: {
        flex: 1,
        fontSize: 9,
        textAlign: 'right',
        color: '#374151',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 20,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
    }
});

// Helper pour formatage sûr
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

// Lignes pour les tableaux
const Row = ({ label, v1, v2, v3, bold = false, indent = false }: any) => (
    <View style={[styles.tableRow, bold ? { backgroundColor: '#F9FAFB' } : {}]}>
        <Text style={[styles.tableRowLabel, bold ? { fontWeight: 'bold' } : {}, indent ? { paddingLeft: 10, color: '#4B5563' } : {}]}>{label}</Text>
        <Text style={[styles.tableCell, bold ? { fontWeight: 'bold' } : {}]}>{v1 !== undefined ? formatMoney(v1) : ''}</Text>
        <Text style={[styles.tableCell, bold ? { fontWeight: 'bold' } : {}]}>{v2 !== undefined ? formatMoney(v2) : ''}</Text>
        <Text style={[styles.tableCell, bold ? { fontWeight: 'bold' } : {}]}>{v3 !== undefined ? formatMoney(v3) : ''}</Text>
    </View>
);


export const CoverPage: React.FC<{ rapport: RapportFinancier }> = ({ rapport }) => (
    <View style={styles.coverPage}>
        <Text style={styles.coverTitle}>Dossier Prévisionnel</Text>
        <Text style={styles.coverSubtitle}>{rapport.previsionnel.titre}</Text>

        <View style={styles.coverHighlight}>
            <Text style={styles.coverHighlightText}>Date d'établissement : {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>

        <View style={{ marginTop: 40 }}>
            <Text style={styles.label}>Cabinet d'Expertise Comptable</Text>
            <Text style={styles.value}>Moni Expertise</Text>

            <Text style={styles.label}>Période Prévisionnelle</Text>
            <Text style={styles.value}>3 Ans ({new Date().getFullYear()} - {new Date().getFullYear() + 2})</Text>

            <Text style={styles.label}>Besoin de Financement Initial</Text>
            <Text style={[styles.value, { color: '#34D399' }]}>{formatMoney(Math.abs(rapport.indicateurs.tresorerieFinale)) /* Exemple simpliste */}</Text>
        </View>
    </View>
);

export const TOC: React.FC = () => (
    <View style={{ padding: 40 }}>
        <Text style={styles.sectionTitle}>Sommaire</Text>
        <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 12, marginBottom: 10 }}>1. Compte de Résultat Prévisionnel .................................... 3</Text>
            <Text style={{ fontSize: 12, marginBottom: 10 }}>2. Plan de Trésorerie Mensuel ........................................... 4</Text>
            <Text style={{ fontSize: 12, marginBottom: 10 }}>3. Bilan Prévisionnel (Actif / Passif) .............................. 5</Text>
            <Text style={{ fontSize: 12, marginBottom: 10 }}>4. Hypothèses & Investissements ..................................... 6</Text>
        </View>
    </View>
);

export const SIGTable: React.FC<{ rapport: RapportFinancier }> = ({ rapport }) => {
    const { annee1, annee2, annee3 } = rapport.compteResultat;

    return (
        <View>
            <Text style={styles.sectionTitle}>1. Compte de Résultat Simplifié (SIG)</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{ flex: 2 }}></Text>
                    <Text style={styles.tableHeaderCell}>Année 1</Text>
                    <Text style={styles.tableHeaderCell}>Année 2</Text>
                    <Text style={styles.tableHeaderCell}>Année 3</Text>
                </View>
                <Row label="Chiffre d'Affaires" v1={annee1.ca} v2={annee2.ca} v3={annee3.ca} bold />
                <Row label="Marge Global" v1={annee1.margeBrute} v2={annee2.margeBrute} v3={annee3.margeBrute} />
                <Row label="Valeur Ajoutée" v1={annee1.valeurAjoutee} v2={annee2.valeurAjoutee} v3={annee3.valeurAjoutee} />
                <Row label="EBE" v1={annee1.ebe} v2={annee2.ebe} v3={annee3.ebe} bold />
                <Row label="Résultat d'Exploitation" v1={annee1.resultatExploitation} v2={annee2.resultatExploitation} v3={annee3.resultatExploitation} />
                <Row label="Résultat Net" v1={annee1.resultatNet} v2={annee2.resultatNet} v3={annee3.resultatNet} bold />
                <Row label="CAF" v1={annee1.caf} v2={annee2.caf} v3={annee3.caf} />
            </View>
        </View>
    );
}

export const CashFlowTable: React.FC<{ rapport: RapportFinancier }> = ({ rapport }) => {
    // On affiche les 12 premiers mois
    const firstYear = rapport.tresorerie.slice(0, 12);
    // Simplification : on affiche par trimestre pour que ça rentre en largeur
    // Ou bien juste les 6 premiers mois

    // Option : Afficher 3 colonnes : Début, Milieu, Fin d'année
    const m1 = firstYear[0];
    const m6 = firstYear[5];
    const m12 = firstYear[11];

    if (!m1) return <Text>Aucune donnée de trésorerie</Text>;

    return (
        <View break>
            <Text style={styles.sectionTitle}>2. Plan de Trésorerie (Extraits Année 1)</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{ flex: 2 }}></Text>
                    <Text style={styles.tableHeaderCell}>{m1.mois}</Text>
                    <Text style={styles.tableHeaderCell}>{m6?.mois || '-'}</Text>
                    <Text style={styles.tableHeaderCell}>{m12?.mois || '-'}</Text>
                </View>
                <Row label="Trésorerie Début" v1={m1.tresorerieFin - m1.soldeFlux} v2={m6 ? m6.tresorerieFin - m6.soldeFlux : 0} v3={m12 ? m12.tresorerieFin - m12.soldeFlux : 0} />
                <Row label="Total Encaissements" v1={m1.encaissements.total} v2={m6?.encaissements.total} v3={m12?.encaissements.total} indent />
                <Row label="Total Décaissements" v1={m1.decaissements.total} v2={m6?.decaissements.total} v3={m12?.decaissements.total} indent />
                <Row label="Solde du mois" v1={m1.soldeFlux} v2={m6?.soldeFlux} v3={m12?.soldeFlux} bold />
                <Row label="Trésorerie Fin" v1={m1.tresorerieFin} v2={m6?.tresorerieFin} v3={m12?.tresorerieFin} bold />
            </View>
            <Text style={{ fontSize: 9, color: 'gray', marginTop: 5 }}>* Affichage simplifié : Mois 1, Mois 6 et Mois 12.</Text>
        </View>
    )
}


export const BalanceSheetTable: React.FC<{ rapport: RapportFinancier }> = ({ rapport }) => {
    const b1 = rapport.bilan[0];
    const b2 = rapport.bilan[1];
    const b3 = rapport.bilan[2];

    if (!b1) return null;

    return (
        <View break>
            <Text style={styles.sectionTitle}>3. Bilan Prévisionnel</Text>

            {/* Actif */}
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>ACTIF</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{ flex: 2 }}></Text>
                    <Text style={styles.tableHeaderCell}>Année 1</Text>
                    <Text style={styles.tableHeaderCell}>Année 2</Text>
                    <Text style={styles.tableHeaderCell}>Année 3</Text>
                </View>
                <Row label="Actif Immobilisé (Net)" v1={b1.actif.immobilisationsNet} v2={b2?.actif.immobilisationsNet} v3={b3?.actif.immobilisationsNet} bold />
                <Row label="Stocks" v1={b1.actif.stocks} v2={b2?.actif.stocks} v3={b3?.actif.stocks} indent />
                <Row label="Créances Clients" v1={b1.actif.creancesClients} v2={b2?.actif.creancesClients} v3={b3?.actif.creancesClients} indent />
                <Row label="Disponibilités" v1={b1.actif.disponibilites} v2={b2?.actif.disponibilites} v3={b3?.actif.disponibilites} indent />
                <Row label="TOTAL ACTIF" v1={b1.actif.total} v2={b2?.actif.total} v3={b3?.actif.total} bold />
            </View>

            {/* Passif */}
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>PASSIF</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{ flex: 2 }}></Text>
                    <Text style={styles.tableHeaderCell}>Année 1</Text>
                    <Text style={styles.tableHeaderCell}>Année 2</Text>
                    <Text style={styles.tableHeaderCell}>Année 3</Text>
                </View>
                <Row label="Capitaux Propres" v1={b1.passif.capitalSocial + b1.passif.resultatNet + b1.passif.reportANouveau} v2={b2 ? b2.passif.capitalSocial + b2.passif.resultatNet + b2.passif.reportANouveau : 0} v3={b3 ? b3.passif.capitalSocial + b3.passif.resultatNet + b3.passif.reportANouveau : 0} bold />
                <Row label="Emprunts Bancaires" v1={b1.passif.emprunts} v2={b2?.passif.emprunts} v3={b3?.passif.emprunts} indent />
                <Row label="Dettes Fournisseurs" v1={b1.passif.dettesFournisseurs} v2={b2?.passif.dettesFournisseurs} v3={b3?.passif.dettesFournisseurs} indent />
                <Row label="Dettes Fiscales/Sociales" v1={b1.passif.dettesFiscalesSociales} v2={b2?.passif.dettesFiscalesSociales} v3={b3?.passif.dettesFiscalesSociales} indent />
                <Row label="TOTAL PASSIF" v1={b1.passif.total} v2={b2?.passif.total} v3={b3?.passif.total} bold />
            </View>
        </View>
    )
}
