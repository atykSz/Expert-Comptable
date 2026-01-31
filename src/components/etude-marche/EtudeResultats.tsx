'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Users, Store, TrendingUp, AlertCircle } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

interface EtudeResultatsProps {
    data: {
        nbConcurrents: number
        populationZone: number
        ratioHabConcurrent: number
        potentielMarche: string
        repartitionAges?: Record<string, number>
        concurrents?: any[]
    }
}

export function EtudeResultats({ data }: EtudeResultatsProps) {
    const chartData = data.repartitionAges
        ? Object.entries(data.repartitionAges).map(([name, value]) => ({ name, value }))
        : []

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concurrents</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.nbConcurrents}</div>
                        <p className="text-xs text-muted-foreground">établissements recensés</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Population Zone</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.populationZone.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">habitants estimés</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ratio Densité</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(data.ratioHabConcurrent)}</div>
                        <p className="text-xs text-muted-foreground">hab / concurrent</p>
                    </CardContent>
                </Card>

                <Card className={data.potentielMarche === 'FORT' ? 'border-green-500 bg-green-50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Météo du Projet</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{data.potentielMarche}</div>
                        <p className="text-xs text-muted-foreground">Indice de potentiel</p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pyramide des Âges</CardTitle>
                        <CardDescription>Répartition démographique de la zone</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={50} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Liste concurrents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Principaux Concurrents</CardTitle>
                        <CardDescription>Établissements identifiés à proximité</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.concurrents?.map((c: any, i: number) => (
                                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{c.nom}</p>
                                        <p className="text-xs text-muted-foreground">{c.adresse}</p>
                                    </div>
                                    <div className="text-xs bg-secondary px-2 py-1 rounded">
                                        {c.dateCreation ? new Date(c.dateCreation).getFullYear() : 'N/A'}
                                    </div>
                                </div>
                            ))}
                            {(!data.concurrents || data.concurrents.length === 0) && (
                                <p className="text-sm text-muted-foreground italic">Aucun concurrent détaillé disponible.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
