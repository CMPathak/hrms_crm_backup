import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { 
    Image as ImageIcon, 
    Video, 
    Search,
    Edit,
    X,
    CheckCircle2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Index({ projects, metrics, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 5);
    const [editingProject, setEditingProject] = useState(null);
    const type = filters.type || 'all';

    const { data, setData, put, processing, reset, errors } = useForm({
        total_banners: 0,
        completed_banners: 0,
        total_reels: 0,
        completed_reels: 0,
        total_dvc: 0,
        completed_dvc: 0,
    });

    const handleSearchSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('banners-reels.index'), { search, per_page: perPage, type }, { preserveState: true, replace: true });
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setData({
            total_banners: project.total_banners || 0,
            completed_banners: project.completed_banners || 0,
            total_reels: project.total_reels || 0,
            completed_reels: project.completed_reels || 0,
            total_dvc: project.total_dvc || 0,
            completed_dvc: project.completed_dvc || 0,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('banners-reels.update', editingProject.id), {
            onSuccess: () => {
                setEditingProject(null);
                reset();
            }
        });
    };

    return (
        <HmsLayout>
            <Head title="Banners & Reels" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">Banners & Reels</h2>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
                    {/* Banners Card */}
                    <Link href={route('banners-reels.index', { search, per_page: perPage, type: type === 'banners' ? 'all' : 'banners' })} className={`p-5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-pink-500 to-rose-600 flex flex-col justify-between min-h-[130px] transition-transform hover:scale-[1.02] ${type === 'banners' ? 'ring-4 ring-offset-2 ring-pink-500' : ''}`}>
                        <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                            <span className="flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5" /> Banners
                            </span>
                            <span className="opacity-75">Status</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/15">
                            <div>
                                <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                                <span className="text-xl font-bold">{metrics.totalBanners ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                                <span className="text-xl font-bold text-amber-300">{metrics.pendingBanners ?? 0}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Reels Card */}
                    <Link href={route('banners-reels.index', { search, per_page: perPage, type: type === 'reels' ? 'all' : 'reels' })} className={`p-5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col justify-between min-h-[130px] transition-transform hover:scale-[1.02] ${type === 'reels' ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}`}>
                        <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                            <span className="flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> Reels
                            </span>
                            <span className="opacity-75">Status</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/15">
                            <div>
                                <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                                <span className="text-xl font-bold">{metrics.totalReels ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                                <span className="text-xl font-bold text-amber-300">{metrics.pendingReels ?? 0}</span>
                            </div>
                        </div>
                    </Link>

                    {/* DVC Card */}
                    <Link href={route('banners-reels.index', { search, per_page: perPage, type: type === 'dvc' ? 'all' : 'dvc' })} className={`p-5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-cyan-500 to-teal-600 flex flex-col justify-between min-h-[130px] transition-transform hover:scale-[1.02] ${type === 'dvc' ? 'ring-4 ring-offset-2 ring-teal-500' : ''}`}>
                        <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                            <span className="flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> DVC
                            </span>
                            <span className="opacity-75">Status</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/15">
                            <div>
                                <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                                <span className="text-xl font-bold">{metrics.totalDvc ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                                <span className="text-xl font-bold text-amber-300">{metrics.pendingDvc ?? 0}</span>
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
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
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
                                    router.get(route('banners-reels.index'), { search, per_page: e.target.value, type }, { preserveState: true, replace: true });
                                }}
                                className="text-sm border border-slate-200 rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
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
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Details (Old)</th>
                                    <th className="p-4">Designer</th>
                                    <th className="p-4 text-center">Banners (Total/Done)</th>
                                    <th className="p-4 text-center">Reels (Total/Done)</th>
                                    <th className="p-4 text-center">DVC (Total/Done)</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                            No projects found with banners or reels.
                                        </td>
                                    </tr>
                                ) : (
                                    projects.data.map(project => (
                                        <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-sm text-slate-800">{project.project_name || project.customer?.client_name || 'No Project Name'}</div>
                                                <div className="text-xs text-slate-500">{project.custom_project_id || `PRJ-${project.id}`}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-700">
                                                {project.customer?.company_name || project.customer?.client_name || '-'}
                                            </td>
                                            <td className="p-4 text-xs text-slate-600 max-w-[200px] truncate">
                                                <div title={project.banner_reel}>B&R: {project.banner_reel || '-'}</div>
                                                <div title={project.dvc}>DVC: {project.dvc || '-'}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-700">
                                                {project.assignment?.designer?.name || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap inline-block">
                                                    {project.total_banners} / <span className="text-emerald-600 font-bold">{project.completed_banners}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap inline-block">
                                                    {project.total_reels} / <span className="text-emerald-600 font-bold">{project.completed_reels}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap inline-block">
                                                    {project.total_dvc} / <span className="text-emerald-600 font-bold">{project.completed_dvc}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => openEditModal(project)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
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
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white text-sm text-slate-600">
                        <div>
                            Showing {projects?.from ?? 0} to {projects?.to ?? 0} of {projects?.total ?? 0} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        router.get(route('banners-reels.index'), { search, per_page: e.target.value, type }, { preserveState: true, replace: true });
                                    }}
                                    className="text-sm border border-slate-200 rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
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
                </div>

                {/* Edit Modal */}
                {editingProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-lg">Update Creatives</h3>
                                <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdate} className="p-6">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-slate-800 mb-1">{editingProject.project_name || editingProject.customer?.client_name || 'Unknown Project'}</p>
                                    <p className="text-xs text-slate-500">Update counts for banners and reels</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Total Banners</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.total_banners}
                                            onChange={e => setData('total_banners', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Completed Banners</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={data.total_banners}
                                            value={data.completed_banners}
                                            onChange={e => setData('completed_banners', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Total Reels</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.total_reels}
                                            onChange={e => setData('total_reels', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Completed Reels</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={data.total_reels}
                                            value={data.completed_reels}
                                            onChange={e => setData('completed_reels', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Total DVC</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.total_dvc}
                                            onChange={e => setData('total_dvc', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Completed DVC</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={data.total_dvc}
                                            value={data.completed_dvc}
                                            onChange={e => setData('completed_dvc', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProject(null)}
                                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Updates'}
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
