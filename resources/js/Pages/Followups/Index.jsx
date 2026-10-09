import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import { PhoneCall, Plus, X, Search, ChevronLeft, ChevronRight, Upload, Download, Edit } from 'lucide-react';

export default function Index({ followups = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const roleName = (user?.role?.role_name || '').toLowerCase();
    const isAdmin = user?.role_id === 1 || user?.role_id === 2 || roleName === 'super_admin' || roleName === 'admin';
    const isManager = roleName.includes('manager');
    const canSeeOthers = isAdmin || isManager;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFollowup, setEditingFollowup] = useState(null);
    const [search, setSearch] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        client_name: '',
        company_name: '',
        owner_name: '',
        client_email: '',
        client_contact: '',
        client_address: '',
        followup_date: new Date().toISOString().split('T')[0],
        status: 'Call Back',
        remarks: '',
        next_followup_date: '',
        meeting_date: '',
        meeting_time: '',
    });

    const { post: uploadPost, processing: uploading } = useForm({
        file: null
    });

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            uploadPost(route('followups.import'), {
                data: { file: e.target.files[0] },
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    alert('Follow-ups imported successfully!');
                },
                onError: (err) => {
                    alert(err.file || 'Error importing follow-ups.');
                }
            });
        }
    };

    const openModal = (followup = null) => {
        if (followup) {
            setEditingFollowup(followup);
            setData({
                client_name: followup.client_name || '',
                company_name: followup.company_name || followup.client_name || '',
                owner_name: followup.owner_name || '',
                client_email: followup.client_email || '',
                client_contact: followup.client_contact || '',
                client_address: followup.client_address || '',
                followup_date: followup.followup_date || '',
                status: followup.status || 'Call Back',
                remarks: followup.remarks || '',
                next_followup_date: followup.next_followup_date || '',
                meeting_date: followup.meeting_date || '',
                meeting_time: followup.meeting_time || '',
            });
        } else {
            setEditingFollowup(null);
            setData({
                client_name: '',
                company_name: '',
                owner_name: '',
                client_email: '',
                client_contact: '',
                client_address: '',
                followup_date: new Date().toISOString().split('T')[0],
                status: 'Call Back',
                remarks: '',
                next_followup_date: '',
                meeting_date: '',
                meeting_time: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFollowup(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingFollowup) {
            put(route('followups.update', editingFollowup.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('followups.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const statusColors = {
        'Interested': 'bg-green-100 text-green-700',
        'Deal Closed': 'bg-blue-100 text-blue-700',
        'Call Back': 'bg-amber-100 text-amber-700',
        'Not Interested': 'bg-red-100 text-red-700',
        'No Answer': 'bg-slate-100 text-slate-700',
    };

    // Filter and paginate
    const filteredFollowups = followups.filter(f => 
        f.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (f.user && f.user.name.toLowerCase().includes(search.toLowerCase())) ||
        (f.remarks && f.remarks.toLowerCase().includes(search.toLowerCase()))
    );

    const totalEntries = filteredFollowups.length;
    const totalPages = Math.ceil(totalEntries / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const currentFollowups = filteredFollowups.slice(startIndex, startIndex + perPage);

    return (
        <HmsLayout header="Daily Sales Follow-ups">
            <Head title="Daily Follow-ups" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <PhoneCall className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">Daily Follow-ups</h2>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search client or remarks..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <a 
                                href={route('followups.export')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </a>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer">
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Importing...' : 'Import CSV'}
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                            <button
                                onClick={() => openModal()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                Add Follow-up
                            </button>
                        </div>
                    </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                    {canSeeOthers && <th className="px-6 py-4 whitespace-nowrap">Sales Person</th>}
                                    <th className="px-6 py-4 whitespace-nowrap">Company Name</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Owner Name</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Contact Number</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Address</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Followups Date</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Meeting Date</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Meeting Time</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Remark</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {currentFollowups.length === 0 ? (
                                    <tr>
                                        <td colSpan={canSeeOthers ? 9 : 8} className="px-6 py-8 text-center text-slate-500">
                                            No follow-ups found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentFollowups.map((f) => {
                                        const isOwn = f.user_id === user.id;
                                        return (
                                            <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                    {f.followup_date}
                                                </td>
                                                {canSeeOthers && (
                                                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                                                        {f.user?.name || 'Unknown'}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                                                    {f.company_name || f.client_name}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                                                    {f.owner_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {f.client_contact || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-xs max-w-[150px] truncate whitespace-nowrap" title={f.client_address}>
                                                    {f.client_address || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {f.next_followup_date || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {f.meeting_date || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {f.meeting_time || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 max-w-xs truncate whitespace-nowrap" title={f.remarks}>
                                                    {f.remarks || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColors[f.status] || 'bg-slate-100 text-slate-700'}`}>
                                                        {f.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {(isOwn || isAdmin) ? (
                                                        <button
                                                            onClick={() => openModal(f)}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                            Update
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
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
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <h3 className="text-lg font-black text-slate-900">
                                {editingFollowup ? 'Edit Follow-up' : 'Add New Follow-up'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden min-h-0">
                            <div className="p-6 overflow-y-auto space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={data.followup_date}
                                            onChange={e => setData('followup_date', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        {errors.followup_date && <p className="text-red-500 text-xs mt-1">{errors.followup_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. ABC Corp"
                                            value={data.company_name}
                                            onChange={e => setData('company_name', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Owner Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Rahul Sharma"
                                            value={data.owner_name}
                                            onChange={e => setData('owner_name', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        {errors.owner_name && <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            placeholder="client@example.com"
                                            value={data.client_email}
                                            onChange={e => setData('client_email', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        {errors.client_email && <p className="text-red-500 text-xs mt-1">{errors.client_email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Contact No.</label>
                                        <input
                                            type="text"
                                            placeholder="+91 9876543210"
                                            value={data.client_contact}
                                            onChange={e => setData('client_contact', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        {errors.client_contact && <p className="text-red-500 text-xs mt-1">{errors.client_contact}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            placeholder="Company address..."
                                            value={data.client_address}
                                            onChange={e => setData('client_address', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        {errors.client_address && <p className="text-red-500 text-xs mt-1">{errors.client_address}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        >
                                            <option value="Interested">Interested</option>
                                            <option value="Call Back">Call Back</option>
                                            <option value="Not Interested">Not Interested</option>
                                            <option value="No Answer">No Answer</option>
                                            <option value="Deal Closed">Deal Closed</option>
                                        </select>
                                        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Next Follow-up Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={data.next_followup_date}
                                            onChange={e => setData('next_followup_date', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Date</label>
                                        <input
                                            type="date"
                                            value={data.meeting_date}
                                            onChange={e => setData('meeting_date', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Time</label>
                                        <input
                                            type="time"
                                            value={data.meeting_time}
                                            onChange={e => setData('meeting_time', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Remarks / Notes</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Discussed about pricing, asked to call tomorrow..."
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    ></textarea>
                                    {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Saving...' : 'Save Follow-up'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </HmsLayout>
    );
}
