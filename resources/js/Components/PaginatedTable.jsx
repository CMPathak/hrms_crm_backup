import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginatedTable({
    data = [],
    title,
    subtitle,
    icon,
    badge,
    children,
    searchPlaceholder = "Search..."
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter logic
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(item => {
            // Convert all values in the object to a string and check if it includes the query
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowerQuery)
            );
        });
    }, [data, searchQuery]);

    const totalEntries = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / perPage));

    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const startIndex = (currentPage - 1) * perPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + perPage);

    const showingStart = totalEntries === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(startIndex + perPage, totalEntries);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {badge}
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-auto max-h-[400px] flex-1">
                {children(paginatedData)}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white text-sm text-slate-600">
                <div>
                    Showing {showingStart} to {showingEnd} of {totalEntries} entries
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="text-sm border border-slate-200 rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg border ${
                                currentPage === 1 
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded-lg border ${
                                currentPage === totalPages 
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
