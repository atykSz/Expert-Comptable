'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DataPoint {
    name: string
    value: number
    [key: string]: string | number
}

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

// Formateur pour les tooltips
const currencyFormatter = (value: number | undefined) => formatCurrency(value ?? 0)

/**
 * Graphique en barres pour les comparaisons (CA, Charges, etc.)
 */
export function BarChartComponent({
    data,
    dataKeys,
    title
}: {
    data: DataPoint[]
    dataKeys: { key: string; color: string; name: string }[]
    title?: string
}) {
    return (
        <div className="w-full h-80">
            {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip formatter={currencyFormatter} />
                    <Legend />
                    {dataKeys.map((dk) => (
                        <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

/**
 * Graphique camembert pour la répartition
 */
export function PieChartComponent({
    data,
    title
}: {
    data: DataPoint[]
    title?: string
}) {
    return (
        <div className="w-full h-80">
            {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={currencyFormatter} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

/**
 * Graphique en ligne pour l'évolution de la trésorerie
 */
export function LineChartComponent({
    data,
    dataKeys,
    title
}: {
    data: DataPoint[]
    dataKeys: { key: string; color: string; name: string }[]
    title?: string
}) {
    return (
        <div className="w-full h-80">
            {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip formatter={currencyFormatter} />
                    <Legend />
                    {dataKeys.map((dk) => (
                        <Line
                            key={dk.key}
                            type="monotone"
                            dataKey={dk.key}
                            name={dk.name}
                            stroke={dk.color}
                            strokeWidth={2}
                            dot={{ fill: dk.color, strokeWidth: 2 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

/**
 * Graphique combiné barres + ligne
 */
export function ComboChartComponent({
    data,
    barKey,
    lineKey,
    title
}: {
    data: DataPoint[]
    barKey: { key: string; color: string; name: string }
    lineKey: { key: string; color: string; name: string }
    title?: string
}) {
    return (
        <div className="w-full h-80">
            {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip formatter={currencyFormatter} />
                    <Legend />
                    <Bar dataKey={barKey.key} name={barKey.name} fill={barKey.color} radius={[4, 4, 0, 0]} />
                    <Line
                        type="monotone"
                        dataKey={lineKey.key}
                        name={lineKey.name}
                        stroke={lineKey.color}
                        strokeWidth={2}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
