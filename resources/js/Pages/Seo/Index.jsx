import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { 
    Search,
    Edit,
    X,
    ChevronLeft,
    ChevronRight,
    Key,
    Share2
} from 'lucide-react';

export default function Index({ projects, metrics, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 5);
    const [editingProject, setEditingProject] = useState(null);
    const type = filters.type || 'all';

    const { data, setData, put, processing, reset, errors } = useForm({
        total_keyword: '',
        approved_keywords: '',
        first_page: '',
        report_send: '',
        total_report: '',
        gmb_access_desc: '',
        social_media_login: '',
    });

    const handleSearchSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('seo.index'), { search, per_page: perPage, type }, { preserveState: true, replace: true });
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setData({
            total_keyword: project.total_keyword || '',
            approved_keywords: project.approved_keywords || '',
            first_page: project.first_page || '',
            report_send: project.report_send || '',
            total_report: project.total_report || '',
            gmb_access_desc: project.gmb_access_desc || '',
            social_media_login: project.social_media_login || '',
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('seo.update', editingProject.id), {
            onSuccess: () => {
                setEditingProject(null);
                reset();
            }
        });
    };

    return (
        <HmsLayout>
            <Head title="SEO Projects" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <Search className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-slate-900">SEO Projects</h2>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
                    {/* GMB Card */}
                    <Link href={route('seo.index', { search, per_page: perPage, type: type === 'gmb' ? 'all' : 'gmb' })} className={`p-5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-rose-500 to-red-600 flex flex-col justify-between min-h-[130px] transition-transform hover:scale-[1.02] ${type === 'gmb' ? 'ring-4 ring-offset-2 ring-rose-500' : ''}`}>
                        <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                            <span className="flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5" /> GMB Access
                            </span>
                            <span className="opacity-75">Status</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/15">
                            <div>
                                <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                                <span className="text-xl font-bold">{metrics.gmbTotal ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                                <span className="text-xl font-bold text-amber-300">{metrics.gmbPending ?? 0}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Social Media Card */}
                    <Link href={route('seo.index', { search, per_page: perPage, type: type === 'social' ? 'all' : 'social' })} className={`p-5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col justify-between min-h-[130px] transition-transform hover:scale-[1.02] ${type === 'social' ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}`}>
                        <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                            <span className="flex items-center gap-1.5">
                                <Share2 className="w-3.5 h-3.5" /> Social Media
                            </span>
                            <span className="opacity-75">Status</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/15">
                            <div>
                                <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                                <span className="text-xl font-bold">{metrics.smTotal ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                                <span className="text-xl font-bold text-amber-300">{metrics.smPending ?? 0}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Keywords Card */}
                    <Link href={route('seo.index', { search, per_page: perPage, type: type === 'keywords' ? 'all' : 'keywords' })} className={`p-5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col justify-between min-h-[130px] transition-transform hover:scale-[1.02] ${type === 'keywords' ? 'ring-4 ring-offset-2 ring-emerald-500' : ''}`}>
                        <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                            <span className="flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /> Keywords
                            </span>
                            <span className="opacity-75">Status</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/15">
                            <div>
                                <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                                <span className="text-xl font-bold">{metrics.totalKeywords ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                                <span className="text-xl font-bold text-amber-300">{metrics.pendingKeywords ?? 0}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Filters & Top Pagination */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by Project or Client name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                        />
                    </form>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="hidden lg:block">
                            Showing {projects?.from ?? 0} to {projects?.to ?? 0} of {projects?.total ?? 0} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(e.target.value);
                                    router.get(route('seo.index'), { search, per_page: e.target.value, type }, { preserveState: true, replace: true });
                                }}
                                className="text-sm border border-slate-200 rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white cursor-pointer"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
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
                                href={projects?.prev_page_url ? `${projects.prev_page_url}&per_page=${perPage}&type=${type}` : '#'}
                                preserveScroll
                                className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                            <Link
                                href={projects?.next_page_url ? `${projects.next_page_url}&per_page=${perPage}&type=${type}` : '#'}
                                preserveScroll
                                className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 whitespace-nowrap">Project</th>
                                    <th className="p-4 whitespace-nowrap">Client</th>
                                    <th className="p-4 text-center whitespace-nowrap">Total KW</th>
                                    <th className="p-4 whitespace-nowrap">Approved KW</th>
                                    <th className="p-4 text-center whitespace-nowrap">First Page</th>
                                    <th className="p-4 text-center whitespace-nowrap">Total Reports</th>
                                    <th className="p-4 whitespace-nowrap">Report Sent</th>
                                    <th className="p-4 whitespace-nowrap">GMB Access</th>
                                    <th className="p-4 whitespace-nowrap">Social Media</th>
                                    <th className="p-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="p-8 text-center text-slate-500">
                                            No SEO projects found.
                                        </td>
                                    </tr>
                                ) : (
                                    projects.data.map(project => {
                                        
                                        // Calculate done count based on lines if not "Done"
                                        let doneCount = 0;
                                        const tk = parseInt(project.total_keyword) || 0;
                                        if (tk > 0) {
                                            const ak = (project.approved_keywords || '').trim().toLowerCase();
                                            if (ak === 'done') {
                                                doneCount = tk;
                                            } else if (ak !== '') {
                                                const lines = (project.approved_keywords.match(/[^\r\n]+/g) || []).length;
                                                doneCount = Math.min(tk, lines);
                                            }
                                        }

                                        return (
                                            <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-semibold text-sm text-slate-800">{project.project_name || project.customer?.client_name || 'No Project Name'}</div>
                                                    <div className="text-xs text-slate-500">{project.custom_project_id || `PRJ-${project.id}`}</div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-700">
                                                    {project.customer?.company_name || project.customer?.client_name || '-'}
                                                </td>
                                                
                                                <td className="p-4 text-center">
                                                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap inline-block">
                                                        {project.total_keyword || 0} / <span className="text-emerald-600 font-bold">{doneCount}</span>
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-600 max-w-[200px] truncate">
                                                    <div title={project.approved_keywords}>{project.approved_keywords || '-'}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap inline-block">
                                                        {project.first_page || '0'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-sm font-medium text-slate-700">{project.total_report || '-'}</span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-600 max-w-[150px] truncate">
                                                    <div title={project.report_send}>{project.report_send || '-'}</div>
                                                </td>
                                                <td className="p-4 text-xs text-slate-600 max-w-[150px] truncate">
                                                    <div title={project.gmb_access_desc}>{project.gmb_access_desc || '-'}</div>
                                                </td>
                                                <td className="p-4 text-xs text-slate-600 max-w-[150px] truncate">
                                                    <div title={project.social_media_login}>{project.social_media_login || '-'}</div>
                                                </td>
                                                
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => openEditModal(project)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Bottom Pagination Info */}
                    {projects.data.length > 0 && (
                        <div className="p-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-slate-600">
                                Showing {projects?.from ?? 0} to {projects?.to ?? 0} of {projects?.total ?? 0} entries
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(e.target.value);
                                            router.get(route('seo.index'), { search, per_page: e.target.value, type }, { preserveState: true, replace: true });
                                        }}
                                        className="text-sm border border-slate-200 rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white cursor-pointer"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
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
                                        href={projects?.prev_page_url ? `${projects.prev_page_url}&per_page=${perPage}&type=${type}` : '#'}
                                        preserveScroll
                                        className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={projects?.next_page_url ? `${projects.next_page_url}&per_page=${perPage}&type=${type}` : '#'}
                                        preserveScroll
                                        className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Update SEO Details</h2>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6 p-4 bg-green-50/50 border border-green-100 rounded-xl">
                                <p className="text-sm font-medium text-green-900">{editingProject.project_name}</p>
                                <p className="text-xs text-green-700/70 mt-1">{editingProject.customer?.company_name || editingProject.customer?.client_name}</p>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Keywords</label>
                                        <input
                                            type="text"
                                            value={data.total_keyword}
                                            onChange={e => setData('total_keyword', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Reports</label>
                                        <input
                                            type="text"
                                            value={data.total_report}
                                            onChange={e => setData('total_report', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Approved Keywords (List or "Done")</label>
                                    <textarea
                                        rows="4"
                                        value={data.approved_keywords}
                                        onChange={e => setData('approved_keywords', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Page</label>
                                        <input
                                            type="text"
                                            value={data.first_page}
                                            onChange={e => setData('first_page', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Report Sent</label>
                                        <input
                                            type="text"
                                            value={data.report_send}
                                            onChange={e => setData('report_send', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">GMB Access</label>
                                        <input
                                            type="text"
                                            value={data.gmb_access_desc}
                                            onChange={e => setData('gmb_access_desc', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Social Media Login</label>
                                        <input
                                            type="text"
                                            value={data.social_media_login}
                                            onChange={e => setData('social_media_login', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProject(null)}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </HmsLayout>
    );
}
