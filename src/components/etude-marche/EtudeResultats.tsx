'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { CarteConcurrents } from './CarteConcurrents'
import { Badge } from '@/components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, Store, TrendingUp, Info } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface EtudeResultatsProps {
    etude: any // TODO: Type précis via Prisma
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function EtudeResultats({ etude }: EtudeResultatsProps) {
    if (!etude) return <div>Chargement...</div>

    // Préparation données graphiques
    const ageData = etude.repartitionAges ? Object.entries(etude.repartitionAges).map(([name, value]) => ({ name, value })) : []

    // KPIs
    const kpis = [
        {
            label: "Concurrents directs",
            value: etude.nbConcurrents,
            icon: Store,
            desc: `Dans un rayon de ${etude.rayonKm} km`
        },
        {
            label: "Population zone",
            value: etude.populationZone?.toLocaleString(),
            icon: Users,
            desc: `Habitants (Source INSEE)`
        },
        {
            label: "Densité Marché",
            value: Math.round(etude.ratioHabConcurrent || 0).toLocaleString(),
            icon: Users,
            desc: "Habitants / Concurrent",
            highlight: true
        },
        {
            label: "Potentiel Estimé",
            value: etude.potentielMarche,
            icon: TrendingUp,
            desc: "Basé sur la densité",
            isBadge: true
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{etude.libelleNAF}</h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm">{etude.codeNAF}</span>
                        <span>•</span>
                        <span>{etude.adresse}, {etude.codePostal} {etude.commune}</span>
                        <span>•</span>
                        <span>{format(new Date(etude.dateAnalyse), 'd MMM yyyy', { locale: fr })}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-lg px-4 py-1">
                        {etude.rayonKm} km
                    </Badge>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.label}
                            </CardTitle>
                            <kpi.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {kpi.isBadge ? (
                                    <Badge className={
                                        kpi.value === 'FORT' ? 'bg-green-500' :
                                            kpi.value === 'FAIBLE' ? 'bg-red-500' : 'bg-yellow-500'
                                    }>
                                        {kpi.value}
                                    </Badge>
                                ) : kpi.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {kpi.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Carte et Analyse */}
            <div className="grid gap-6 md:grid-cols-3 h-[600px] md:h-[500px]">
                {/* Carte (2/3 largeur) */}
                <div className="md:col-span-2 h-full">
                    <CarteConcurrents
                        center={[etude.latitude || 48.8566, etude.longitude || 2.3522]}
                        radius={etude.rayonKm}
                        concurrents={Array.isArray(etude.concurrents) ? etude.concurrents : []}
                    />
                </div>

                {/* Graphiques Démographie */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Démographie Locale</CardTitle>
                        <CardDescription>Répartition par âge</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ageData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des concurrents */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Concurrents ({etude.nbConcurrents})</CardTitle>
                    <CardDescription>Établissements identifiés dans l'analyse</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-muted/50 border-b">
                            <div className="col-span-5">Nom</div>
                            <div className="col-span-5">Adresse</div>
                            <div className="col-span-2 text-right">Création</div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {Array.isArray(etude.concurrents) && etude.concurrents.length > 0 ? (
                                etude.concurrents.map((c: any, i: number) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 p-4 text-sm border-b last:border-0 hover:bg-muted/20 items-center">
                                        <div className="col-span-5 font-medium">{c.nom}</div>
                                        <div className="col-span-5 text-muted-foreground truncate">{c.adresse}</div>
                                        <div className="col-span-2 text-right text-muted-foreground">
                                            {c.dateCreation ? new Date(c.dateCreation).getFullYear() : '-'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    Aucun concurrent listé
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
