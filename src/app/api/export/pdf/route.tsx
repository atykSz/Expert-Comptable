import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, userOwnsPrevisionnel } from '@/lib/auth'
import { aggregateRapportData } from '@/lib/pdf/data-aggregation'
import { renderToStream } from '@react-pdf/renderer'
import { DocumentLayout, PageLayout } from '@/components/pdf/DocumentLayout'
import { CoverPage, TOC, SIGTable, CashFlowTable, BalanceSheetTable } from '@/components/pdf/ReportComponents'
import React from 'react'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const previsionnelId = searchParams.get('id')

        if (!previsionnelId) {
            return NextResponse.json({ error: 'ID requis' }, { status: 400 })
        }

        // Auth
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            // Exception pour démo ? Non, PDF sécurisé.
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        // Access
        const hasAccess = await userOwnsPrevisionnel(
            authUser.prismaUser.id,
            authUser.prismaUser.cabinetId,
            previsionnelId
        )
        if (!hasAccess) {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
        }

        // Data Aggregation
        const rapport = await aggregateRapportData(previsionnelId)
        if (!rapport) {
            return NextResponse.json({ error: 'Prévisionnel introuvable' }, { status: 404 })
        }

        // PDF Generation
        const stream = await renderToStream(
            <DocumentLayout title={rapport.previsionnel.titre} >
                <CoverPage rapport={rapport} />

                <PageLayout title="Sommaire" >
                    <TOC />
                </PageLayout>

                < PageLayout title="Compte de Résultat" >
                    <SIGTable rapport={rapport} />
                </PageLayout>

                < PageLayout title="Plan de Trésorerie" >
                    <CashFlowTable rapport={rapport} />
                </PageLayout>

                < PageLayout title="Bilan Prévisionnel" >
                    <BalanceSheetTable rapport={rapport} />
                </PageLayout>
            </DocumentLayout>
        )

        // Return Stream
        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Dossier_Previsionnel_${rapport.previsionnel.titre.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
            }
        })

    } catch (error) {
        console.error('Erreur génération PDF:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors de la génération PDF' },
            { status: 500 }
        )
    }
}
