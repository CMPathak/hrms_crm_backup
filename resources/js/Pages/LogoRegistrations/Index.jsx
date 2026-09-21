import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { Shield, Search, CheckCircle2, Clock, XCircle, AlertTriangle , ChevronLeft, ChevronRight } from 'lucide-react';

export default function LogoRegistrationsIndex({ registrations }) {
    const [search, setSearch] = useState('');

    const [perPage, setPerPage] = useState(registrations.per_page || 5);


    const filteredRegistrations = (registrations?.data || []).filter(reg =>
        reg.client_name.toLowerCase().includes(search.toLowerCase()) ||
        reg.brand_name.toLowerCase().includes(search.toLowerCase()) ||
        reg.application_no.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            case 'Pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
            case 'Objected':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200"><AlertTriangle className="w-3 h-3" /> Objected</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    return (
        <HmsLayout>
            <Head title="Logo Registrations" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Shield className="w-6 h-6 text-indigo-600" />
                            Logo Registrations
                        </h1>
                        {/* <p className="text-slate-500 text-sm mt-1">
                            Manage and track trademark and logo applications for clients.
                        </p> */}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by client, brand or application no..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* PAGINATION */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 text-sm text-slate-600">
                        <div>
                            Showing {registrations?.from ?? 0} to {registrations?.to ?? 0} of {registrations?.total ?? 0} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        router.get(route('logo-registrations.index'), { per_page: e.target.value }, { preserveState: true, replace: true });
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
                                    <option value="2000">Show All Entries</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Link
                                    href={registrations?.prev_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${registrations?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={registrations?.next_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${registrations?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Application No</th>
                                    <th className="px-6 py-4 font-semibold">Client Name</th>
                                    <th className="px-6 py-4 font-semibold">Brand / Logo Name</th>
                                    {/* <th className="px-6 py-4 font-semibold">Type</th> */}
                                    <th className="px-6 py-4 font-semibold">Applied Date</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRegistrations.length > 0 ? (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {reg.application_no}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {reg.client_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-800">{reg.brand_name}</span>
                                            </td>
                                            {/* <td className="px-6 py-4 text-slate-600">
                                                {reg.type}
                                            </td> */}
                                            <td className="px-6 py-4 text-slate-500">
                                                {reg.applied_date}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(reg.status)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <Shield className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p className="font-medium text-slate-600">No registrations found</p>
                                            <p className="text-sm mt-1">Try adjusting your search filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* BOTTOM PAGINATION */}
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 text-sm text-slate-600">
                        <div>
                            Showing {registrations?.from ?? 0} to {registrations?.to ?? 0} of {registrations?.total ?? 0} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        router.get(route('logo-registrations.index'), { per_page: e.target.value }, { preserveState: true, replace: true });
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
                                    <option value="2000">Show All Entries</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Link
                                    href={registrations?.prev_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${registrations?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={registrations?.next_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${registrations?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HmsLayout>
    );
}
