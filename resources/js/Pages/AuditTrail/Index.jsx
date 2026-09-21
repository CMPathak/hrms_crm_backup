import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { Activity, Clock, Calendar, User , ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function AuditTrail({ histories, auth }) {

    const [perPage, setPerPage] = useState(histories.per_page || 5);

    return (
        <HmsLayout user={auth.user} header="User Login History & Audit Trail">
            <Head title="Audit Trail" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                            <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                User Login History & Audit Trail
                            </h1>
                            {/* <p className="text-slate-500 text-sm mt-1">
                                Live record of team member login dates, times, and access devices.
                            </p> */}
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full flex items-center shadow-sm shrink-0">
                        <span className="text-[13px] font-semibold text-slate-600">{histories.total} recent sessions</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* PAGINATION */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 text-sm text-slate-600">
                        <div>
                            Showing {histories?.from ?? 0} to {histories?.to ?? 0} of {histories?.total ?? 0} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        router.get(route('audit-trail'), { per_page: e.target.value }, { preserveState: true, replace: true });
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
                                    href={histories?.prev_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${histories?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={histories?.next_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${histories?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="whitespace-nowrap">
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60 whitespace-nowrap">User & Email</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60 whitespace-nowrap">Role</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60 whitespace-nowrap">Login Date & Time</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60 whitespace-nowrap">IP Address</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Device / Client</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {histories.data.map((history) => {
                                    const roleName = history.user?.role_id === 1 ? 'Super Admin' : (history.user?.role_id === 2 ? 'Admin' : (history.user?.role?.role_name || 'User'));
                                    
                                    return (
                                        <tr key={history.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{history.user?.name || 'Unknown User'}</span>
                                                    <span className="text-[13px] text-slate-400 mt-0.5">{history.user?.email || 'N/A'}</span>
                                                </div>
                                            </td>
                                            
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {roleName}
                                                </span>
                                            </td>
                                            
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50 whitespace-nowrap">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="flex flex-col text-sm text-slate-700 font-semibold gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                                                            {dayjs(history.login_at).format('MMM DD, YYYY')}
                                                        </div>
                                                        <span className="text-[12px] text-slate-500 font-normal ml-5.5">{dayjs(history.login_at).fromNow()}</span>
                                                    </div>
                                                    
                                                    <span className="text-slate-400 text-sm mt-0.5">at</span>
                                                    
                                                    <div className="flex items-center gap-1.5 text-[13.5px] text-indigo-600 font-bold mt-0.5">
                                                        <Clock className="w-4 h-4 shrink-0" />
                                                        {dayjs(history.login_at).format('hh:mm A')}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50 whitespace-nowrap">
                                                <span className="text-[13.5px] font-semibold text-slate-700">
                                                    {history.ip_address}
                                                </span>
                                            </td>
                                            
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <span className="text-[13px] text-slate-500 max-w-sm inline-block truncate" title={history.user_agent}>
                                                    {history.user_agent}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {histories.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-sm text-slate-500 whitespace-nowrap">
                                            No login history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 text-sm text-slate-600">
                        <div>
                            Showing {histories?.from ?? 0} to {histories?.to ?? 0} of {histories?.total ?? 0} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        router.get(route('audit-trail'), { per_page: e.target.value }, { preserveState: true, replace: true });
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
                                    href={histories?.prev_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${histories?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={histories?.next_page_url || '#'}
                                    preserveScroll
                                    className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${histories?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
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
