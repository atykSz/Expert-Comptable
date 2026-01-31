'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileSpreadsheet, Calendar, Clock, ArrowRight, Trash2 } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Modal, useToast } from '@/components/ui'

interface PrevisionnelCardProps {
    id: string
    titre: string
    description?: string | null
    dateDebut: string | Date
    nombreMois: number
    clientName?: string
}

export function PrevisionnelCard({
    id, titre, description, dateDebut, nombreMois, clientName
}: PrevisionnelCardProps) {
    const router = useRouter()
    const [showDelete, setShowDelete] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { addToast } = useToast()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/previsionnels/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Erreur suppression')
            addToast('Prévisionnel supprimé avec succès', 'success')
            router.refresh()
            setShowDelete(false)
        } catch (error) {
            console.error(error)
            addToast('Erreur lors de la suppression', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div
                onClick={() => router.push(`/previsionnel/${id}/dashboard`)}
                className="group cursor-pointer h-full"
            >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-gray-200 group-hover:border-[#1e3a5f]/50 relative">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-50 rounded-lg text-[#1e3a5f] group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <div className="flex gap-2">
                                {clientName && (
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                        {clientName}
                                    </span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowDelete(true)
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <CardTitle className="mt-4 text-lg font-semibold line-clamp-1 group-hover:text-[#1e3a5f] transition-colors">
                            {titre}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                            {description || "Aucune description"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(dateDebut).getFullYear()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{nombreMois} mois</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm font-medium text-[#1e3a5f]">
                            Accéder au Tableau de Bord
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                title="Supprimer le prévisionnel ?"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Êtes-vous sûr de vouloir supprimer définitivement le prévisionnel <strong>{titre}</strong> ?
                        Cette action est irréversible.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting}>
                            Annuler
                        </Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                            Supprimer
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
