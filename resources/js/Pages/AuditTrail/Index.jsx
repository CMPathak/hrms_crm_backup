import React from 'react';
import { Head } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { Activity, Clock, Calendar, User } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function AuditTrail({ histories, auth }) {
    return (
        <HmsLayout user={auth.user} header="User Login History & Audit Trail">
            <Head title="Audit Trail" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                            <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-[1.1rem] font-bold text-slate-800 tracking-tight">
                                User Login History & Audit Trail
                            </h1>
                            <p className="text-[13px] text-slate-400 mt-0.5">
                                Live record of team member login dates, times, and access devices
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full flex items-center shadow-sm shrink-0">
                        <span className="text-[13px] font-semibold text-slate-600">{histories.total} recent sessions</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-3px_rgba(6,81,237,0.08)] border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">User & Email</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">Role</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">Login Date & Time</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">IP Address</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Device / Client</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {histories.data.map((history) => {
                                    const roleName = history.user?.role_id === 1 ? 'Super Admin' : (history.user?.role_id === 2 ? 'Admin' : (history.user?.role?.role_name || 'User'));
                                    
                                    return (
                                        <tr key={history.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{history.user?.name || 'Unknown User'}</span>
                                                    <span className="text-[13px] text-slate-400 mt-0.5">{history.user?.email || 'N/A'}</span>
                                                </div>
                                            </td>
                                            
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {roleName}
                                                </span>
                                            </td>
                                            
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50">
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
                                            
                                            <td className="py-4 px-6 border-r border-slate-100 group-hover:border-indigo-100/50">
                                                <span className="text-[13.5px] font-semibold text-slate-700">
                                                    {history.ip_address}
                                                </span>
                                            </td>
                                            
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-[13px] text-slate-500 max-w-sm inline-block truncate" title={history.user_agent}>
                                                    {history.user_agent}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {histories.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-sm text-slate-500">
                                            No login history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </HmsLayout>
    );
}
