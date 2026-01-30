'use client'

import { List } from 'lucide-react'

interface TableOfContentsProps {
    sections: { number: string; title: string; page?: number }[]
}

export function TableOfContents({ sections }: TableOfContentsProps) {
    return (
        <section className="mb-10 page-break-after-always">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <List className="h-5 w-5 text-[#c9a227]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">Sommaire</h2>
            </div>

            <div className="space-y-3">
                {sections.map((section, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-4 py-3 border-b border-dashed border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-8 h-8 bg-[#c9a227] rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">{section.number}</span>
                        </div>
                        <div className="flex-1 font-medium text-[#1e3a5f]">{section.title}</div>
                        {section.page && (
                            <div className="text-gray-400 text-sm">p. {section.page}</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
