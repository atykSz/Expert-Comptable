'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Sparkles } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Modal, useToast } from '@/components/ui'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { ScenarioSliders } from '@/components/scenarios/ScenarioSliders'
import { ScenarioCompare } from '@/components/scenarios/ScenarioCompare'
import { ScenarioResult } from '@/lib/calculations/scenarios'

interface ScenarioData {
    id: string
    nom: string
    type: string
    couleur: string
    modifCA: number
    modifCharges: number
    modifDelaiPaiement: number
    resultatNetAn1?: number | null
    resultatNetAn3?: number | null
    tresorerieFinAn3?: number | null
    isDefault: boolean
    resultats: ScenarioResult
}

export default function ScenariosPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: previsionnelId } = use(params)
    const [scenarios, setScenarios] = useState<ScenarioData[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { addToast } = useToast()

    // Charger les scénarios
    const loadScenarios = useCallback(async () => {
        if (!previsionnelId) return

        try {
            const res = await fetch(`/api/previsionnels/${previsionnelId}/scenarios`)
            if (res.ok) {
                const data = await res.json()
                setScenarios(data.scenarios || [])
                // Sélectionner tous par défaut
                setSelectedIds(data.scenarios?.map((s: ScenarioData) => s.id) || [])
            }
        } catch (error) {
            console.error('Erreur chargement scénarios:', error)
        } finally {
            setLoading(false)
        }
    }, [previsionnelId])

    useEffect(() => {
        loadScenarios()
    }, [loadScenarios])

    // Créer les scénarios par défaut
    const createDefaultScenarios = async () => {
        setCreating(true)
        try {
            const types = ['OPTIMISTE', 'REALISTE', 'PESSIMISTE']
            for (const type of types) {
                await fetch(`/api/previsionnels/${previsionnelId}/scenarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type,
                        nom: type.charAt(0) + type.slice(1).toLowerCase(),
                        isDefault: type === 'REALISTE'
                    })
                })
            }
            await loadScenarios()
            addToast('Scénarios créés avec succès', 'success')
        } catch (error) {
            console.error('Erreur création scénarios:', error)
            addToast('Erreur lors de la création', 'error')
        } finally {
            setCreating(false)
        }
    }

    // Créer un scénario personnalisé
    const createScenario = async (values: {
        nom: string
        type: string
        modifCA: number
        modifCharges: number
        modifDelaiPaiement: number
    }) => {
        setCreating(true)
        try {
            const res = await fetch(`/api/previsionnels/${previsionnelId}/scenarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            })

            if (res.ok) {
                await loadScenarios()
                setShowCreate(false)
                addToast('Scénario créé avec succès', 'success')
            } else {
                throw new Error('Erreur création')
            }
        } catch (error) {
            console.error('Erreur:', error)
            addToast('Erreur lors de la création', 'error')
        } finally {
            setCreating(false)
        }
    }

    // Supprimer un scénario
    const deleteScenario = async (scenarioId: string) => {
        try {
            const res = await fetch(`/api/previsionnels/${previsionnelId}/scenarios?scenarioId=${scenarioId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                await loadScenarios()
                addToast('Scénario supprimé', 'success')
            }
        } catch (error) {
            console.error('Erreur suppression:', error)
            addToast('Erreur lors de la suppression', 'error')
        }
    }

    // Toggle sélection pour comparaison
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        )
    }

    // Scénarios sélectionnés pour comparaison
    const selectedScenarios = scenarios
        .filter(s => selectedIds.includes(s.id))
        .map(s => ({
            nom: s.nom,
            couleur: s.couleur,
            resultats: s.resultats
        }))

    // Années (depuis le premier scénario)
    const annees = scenarios[0]?.resultats?.annees || [2024, 2025, 2026]

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background">
                <PrevisionnelSidebar previsionnelId={previsionnelId} />
                <main className="flex-1 p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-secondary rounded w-1/3"></div>
                        <div className="h-64 bg-secondary rounded"></div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <PrevisionnelSidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link href={`/previsionnel/${previsionnelId}/dashboard`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Retour au tableau de bord
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight">Scénarios & Simulations</h1>
                        <p className="text-muted-foreground">Comparez différentes hypothèses de votre prévisionnel</p>
                    </div>
                    <div className="flex gap-3">
                        {scenarios.length === 0 && (
                            <Button onClick={createDefaultScenarios} isLoading={creating}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Créer les scénarios par défaut
                            </Button>
                        )}
                        <Button onClick={() => setShowCreate(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau scénario
                        </Button>
                    </div>
                </div>

                {/* Liste des scénarios */}
                {scenarios.length > 0 ? (
                    <>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">Vos Scénarios</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {scenarios.map(scenario => (
                                    <ScenarioCard
                                        key={scenario.id}
                                        {...scenario}
                                        isSelected={selectedIds.includes(scenario.id)}
                                        onSelect={() => toggleSelection(scenario.id)}
                                        onDelete={() => deleteScenario(scenario.id)}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                                Cliquez sur les scénarios pour les inclure/exclure de la comparaison
                            </p>
                        </div>

                        {/* Comparaison */}
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold mb-4">Comparaison</h2>
                            <ScenarioCompare
                                scenarios={selectedScenarios}
                                annees={annees}
                            />
                        </div>
                    </>
                ) : (
                    <Card variant="bordered" className="p-12 text-center">
                        <CardContent>
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Aucun scénario</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Les scénarios vous permettent de tester différentes hypothèses
                                (optimiste, pessimiste) et de comparer leurs impacts sur vos résultats.
                            </p>
                            <Button onClick={createDefaultScenarios} isLoading={creating}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Créer les scénarios par défaut
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Modal création */}
                <Modal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    title="Nouveau Scénario"
                    size="md"
                >
                    <ScenarioSliders
                        onSave={createScenario}
                        onCancel={() => setShowCreate(false)}
                        isLoading={creating}
                    />
                </Modal>
            </main>
        </div>
    )
}
