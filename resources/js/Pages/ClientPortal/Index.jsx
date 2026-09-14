import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import {
    Building2,
    Users,
    FolderKanban,
    Receipt,
    Headset,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    EyeOff,
    Sliders,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    X,
    ExternalLink
} from 'lucide-react';

export default function ClientPortalIndex({
    viewMode = 'admin',
    customer,
    projects = [],
    invoices = [],
    tickets = [],
    seoKeywords = [],
    clients = { data: [] },
    filters = {},
    stats = {},
    allProjects = [],
    isAdmin = false,
}) {
    // Admin state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form for Adding Client + Login
    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: resetAdd } = useForm({
        client_name: '',
        company_name: '',
        email: '',
        mobile: '',
        password: '',
        business_category: '',
        address: '',
        project_name: '',
    });

    // Form for Updating Progress
    const { data: progressData, setData: setProgressData, patch: patchProgress, processing: progressProcessing, reset: resetProgress } = useForm({
        dev_completion_pct: 0,
        workflow_stage: 'Project Created',
        design_banner: false,
        design_logo: false,
        design_ui: false,
        design_client_approval: false,
        status: 'Active',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('client-portal.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleOpenProgressModal = (proj) => {
        setSelectedProject(proj);
        setProgressData({
            dev_completion_pct: proj.dev_completion_pct || 0,
            workflow_stage: proj.workflow_stage || 'Project Created',
            design_banner: Boolean(proj.design_banner),
            design_logo: Boolean(proj.design_logo),
            design_ui: Boolean(proj.design_ui),
            design_client_approval: Boolean(proj.design_client_approval),
            status: proj.status || 'Active',
        });
        setIsProgressModalOpen(true);
    };

    const handleSaveProgress = (e) => {
        e.preventDefault();
        if (!selectedProject) return;
        patchProgress(route('client-portal.updateProgress', selectedProject.id), {
            onSuccess: () => {
                setIsProgressModalOpen(false);
            }
        });
    };

    const handleCreateClient = (e) => {
        e.preventDefault();
        postAdd(route('client-portal.storeClient'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                resetAdd();
            }
        });
    };

    // Helper badges
    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'active') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>;
        if (s === 'completed') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;
        if (s === 'closed') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">Closed</span>;
        if (s === 'hold') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Hold</span>;
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status || 'Pending'}</span>;
    };

    return (
        <HmsLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        {viewMode === 'client' ? 'Client Portal (Phase 6)' : 'Client Portal & Account Management'}
                    </h2>
                </div>
            }
        >
            <Head title={viewMode === 'client' ? 'Client Portal' : 'Client Management'} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

                {/* ========================================================================= */}
                {/* 1. CLIENT VIEW (When logged in as client)                                */}
                {/* ========================================================================= */}
                {viewMode === 'client' && (
                    <>
                        {/* Welcome Header */}
                        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white mb-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                                    Verified Client Access
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Client Portal</h1>
                                <p className="text-blue-100 mt-1 max-w-2xl text-sm sm:text-base leading-relaxed">
                                    Welcome! Track your live project progress, download invoices, review SEO/Ads reports, approve design mockups, and raise tickets.
                                </p>
                            </div>
                            <Link
                                href={route('tickets.index')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold shadow-md hover:bg-blue-50 transition-all transform active:scale-95 text-sm shrink-0"
                            >
                                <Headset className="w-4 h-4" />
                                Raise Support Ticket
                            </Link>
                        </div>

                        {/* Two Columns: Project Progress (Left) and Billing & Invoices (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Project Progress */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <FolderKanban className="w-5 h-5 text-blue-600" />
                                            My Project Progress
                                        </h3>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'} assigned
                                        </span>
                                    </div>

                                    {projects.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <FolderKanban className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                            <p className="font-medium">No active projects assigned yet.</p>
                                            <p className="text-xs text-slate-400 mt-1">Please contact your account manager for project onboarding.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {projects.map((p) => (
                                                <div key={p.id} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-blue-900 text-base sm:text-lg">
                                                                {p.project_name}
                                                            </h4>
                                                            {p.service_type && (
                                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                                    {p.service_type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>{getStatusBadge(p.status)}</div>
                                                    </div>

                                                    <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2">
                                                        {p.description || 'Project undergoing active development and milestones.'}
                                                    </p>

                                                    {/* Workflow stage and dev completion */}
                                                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                                                        <span>
                                                            Workflow Stage: <strong className="text-blue-700 font-semibold">{p.workflow_stage || 'Project Created'}</strong>
                                                        </span>
                                                        <span>
                                                            Dev Completion: <strong className="text-blue-700 font-semibold">{p.dev_completion_pct || 0}%</strong>
                                                        </span>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min(100, Math.max(0, p.dev_completion_pct || 0))}%` }}
                                                        ></div>
                                                    </div>

                                                    {/* Design Sign-Offs */}
                                                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                                                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                                                            🎨 Design Sign-Offs:
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${p.design_banner ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                                                Banner
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${p.design_logo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                                                Logo
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${p.design_ui ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                                                UI Design
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${p.design_client_approval ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                                                                {p.design_client_approval ? 'Client Approved' : 'Pending Approval'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Billing & Invoices */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-emerald-600" />
                                            My Billing & Invoices
                                        </h3>
                                    </div>

                                    {invoices.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                                            <p className="text-xs font-medium">No invoices generated yet.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {invoices.map((inv) => (
                                                <div key={inv.id} className="py-3 flex items-center justify-between">
                                                    <div>
                                                        <span className="font-bold text-slate-800 text-sm block">
                                                            {inv.invoice_number || `INV-${inv.id}`}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="font-bold text-slate-900 text-sm block">
                                                            ₹{Number(inv.total_amount || 0).toLocaleString()}
                                                        </span>
                                                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${(inv.payment_status || '').toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                            {inv.payment_status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Support Tickets Quick Box */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <Headset className="w-4 h-4 text-blue-600" />
                                            My Support Tickets
                                        </h3>
                                        <Link href={route('tickets.index')} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                                            View All
                                        </Link>
                                    </div>
                                    {tickets.length === 0 ? (
                                        <p className="text-xs text-slate-500 py-3 text-center">No open tickets. Need help? Raise a ticket anytime!</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {tickets.slice(0, 3).map((t) => (
                                                <div key={t.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                                    <div className="truncate mr-2">
                                                        <span className="font-bold text-slate-800">{t.ticket_number}</span>: {t.subject}
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${t.status === 'Open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================================= */}
                {/* 2. ADMIN VIEW (When logged in as Admin / Super Admin)                    */}
                {/* ========================================================================= */}
                {viewMode === 'admin' && (
                    <>
                        {/* KPI Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-slate-400">Total Clients</span>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalClients || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-slate-400">Clients with Login</span>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.clientsWithLogin || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-slate-400">Total Tickets</span>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTickets || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Headset className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-slate-400">Open Tickets</span>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.openTickets || 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Client Management Header */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Client Directory & Login Management</h3>
                                    <p className="text-xs text-slate-500">
                                        Add new clients, generate login accounts for them, and manage project progress & sign-offs.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New Client & Create Login
                                </button>
                            </div>

                            {/* Search bar */}
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by client name, company, email, mobile, or ID..."
                                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-all"
                                >
                                    Search
                                </button>
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            router.get(route('client-portal.index'));
                                        }}
                                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>

                            {/* Clients Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-700">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-y border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">Client / Company</th>
                                            <th className="py-3 px-4">Contact Info</th>
                                            <th className="py-3 px-4">Portal Login</th>
                                            <th className="py-3 px-4">Assigned Projects & Progress</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {clients.data?.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400">
                                                    No clients found. Click "+ Add New Client" to onboard a client.
                                                </td>
                                            </tr>
                                        ) : (
                                            clients.data?.map((c) => (
                                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-900">{c.company_name}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {c.client_name} • <span className="font-mono text-blue-600">{c.custom_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs">
                                                        <div className="text-slate-900 font-medium">{c.email}</div>
                                                        <div className="text-slate-500">{c.mobile || 'No phone'}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {c.user ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Login Active ({c.user.email})
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No User Account</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {c.projects && c.projects.length > 0 ? (
                                                            <div className="space-y-1.5 max-w-xs">
                                                                {c.projects.map((proj) => (
                                                                    <div key={proj.id} className="bg-slate-100/70 p-2 rounded-lg border border-slate-200/60">
                                                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                                                                            <span className="truncate mr-2">{proj.project_name}</span>
                                                                            <span className="text-blue-600 font-bold">{proj.dev_completion_pct || 0}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                            <div
                                                                                className="bg-blue-600 h-1.5 rounded-full"
                                                                                style={{ width: `${proj.dev_completion_pct || 0}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                                                            <span>{proj.workflow_stage || 'Created'}</span>
                                                                            <button
                                                                                onClick={() => handleOpenProgressModal(proj)}
                                                                                className="text-blue-600 hover:text-blue-800 font-medium underline"
                                                                            >
                                                                                Edit Progress
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">No project linked</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        {c.projects && c.projects.length > 0 && (
                                                            <button
                                                                onClick={() => handleOpenProgressModal(c.projects[0])}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all mr-2"
                                                            >
                                                                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                                                                Update Progress
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {clients.links && clients.links.length > 3 && (
                                <div className="flex justify-end gap-1 pt-3 border-t border-slate-100">
                                    {clients.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    : 'text-slate-300 pointer-events-none'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: ADD NEW CLIENT & CREATE LOGIN                                    */}
            {/* ========================================================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-150">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Add Client & Create Portal Login</h3>
                                <p className="text-xs text-slate-500">This will register the customer and create credentials for client portal access.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addData.company_name}
                                        onChange={(e) => setAddData('company_name', e.target.value)}
                                        placeholder="e.g. Acme Health Care"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {addErrors.company_name && <p className="text-[11px] text-red-500 mt-0.5">{addErrors.company_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client / Contact Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addData.client_name}
                                        onChange={(e) => setAddData('client_name', e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {addErrors.client_name && <p className="text-[11px] text-red-500 mt-0.5">{addErrors.client_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Login Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={addData.email}
                                        onChange={(e) => setAddData('email', e.target.value)}
                                        placeholder="client@domain.com"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {addErrors.email && <p className="text-[11px] text-red-500 mt-0.5">{addErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone</label>
                                    <input
                                        type="text"
                                        value={addData.mobile}
                                        onChange={(e) => setAddData('mobile', e.target.value)}
                                        placeholder="+91 9876543210"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Password input with show/hide toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Login Password *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={addData.password}
                                        onChange={(e) => setAddData('password', e.target.value)}
                                        placeholder="Enter portal password (min 6 characters)"
                                        className="w-full text-xs rounded-xl border-slate-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">The client will log in at /login with their email and this password.</p>
                                {addErrors.password && <p className="text-[11px] text-red-500 mt-0.5">{addErrors.password}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category</label>
                                    <input
                                        type="text"
                                        value={addData.business_category}
                                        onChange={(e) => setAddData('business_category', e.target.value)}
                                        placeholder="e.g. Real Estate, Clinic, eCommerce"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Project Name</label>
                                    <input
                                        type="text"
                                        value={addData.project_name}
                                        onChange={(e) => setAddData('project_name', e.target.value)}
                                        placeholder="e.g. Website Development & SEO"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addProcessing}
                                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {addProcessing ? 'Creating Account...' : 'Create Client & Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: UPDATE PROJECT PROGRESS & DESIGN SIGN-OFFS                       */}
            {/* ========================================================================= */}
            {isProgressModalOpen && selectedProject && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-150">
                        <button
                            onClick={() => setIsProgressModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Update Project Progress</h3>
                                <p className="text-xs text-blue-600 font-semibold">{selectedProject.project_name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProgress} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Dev Completion Percentage: <strong className="text-blue-600">{progressData.dev_completion_pct}%</strong>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progressData.dev_completion_pct}
                                    onChange={(e) => setProgressData('dev_completion_pct', Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>0% (Not started)</span>
                                    <span>50% (In Dev)</span>
                                    <span>100% (Completed)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Workflow Stage</label>
                                    <select
                                        value={progressData.workflow_stage}
                                        onChange={(e) => setProgressData('workflow_stage', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="Project Created">Project Created</option>
                                        <option value="Design">Design</option>
                                        <option value="Development">Development</option>
                                        <option value="SEO">SEO</option>
                                        <option value="Testing">Testing</option>
                                        <option value="Client Approval">Client Approval</option>
                                        <option value="Go Live">Go Live</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
                                    <select
                                        value={progressData.status}
                                        onChange={(e) => setProgressData('status', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Hold">Hold</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            {/* Design Sign-Off Checkboxes */}
                            <div className="pt-3 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-800 mb-2">🎨 Design Sign-Offs (Shown to Client)</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={progressData.design_banner}
                                            onChange={(e) => setProgressData('design_banner', e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Banner Approved</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={progressData.design_logo}
                                            onChange={(e) => setProgressData('design_logo', e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Logo Approved</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={progressData.design_ui}
                                            onChange={(e) => setProgressData('design_ui', e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>UI Design Approved</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={progressData.design_client_approval}
                                            onChange={(e) => setProgressData('design_client_approval', e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Client Sign-Off Given</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsProgressModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={progressProcessing}
                                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {progressProcessing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </HmsLayout>
    );
}
