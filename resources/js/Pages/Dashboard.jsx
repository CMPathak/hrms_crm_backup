import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import MetricCards from '@/Components/MetricCards';
import PaginatedTable from '@/Components/PaginatedTable';
import {
    Code2,
    Search,
    Handshake,
    Globe,
    FolderKanban,
    Plus,
    CheckSquare,
    ExternalLink,
    Clock,
    Calendar,
    Key,
    Phone,
    UserCheck,
    Laptop,
    AlertCircle,
    ArrowRight,
    TrendingUp
} from 'lucide-react';

export default function Dashboard({
    metrics,
    devProjects = [],
    seoProjects = [],
    salesProjects = [],
    expiringDomains = [],
    recentProjects = [],
    recentTasks = [],
    currentUserRole = 'super_admin',
    userLogins = []
}) {
    const [activeTab, setActiveTab] = useState('all');

    const statusBadge = (status) => {
        const st = (status || '').toLowerCase();
        if (st.includes('completed')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (st.includes('hold')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        if (st.includes('closed')) {
            return 'bg-slate-100 text-slate-700 border-slate-300';
        }
        if (st.includes('pending') || st.includes('not started')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        return 'bg-sky-50 text-sky-700 border-sky-200';
    };

    const calculateDaysLeft = (expiryDate) => {
        if (!expiryDate) return 0;
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    return (
        <HmsLayout header="Executive Dashboard">
            <Head title="Dashboard Overview - HMS Agency ERP" />

            {/* Header with Title and Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                        Agency Executive Dashboard
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Live overview of active clients, development milestones, SEO keyword rankings, and operations.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link
                        href={route('tasks.index')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
                    >
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                        Tasks Board
                    </Link>
                    <Link
                        href={route('projects.index')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </Link>
                </div>
            </div>

            {/* Top 6 Metric Cards & 4 Action Notification Cards */}
            <MetricCards metrics={metrics} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* SECTION */}
                <PaginatedTable
                    data={devProjects}
                    title="Developer"
                    // icon={<Code2 className="w-5 h-5 text-indigo-600" />}
                    badge={<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {devProjects.length} Project
                    </span>}
                    searchPlaceholder="Search developer projects..."
                >
                    {(paginatedData) => (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4 sm:px-6">Client & Project</th>
                                    <th className="py-3 px-4">Service & Domain</th>
                                    <th className="py-3 px-4">Assigned Developer</th>
                                    <th className="py-3 px-4">Dev Status</th>
                                    <th className="py-3 px-4" style={{ minWidth: '160px' }}>Progress</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No active developer projects found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((p) => {
                                        const pct = Math.min(100, Math.max(0, parseInt(p.dev_completion_pct || 0)));
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                                    <div className="font-bold text-slate-900">{p.company_name}</div>
                                                    <div className="text-xs text-slate-500">{p.project_name}</div>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                        {p.service_type || 'Web Dev'}
                                                    </span>
                                                    {p.domain_name && (
                                                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 mt-1">
                                                            <Globe className="w-3 h-3" />
                                                            <span className="truncate max-w-[140px]">{p.domain_name}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        <Laptop className="w-3 h-3" />
                                                        {p.dev_name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-sky-50 text-sky-700 border border-sky-200">
                                                        {p.dev_status || p.status || 'In Progress'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-600 w-8 text-right">
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                                                    <Link
                                                        href={route('projects.index')}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex items-center transition-colors"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </PaginatedTable>
                {/* SECTION */}
                <PaginatedTable
                    data={seoProjects}
                    title="SEO Clients"
                    // icon={<Search className="w-5 h-5 text-sky-600" />}
                    badge={<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                        {seoProjects.length} Projects
                    </span>}
                    searchPlaceholder="Search SEO projects..."
                >
                    {(paginatedData) => (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4 sm:px-6">Client & Project</th>
                                    <th className="py-3 px-4">Assigned SEO Person</th>
                                    <th className="py-3 px-4">Tracked Keywords</th>
                                    <th className="py-3 px-4">GMB Access Status</th>
                                    <th className="py-3 px-4">Workflow Stage</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No active SEO projects found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((p) => {
                                        const gmb = (p.gmb_access_desc || '').toLowerCase();
                                        const isGmbDone = gmb.includes('done') || gmb.includes('yes');
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                                    <div className="font-bold text-slate-900">{p.company_name}</div>
                                                    <div className="text-xs text-slate-500">{p.project_name}</div>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-sky-50 text-sky-700 border border-sky-100">
                                                        <UserCheck className="w-3 h-3" />
                                                        {p.seo_name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Key className="w-3 h-3" />
                                                        {p.total_keyword || 0} Keywords
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border ${isGmbDone
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}
                                                    >
                                                        {p.gmb_access_desc || 'Pending Access'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-200">
                                                        {p.workflow_stage || 'SEO Optimization'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                                                    <Link
                                                        href={route('projects.index')}
                                                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg inline-flex items-center transition-colors"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </PaginatedTable>          </div> {/* END OF GRID ROW */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* SECTION */}
                <PaginatedTable
                    data={salesProjects}
                    title="Sales Clients"
                    // icon={<Handshake className="w-5 h-5 text-emerald-600" />}
                    badge={<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {salesProjects.length} Sales
                    </span>}
                    searchPlaceholder="Search sales clients..."
                >
                    {(paginatedData) => (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4 sm:px-6">Customer & Contact</th>
                                    <th className="py-3 px-4">Project & Package</th>
                                    <th className="py-3 px-4">Sales Executive</th>
                                    <th className="py-3 px-4">Payment Info</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No sales records found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                                <div className="font-bold text-slate-900">{p.company_name}</div>
                                                {p.client_phone && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{p.client_phone}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-800">{p.project_name}</div>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {p.package || 'Standard Package'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <UserCheck className="w-3 h-3" />
                                                    {p.sales_person_name || 'Direct Lead'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="text-xs text-slate-600">{p.payment_info || '—'}</span>
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border ${statusBadge(
                                                        p.status
                                                    )}`}
                                                >
                                                    {p.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                                                <Link
                                                    href={route('projects.index')}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg inline-flex items-center transition-colors"
                                                    title="View Project"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </PaginatedTable>              {/* Recent Projects Card */}
                <PaginatedTable
                    data={recentProjects}
                    title="Recent Projects"

                    // icon={<FolderKanban className="w-5 h-5 text-indigo-600" />}
                    // badge={<Link
                    //     href={route('projects.index')}
                    //     className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    // >
                    //     View All <ArrowRight className="w-3.5 h-3.5" />
                    // </Link>}
                    searchPlaceholder="Search recent projects..."
                >
                    {(paginatedData) => (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4 sm:px-6">Project</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                                            <div className="font-semibold text-slate-900">{p.project_name}</div>
                                            <span className="text-xs text-indigo-600 font-mono">
                                                {p.custom_project_id}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                                            {p.customer?.company_name || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${statusBadge(
                                                    p.status
                                                )}`}
                                            >
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </PaginatedTable>
            </div>

            {/* SECTION 4: Expiring Domains & User Login History */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* Expiring Domains Card */}
                <PaginatedTable
                    data={expiringDomains}
                    title="Expiring Domains & Hosting"
                    searchPlaceholder="Search domains..."
                >
                    {(paginatedData) => (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4 sm:px-6">Domain</th>
                                    <th className="py-3 px-4">Company</th>
                                    <th className="py-3 px-4">Expiry Date</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Days Left</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400">
                                            No domains expiring in next 60 days.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((d) => {
                                        const days = calculateDaysLeft(d.domain_expiry_date);
                                        return (
                                            <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 whitespace-nowrap">
                                                    {d.domain_name}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                                                    {d.company_name}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                                                    {d.domain_expiry_date}
                                                </td>
                                                <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${days <= 7
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : days <= 15
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        <AlertCircle className="w-3 h-3" />
                                                        {days}d left
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </PaginatedTable>
                {/* USER LOGIN ACTIVITY & AUDIT TRAIL */}
                {userLogins && userLogins.length > 0 && (
                    <PaginatedTable
                        data={userLogins}
                        title="Login History"
                        // subtitle="Live record of team member login dates, times, and access devices"
                        // icon={<UserCheck className="w-5 h-5 text-indigo-600" />}
                        badge={<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {userLogins.length} recent
                        </span>}
                        searchPlaceholder="Search login history..."
                    >
                        {(paginatedData) => (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
                                    <tr>
                                        <th className="py-3 px-4 sm:px-6">User & Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Login Date & Time</th>
                                        <th className="py-3 px-4">IP Address</th>
                                        <th className="py-3 px-4 sm:px-6 text-right">Device / Client</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedData.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                                                <div className="font-bold text-slate-900">{log.name}</div>
                                                <span className="text-xs text-slate-400">{log.email}</span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {log.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{log.login_date}</span>
                                                    <span className="text-slate-400 font-normal">at</span>
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                                                    <span className="text-indigo-600 font-bold">{log.login_time}</span>
                                                </div>
                                                <span className="text-[0.7rem] text-slate-400 block mt-0.5">{log.time_ago}</span>
                                            </td>
                                            <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                                                {log.ip_address}
                                            </td>
                                            <td className="py-3 px-4 sm:px-6 text-right text-xs text-slate-500 font-medium whitespace-nowrap">
                                                {log.user_agent || 'Browser Session'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </PaginatedTable>
                )}
            </div> {/* END OF GRID ROW */}
        </HmsLayout>
    );
}
