import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { TrendingUp, Edit, Save, X, Target, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function Index({ salesUsers = [], canEdit = false }) {
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [search, setSearch] = useState('');
    
    // Filter by search
    const filteredUsers = salesUsers.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalEntries = filteredUsers.length;
    const totalPages = Math.ceil(totalEntries / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + perPage);

    const { data, setData, put, processing, errors, reset } = useForm({
        monthly_target: 0,
        monthly_achieved: 0,
    });

    const startEditing = (user) => {
        setEditingUser(user);
        setData({
            monthly_target: user.monthly_target || 0,
            monthly_achieved: user.monthly_achieved || 0,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingUser) return;
        
        put(route('targets.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUser(null);
                reset();
            },
        });
    };

    return (
        <HmsLayout header="Sales Targets Management">
            <Head title="Sales Targets" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <Target className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">Manage Sales Targets</h2>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search sales person..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                        />
                    </div>
                </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Sales Person</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Monthly Target (₹)</th>
                                <th className="px-6 py-4">Achieved (₹)</th>
                                <th className="px-6 py-4">Progress</th>
                                {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        No sales persons found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {user.role?.role_name?.replace('_', ' ').toUpperCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800 text-base">
                                                ₹{Number(user.monthly_target || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-emerald-600 text-base">
                                                ₹{Number(user.monthly_achieved || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const target = Number(user.monthly_target || 0);
                                                const achieved = Number(user.monthly_achieved || 0);
                                                const percent = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
                                                
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full ${percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-600 w-8">{percent}%</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => startEditing(user)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    Update
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalEntries > 0 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white text-sm text-slate-600 rounded-b-2xl">
                        <div>
                            Showing {startIndex + 1} to {Math.min(startIndex + perPage, totalEntries)} of {totalEntries} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border-slate-200 rounded-lg text-sm py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-lg">Update Targets</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="p-6">
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-slate-800 mb-1">{editingUser.name}</p>
                                <p className="text-xs text-slate-500">Update monthly target and achieved revenue.</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Target (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={data.monthly_target}
                                            onChange={(e) => setData('monthly_target', e.target.value)}
                                            className="pl-7 block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.monthly_target && <p className="mt-1 text-sm text-red-600">{errors.monthly_target}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Achieved (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={data.monthly_achieved}
                                            onChange={(e) => setData('monthly_achieved', e.target.value)}
                                            className="pl-7 block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.monthly_achieved && <p className="mt-1 text-sm text-red-600">{errors.monthly_achieved}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </HmsLayout>
    );
}
