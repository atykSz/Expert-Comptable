'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { Save, RotateCcw } from 'lucide-react'

interface ScenarioSlidersProps {
    initialValues?: {
        nom: string
        modifCA: number
        modifCharges: number
        modifDelaiPaiement: number
    }
    onSave: (values: {
        nom: string
        type: string
        modifCA: number
        modifCharges: number
        modifDelaiPaiement: number
    }) => void
    onCancel?: () => void
    isLoading?: boolean
}

export function ScenarioSliders({
    initialValues,
    onSave,
    onCancel,
    isLoading
}: ScenarioSlidersProps) {
    const [nom, setNom] = useState(initialValues?.nom || 'Nouveau scénario')
    const [modifCA, setModifCA] = useState(initialValues?.modifCA || 0)
    const [modifCharges, setModifCharges] = useState(initialValues?.modifCharges || 0)
    const [modifDelaiPaiement, setModifDelaiPaiement] = useState(initialValues?.modifDelaiPaiement || 0)

    const handleReset = () => {
        setModifCA(0)
        setModifCharges(0)
        setModifDelaiPaiement(0)
    }

    const handleSubmit = () => {
        onSave({
            nom,
            type: 'PERSONNALISE',
            modifCA,
            modifCharges,
            modifDelaiPaiement
        })
    }

    // Déterminer le type automatiquement
    const getAutoType = () => {
        if (modifCA > 10 && modifCharges < 0) return 'Optimiste'
        if (modifCA < -10 && modifCharges > 5) return 'Pessimiste'
        if (modifCA === 0 && modifCharges === 0) return 'Réaliste'
        return 'Personnalisé'
    }

    return (
        <Card variant="bordered">
            <CardHeader>
                <CardTitle className="text-lg">Configuration du Scénario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Nom */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Nom du scénario</label>
                    <Input
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Ex: Scénario prudent"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Type détecté : <span className="font-medium">{getAutoType()}</span>
                    </p>
                </div>

                {/* Slider CA */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Variation Chiffre d&apos;Affaires</label>
                        <span className={`text-sm font-semibold ${modifCA >= 0 ? 'text-success' : 'text-danger'}`}>
                            {modifCA >= 0 ? '+' : ''}{modifCA}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-50"
                        max="50"
                        step="5"
                        value={modifCA}
                        onChange={(e) => setModifCA(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>-50%</span>
                        <span>0%</span>
                        <span>+50%</span>
                    </div>
                </div>

                {/* Slider Charges */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Variation Charges</label>
                        <span className={`text-sm font-semibold ${modifCharges <= 0 ? 'text-success' : 'text-danger'}`}>
                            {modifCharges >= 0 ? '+' : ''}{modifCharges}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-30"
                        max="30"
                        step="5"
                        value={modifCharges}
                        onChange={(e) => setModifCharges(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-warning"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>-30%</span>
                        <span>0%</span>
                        <span>+30%</span>
                    </div>
                </div>

                {/* Slider Délai Paiement */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Délai Paiement Clients</label>
                        <span className={`text-sm font-semibold ${modifDelaiPaiement <= 0 ? 'text-success' : 'text-warning'}`}>
                            {modifDelaiPaiement >= 0 ? '+' : ''}{modifDelaiPaiement} jours
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-30"
                        max="60"
                        step="5"
                        value={modifDelaiPaiement}
                        onChange={(e) => setModifDelaiPaiement(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-muted-foreground"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>-30j</span>
                        <span>0</span>
                        <span>+60j</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Réinitialiser
                    </Button>
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Annuler
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
