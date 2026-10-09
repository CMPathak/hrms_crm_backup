import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { Network, Search, ChevronLeft, ChevronRight, Edit, X } from 'lucide-react';

export default function FtpLoginsIndex({ projects, search: initialSearch = '', per_page = 5 }) {
    const [search, setSearch] = useState(initialSearch);
    const [editingProject, setEditingProject] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        ftp_login_details: ''
    });

    const openEditModal = (project) => {
        setEditingProject(project);
        setData({
            ftp_login_details: project.ftp_login_details || ''
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('ftp-logins.update', editingProject.id), {
            preserveScroll: true,
            onSuccess: () => setEditingProject(null)
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('ftp-logins.index'), { search: search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <HmsLayout header="FTP Login Details">
            <Head title="FTP Logins - HMS ERP" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <Network className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">FTP Login Details</h2>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search project, client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                        />
                    </form>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {projects.total} records
                        </span>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4 sm:px-5">Project Name</th>
                                    <th className="py-3 px-4 sm:px-5">Company / Client</th>
                                    <th className="py-3 px-4 sm:px-5 min-w-[200px]">cPanel / Hosting Details</th>
                                    <th className="py-3 px-4 sm:px-5 min-w-[200px]">WordPress Details</th>
                                    <th className="py-3 px-4 sm:px-5 text-right w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                    <Network className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">No FTP details found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    projects.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="py-4 px-4 sm:px-5">
                                                <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {p.project_name}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 sm:px-5">
                                                <div className="text-slate-700 font-medium">
                                                    {p.customer?.company_name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {p.customer?.client_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 sm:px-5 align-top">
                                                {p.cpanel_details ? (
                                                    <div className="text-slate-700 whitespace-pre-wrap break-all text-xs font-mono bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
                                                        {p.cpanel_details}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Not found</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 sm:px-5 align-top">
                                                {p.wp_details ? (
                                                    <div className="text-slate-700 whitespace-pre-wrap break-all text-xs font-mono bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                                                        {p.wp_details}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Not found</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 sm:px-5 align-top text-right">
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg inline-flex items-center gap-1.5 transition-colors font-medium text-xs"
                                                    title="Edit FTP Details"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    Update
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {projects.total > 0 && (
                        <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-slate-500">
                                Showing {projects.from} to {projects.to} of {projects.total} entries
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={per_page}
                                    onChange={(e) => {
                                        router.get(route('ftp-logins.index'), { search: search || undefined, per_page: e.target.value }, { preserveState: true, replace: true });
                                    }}
                                    className="border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5 pl-3 pr-8 bg-white"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => projects.prev_page_url && router.get(projects.prev_page_url, { search: search || undefined, per_page }, { preserveState: true, replace: true })}
                                        disabled={!projects.prev_page_url}
                                        className={`p-1.5 rounded-lg border ${
                                            projects.prev_page_url 
                                                ? 'border-slate-200 text-slate-600 hover:bg-slate-50' 
                                                : 'border-slate-100 text-slate-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => projects.next_page_url && router.get(projects.next_page_url, { search: search || undefined, per_page }, { preserveState: true, replace: true })}
                                        disabled={!projects.next_page_url}
                                        className={`p-1.5 rounded-lg border ${
                                            projects.next_page_url 
                                                ? 'border-slate-200 text-slate-600 hover:bg-slate-50' 
                                                : 'border-slate-100 text-slate-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setEditingProject(null)}
                    ></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">
                                Edit FTP Details - {editingProject.project_name}
                            </h3>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <form onSubmit={handleUpdate}>
                            <div className="p-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Raw FTP / Login Details (Text)
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Enter raw details like 'Wordpress Login...', 'cPanel URL...', etc. Our system will automatically categorize them into WordPress and cPanel columns.
                                </p>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 min-h-[200px] font-mono text-slate-700 bg-slate-50"
                                    value={data.ftp_login_details}
                                    onChange={(e) => setData('ftp_login_details', e.target.value)}
                                    placeholder="e.g.&#10;Wordpress Login Details&#10;Url: ...&#10;Username: ...&#10;Password: ...&#10;&#10;cPanel Login&#10;Url: ..."
                                ></textarea>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? 'Saving...' : 'Save Details'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </HmsLayout>
    );
}
