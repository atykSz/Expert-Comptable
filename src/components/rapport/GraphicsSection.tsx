'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    ComposedChart,
    Area,
    AreaChart
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface GraphicsSectionProps {
    data: {
        annee: number
        ca: number
        resultatNet: number
        tresorerieFin: number
    }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">Année {label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-medium">{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export function GraphicsSection({ data }: GraphicsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 mb-8 graph-section-break">
            {/* Évolution CA vs Résultat */}
            <Card variant="bordered" className="print:border-0 print:shadow-none">
                <CardHeader className="print:px-0">
                    <CardTitle className="text-lg print:text-base">Évolution CA & Résultat Net</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] print:h-[250px] print:px-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="annee" tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(val) => `${val / 1000}k`} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="ca" name="Chiffre d'Affaires" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                            <Line type="monotone" dataKey="resultatNet" name="Résultat Net" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: "#22c55e" }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Évolution Trésorerie */}
            <Card variant="bordered" className="print:border-0 print:shadow-none">
                <CardHeader className="print:px-0">
                    <CardTitle className="text-lg print:text-base">Solde de Trésorerie</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] print:h-[250px] print:px-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTresorerie" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="annee" tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(val) => `${val / 1000}k`} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="tresorerieFin"
                                name="Trésorerie Fin de Période"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTresorerie)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
