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
    RefreshCw
} from 'lucide-react';

export default function DomainsIndex({ domains = [], metrics = {}, currentTab = 'all', search: initialSearch = '' }) {
    const [search, setSearch] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState(currentTab);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
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
        { id: 'expiring_soon', label: 'Expiring Soon (30d)', badge: metrics.expiring_soon },
        { id: 'critical', label: 'Critical (7d)', badge: metrics.critical },
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
                        <p className="text-sm text-slate-500 mt-1">
                            Monitor client domain lifecycles, upcoming renewal dates, SSL certificates, and hosting packages.
                        </p>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Total Domains */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Total Registered Domains</span>
                            <div className="text-3xl font-black text-slate-900 mt-1">
                                {metrics.total ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Active across all clients</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Globe className="w-6 h-6" />
                        </div>
                    </div>

                    {/* 2. Expiring in 30 Days */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Expiring in 30 Days</span>
                            <div className="text-3xl font-black text-amber-600 mt-1">
                                {metrics.expiring_soon ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Requires customer outreach</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    {/* 3. Critical (<= 7 Days) */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Critical Expirations (7d)</span>
                            <div className="text-3xl font-black text-rose-600 mt-1">
                                {metrics.critical ?? 0}
                            </div>
                            <span className="text-xs text-rose-500 font-semibold mt-1 block">Immediate action needed</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>

                    {/* 4. Already Expired */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Already Expired</span>
                            <div className="text-3xl font-black text-slate-700 mt-1">
                                {metrics.expired ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Past renewal date</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>
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

                            {/* Tab Filters */}
                            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                                            activeTab === tab.id
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {tab.badge !== undefined && tab.badge > 0 && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] font-bold ${
                                                activeTab === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[0.75rem] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3.5 px-5 w-1/4">Domain & Project</th>
                                    <th className="py-3.5 px-4 w-1/5">Client / Account</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Registrar & Hosting</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Expiry Date & Timeline</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Renewal Date</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {domains.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                                            No domain records found matching current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    domains.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Domain & Project */}
                                            <td className="py-3.5 px-5">
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
                                            <td className="py-3.5 px-4">
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
                                            <td className="py-3.5 px-4">
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
                                            <td className="py-3.5 px-4">
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
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                                                {d.renewal_date && d.renewal_date !== '0000-00-00' ? d.renewal_date : 'N/A'}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
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
                </div>
            </div>
        </HmsLayout>
    );
}
