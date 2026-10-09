import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import {
    Globe,
    AlertTriangle,
    Clock,
    XCircle,
    CheckCircle2,
    Search,
    ExternalLink,
    Building2,
    User,
    Phone,
    Mail,
    Server,
    ShieldCheck,
    Calendar,
    DollarSign,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function DomainsIndex({ domains = [], metrics = {}, currentTab = 'all', search: initialSearch = '' }) {
    const [search, setSearch] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState(currentTab);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    
    const totalDomains = domains.length;
    const totalPages = Math.ceil(totalDomains / perPage) || 1;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedDomains = domains.slice(startIndex, startIndex + perPage);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        router.get(route('domains.index'), {
            tab: tab !== 'all' ? tab : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        router.get(route('domains.index'), {
            tab: activeTab !== 'all' ? activeTab : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const tabs = [
        { id: 'all', label: 'All Domains' },
        { id: 'renew_3m', label: '3 Months (90d)', badge: metrics.renew_3m },
        { id: 'renew_2m', label: '2 Months (60d)', badge: metrics.renew_2m },
        { id: 'renew_1m', label: '1 Month (30d)', badge: metrics.renew_1m },
        { id: 'renew_7d', label: '7 Days', badge: metrics.renew_7d },
        { id: 'expired', label: 'Expired', badge: metrics.expired },
        { id: 'active', label: 'Active', badge: metrics.active },
    ];

    return (
        <HmsLayout header="Domain & Hosting Expiry">
            <Head title="Domain Expiry Board - HMS ERP" />

            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Globe className="w-7 h-7 text-indigo-600" />
                            <span>Domain & Hosting Expiry Board</span>
                        </h1>
                        {/* <p className="text-sm text-slate-500 mt-1">
                            Monitor client domain lifecycles, upcoming renewal dates, SSL certificates, and hosting packages.
                        </p> */}
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* 1. Total Domains */}
                    <button onClick={() => handleTabChange('all')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all w-full">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Total Domains</span>
                            <div className="text-2xl font-black text-slate-900 mt-1">
                                {metrics.total ?? 0}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">Active across all clients</span>
                        </div>
                    </button>

                    {/* 2. 3 Month Renewal */}
                    <button onClick={() => handleTabChange('renew_3m')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-emerald-200 hover:shadow-sm transition-all w-full">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">3 Month Renewal</span>
                            <div className="text-2xl font-black text-emerald-600 mt-1">
                                {metrics.renew_3m ?? 0}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">Expiring in 90 Days</span>
                        </div>
                    </button>

                    {/* 3. 2 Month Renewal */}
                    <button onClick={() => handleTabChange('renew_2m')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-amber-200 hover:shadow-sm transition-all w-full">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">2 Month Renewal</span>
                            <div className="text-2xl font-black text-amber-600 mt-1">
                                {metrics.renew_2m ?? 0}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">Expiring in 60 Days</span>
                        </div>
                    </button>

                    {/* 4. 1 Month Renewal */}
                    <button onClick={() => handleTabChange('renew_1m')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-orange-200 hover:shadow-sm transition-all w-full">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">1 Month Renewal</span>
                            <div className="text-2xl font-black text-orange-600 mt-1">
                                {metrics.renew_1m ?? 0}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">Expiring in 30 Days</span>
                        </div>
                    </button>

                    {/* 5. 7 Days Renewal */}
                    <button onClick={() => handleTabChange('renew_7d')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-rose-200 hover:shadow-sm transition-all w-full">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">7 Days Renewal</span>
                            <div className="text-2xl font-black text-rose-600 mt-1">
                                {metrics.renew_7d ?? 0}
                            </div>
                            <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Immediate action needed</span>
                        </div>
                    </button>

                    {/* 6. Already Expired */}
                    <button onClick={() => handleTabChange('expired')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all w-full">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Already Expired</span>
                            <div className="text-2xl font-black text-slate-700 mt-1">
                                {metrics.expired ?? 0}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">Past renewal date</span>
                        </div>
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    {/* Header Controls */}
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Domain Expiry Registry
                            </h2>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {domains.length} shown
                            </span>
                        </div>

                        {/* Search & Tabs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search domain, client, registrar..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                                />
                            </form>

                            {/* Tab Filters Dropdown */}
                            <select
                                value={activeTab}
                                onChange={(e) => handleTabChange(e.target.value)}
                                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 cursor-pointer w-full sm:w-auto"
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.id} value={tab.id}>
                                        {tab.label} {tab.badge !== undefined && tab.badge > 0 ? `(${tab.badge})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* TOP PAGINATION */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 text-sm text-slate-600">
                        <div>
                            Showing {totalDomains === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalDomains)} of {totalDomains} entries
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
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                    <option value="500">500</option>
                                    <option value="1000">1000</option>
                                    <option value={Math.max(2000, totalDomains)}>Show All Entries</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-colors ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-colors ${currentPage === totalPages || totalPages === 0 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="whitespace-nowrap">
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[0.75rem] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3.5 px-5 w-1/4 whitespace-nowrap">Domain & Project</th>
                                    <th className="py-3.5 px-4 w-1/5 whitespace-nowrap">Client / Account</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Registrar & Hosting</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Expiry Date & Timeline</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Renewal Date</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {paginatedDomains.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium whitespace-nowrap">
                                            No domain records found matching current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDomains.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Domain & Project */}
                                            <td className="py-3.5 px-5 whitespace-nowrap">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <a
                                                            href={`http://${d.domain_name}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1.5 transition-colors group"
                                                        >
                                                            <span className="truncate max-w-[200px] inline-block" title={d.domain_name}>{d.domain_name}</span>
                                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                                                        </a>
                                                        {d.project && (
                                                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-1 items-center">
                                                                <span className="font-semibold text-slate-700 truncate max-w-[180px] inline-block" title={d.project.project_name}>{d.project.project_name}</span>
                                                                {d.project.custom_project_id && (
                                                                    <span className="ml-1 text-[0.7rem] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                                                        {d.project.custom_project_id}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Client / Account */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-slate-900 flex items-start gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                                        <span className="line-clamp-2" title={d.customer?.company_name}>{d.customer?.company_name || '—'}</span>
                                                    </div>
                                                    {d.customer?.client_name && d.customer.client_name !== d.customer.company_name && (
                                                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                            <User className="w-3 h-3 text-slate-400" />
                                                            <span>{d.customer.client_name}</span>
                                                        </div>
                                                    )}
                                                    {d.customer?.phone && (
                                                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            <span>{d.customer.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Registrar & Hosting */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                        <span>{d.registrar}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Server className="w-3 h-3 text-slate-400" />
                                                        <span>{d.hosting_provider}</span>
                                                    </div>
                                                    {d.ssl_certificate && (
                                                        <div className="text-[0.7rem] text-emerald-600 flex items-center gap-1 font-medium">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            <span>SSL Secured</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Expiry Date & Timeline */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{d.formatted_expiry}</span>
                                                    </div>

                                                    {/* Days Remaining Pill */}
                                                    {d.is_expired ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                                                            <span>Expired {Math.abs(d.days_remaining)}d ago</span>
                                                        </span>
                                                    ) : d.days_remaining !== null && d.days_remaining <= 7 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                                                            <Clock className="w-3 h-3 text-rose-600" />
                                                            <span>Expires in {d.days_remaining} days!</span>
                                                        </span>
                                                    ) : d.days_remaining !== null && d.days_remaining <= 30 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Clock className="w-3 h-3 text-amber-600" />
                                                            <span>Expires in {d.days_remaining} days</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            <span>{d.days_remaining ?? '—'} days left</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Renewal Date */}
                                            <td className="whitespace-nowrap py-3.5 px-4 text-xs font-semibold text-slate-700">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{d.formatted_renewal_date}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {d.is_expired ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        Expired
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white text-sm text-slate-600">
                        <div>
                            Showing {totalDomains === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalDomains)} of {totalDomains} entries
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
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                    <option value="500">500</option>
                                    <option value="1000">1000</option>
                                    <option value={Math.max(2000, totalDomains)}>Show All Entries</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-colors ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-colors ${currentPage === totalPages || totalPages === 0 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HmsLayout>
    );
}
