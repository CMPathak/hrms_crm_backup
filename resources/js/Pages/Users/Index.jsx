import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import {
    Users,
    UserPlus,
    Code,
    Search,
    Handshake,
    Shield,
    Edit2,
    Trash2,
    Ban,
    CheckCircle2,
    Mail,
    Phone,
    Calendar,
    X,
    Check,
    Lock,
    User,
    AlertTriangle,
    Eye,
    EyeOff
} from 'lucide-react';

export default function UsersIndex({ users = [], roles = [], metrics = {}, currentTab = 'all', search: initialSearch = '' }) {
    const { flash } = usePage().props;

    // Filter states
    const [search, setSearch] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState(currentTab);

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Create User Form
    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '',
        status: 'active',
    });

    // Edit User Form
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '',
        status: 'active',
    });

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get(route('users.index'), {
            tab: tab !== 'all' ? tab : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle search
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('users.index'), {
            tab: activeTab !== 'all' ? activeTab : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle Create Submit
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (user) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role_id: user.role_id || '',
            password: '',
            status: user.status || 'active',
        });
    };

    // Handle Edit Submit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(route('users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    // Toggle Status
    const handleToggleStatus = (user) => {
        router.patch(route('users.updateStatus', user.id), {}, {
            preserveScroll: true,
        });
    };

    // Handle Delete
    const handleDeleteSubmit = () => {
        if (!deletingUser) return;
        router.delete(route('users.destroy', deletingUser.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingUser(null),
        });
    };

    // Avatar color generator based on name
    const getAvatarBg = (name) => {
        const colors = [
            'bg-violet-600',
            'bg-indigo-600',
            'bg-blue-600',
            'bg-emerald-600',
            'bg-rose-600',
            'bg-amber-600',
        ];
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'developers', label: 'Developers' },
        { id: 'seo', label: 'SEO' },
        { id: 'sales', label: 'Sales' },
        { id: 'admins', label: 'Admins' },
    ];

    return (
        <HmsLayout header="User & Role Management">
            <Head title="User & Role Management - HMS ERP" />

            <div className="space-y-6 pb-12">
                {/* TOP HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            User & Role Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Configure team members, access roles (Developer, Manager SEO, Sales, etc.) & active statuses.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            createForm.reset();
                            setCreateModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* 4 KPI SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Developer Team */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Developer Team</span>
                            <div className="text-3xl font-black text-slate-900 mt-1">
                                {metrics.developer_count ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Lead & Developers</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Code className="w-6 h-6" />
                        </div>
                    </div>

                    {/* 2. SEO Team */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">SEO Team</span>
                            <div className="text-3xl font-black text-slate-900 mt-1">
                                {metrics.seo_count ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Manager SEO & Executives</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                            <Search className="w-6 h-6" />
                        </div>
                    </div>

                    {/* 3. Sales Team */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Sales Team</span>
                            <div className="text-3xl font-black text-slate-900 mt-1">
                                {metrics.sales_count ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Sales Manager & Sales Persons</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Handshake className="w-6 h-6" />
                        </div>
                    </div>

                    {/* 4. Visible Users */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500">Visible Users</span>
                            <div className="text-3xl font-black text-slate-900 mt-1">
                                {metrics.visible_count ?? 0}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">Active in Directory</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* TEAM DIRECTORY & ROLES TABLE CARD */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    {/* Card Header & Controls */}
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Team Directory & Roles
                            </h2>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {users.length} members
                            </span>
                        </div>

                        {/* Search & Tabs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search user, email, phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                                />
                            </form>

                            {/* Tabs group matching screenshot */}
                            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                            activeTab === tab.id
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        {tab.label}
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
                                    <th className="py-3.5 px-5">User & Contact</th>
                                    <th className="py-3.5 px-4">Role Assigned</th>
                                    <th className="py-3.5 px-4">Phone</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Registered</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                                            No users found in this directory category.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* User & Contact */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${getAvatarBg(u.name)} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}>
                                                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">
                                                            {u.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Assigned */}
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-white shadow-xs">
                                                    <User className="w-3 h-3 text-slate-300" />
                                                    <span>{u.role?.display_name || u.role?.role_name || 'No Role'}</span>
                                                </span>
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                                                {u.phone || '—'}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {u.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            {/* Registered */}
                                            <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                                                {u.created_at}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(u)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    {/* Toggle Status */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(u)}
                                                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                                            u.status === 'active'
                                                                ? 'border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300'
                                                                : 'border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300'
                                                        }`}
                                                        title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingUser(u)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL: ADD NEW USER (Matching Screenshot Exactly) */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
                            <div className="flex items-center gap-2.5 font-bold text-base">
                                <UserPlus className="w-5 h-5" />
                                <span>Add New User</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-blue-700/50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alex Rivera"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.name}</p>
                                )}
                            </div>

                            {/* Work Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Work Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@hms.com"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.email}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="9876543210"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {createForm.errors.phone && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.phone}</p>
                                )}
                            </div>

                            {/* Role Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Role <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={createForm.data.role_id}
                                    onChange={(e) => createForm.setData('role_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="">-- Select Role --</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.display_name || r.role_name}
                                        </option>
                                    ))}
                                </select>
                                {createForm.errors.role_id && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.role_id}</p>
                                )}
                            </div>

                            {/* Temporary Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Temporary Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••••"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {createForm.errors.password && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.password}</p>
                                )}
                            </div>

                            {/* Initial Status */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Initial Status
                                </label>
                                <select
                                    value={createForm.data.status}
                                    onChange={(e) => createForm.setData('status', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Create User</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT USER */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
                            <div className="flex items-center gap-2.5 font-bold text-base">
                                <Edit2 className="w-5 h-5 text-indigo-400" />
                                <span>Edit User: {editingUser.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {editForm.errors.name && (
                                    <p className="text-xs text-rose-500 mt-1">{editForm.errors.name}</p>
                                )}
                            </div>

                            {/* Work Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Work Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {editForm.errors.email && (
                                    <p className="text-xs text-rose-500 mt-1">{editForm.errors.email}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {editForm.errors.phone && (
                                    <p className="text-xs text-rose-500 mt-1">{editForm.errors.phone}</p>
                                )}
                            </div>

                            {/* Role Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Role <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={editForm.data.role_id}
                                    onChange={(e) => editForm.setData('role_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value="">-- Select Role --</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.display_name || r.role_name}
                                        </option>
                                    ))}
                                </select>
                                {editForm.errors.role_id && (
                                    <p className="text-xs text-rose-500 mt-1">{editForm.errors.role_id}</p>
                                )}
                            </div>

                            {/* Password (Optional for Edit) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Reset Password (leave blank to keep current)
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {editForm.errors.password && (
                                    <p className="text-xs text-rose-500 mt-1">{editForm.errors.password}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: DELETE CONFIRMATION */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete User</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Are you sure you want to delete user <span className="font-bold text-slate-800">"{deletingUser.name}"</span> ({deletingUser.email})?
                        </p>
                        <p className="text-xs text-rose-500 mt-2 bg-rose-50 py-1.5 px-3 rounded-lg inline-block">
                            Their assignments and tasks will be unassigned or removed cleanly.
                        </p>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setDeletingUser(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSubmit}
                                className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HmsLayout>
    );
}
