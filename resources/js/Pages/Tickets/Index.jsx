import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import {
    Headset,
    Plus,
    Search,
    Reply,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    MessageSquare,
    Send,
    Building2,
    Tag,
    User as UserIcon,
    ChevronDown
} from 'lucide-react';

export default function TicketsIndex({
    tickets = { data: [] },
    replies = {},
    customers = [],
    projects = [],
    stats = {},
    filters = {},
    isAdmin = false,
    isClient = false,
    currentCustomer = null,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    
    // Modals
    const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
    const [selectedTicketForReply, setSelectedTicketForReply] = useState(null);

    // Form for Raising Ticket
    const { data: raiseData, setData: setRaiseData, post: postRaise, processing: raiseProcessing, errors: raiseErrors, reset: resetRaise } = useForm({
        customer_id: currentCustomer ? currentCustomer.id : '',
        project_id: '',
        subject: '',
        priority: 'Medium',
        message: '',
    });

    // Form for Replying to Ticket
    const { data: replyData, setData: setReplyData, post: postReply, processing: replyProcessing, reset: resetReply } = useForm({
        reply_message: '',
        status: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('tickets.index'), {
            search: searchTerm,
            status: statusFilter,
            priority: priorityFilter,
        }, { preserveState: true });
    };

    const handleFilterChange = (status, priority) => {
        setStatusFilter(status);
        setPriorityFilter(priority);
        router.get(route('tickets.index'), {
            search: searchTerm,
            status: status,
            priority: priority,
        }, { preserveState: true });
    };

    const handleCreateTicket = (e) => {
        e.preventDefault();
        postRaise(route('tickets.store'), {
            onSuccess: () => {
                setIsRaiseModalOpen(false);
                resetRaise();
            }
        });
    };

    const handleOpenReplyModal = (ticket) => {
        setSelectedTicketForReply(ticket);
        setReplyData({
            reply_message: '',
            status: ticket.status,
        });
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        if (!selectedTicketForReply) return;
        postReply(route('tickets.reply', selectedTicketForReply.id), {
            onSuccess: () => {
                resetReply();
                // Keep modal open so conversation is visible
            }
        });
    };

    const getPriorityBadge = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'high') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
                    🔥 High
                </span>
            );
        }
        if (p === 'medium') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                    Medium
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                Low
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'open') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 shadow-sm">
                    <Clock className="w-3 h-3" /> Open
                </span>
            );
        }
        if (s === 'in progress') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-sm">
                    In Progress
                </span>
            );
        }
        if (s === 'resolved') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white">
                Closed
            </span>
        );
    };

    const ticketRepliesList = selectedTicketForReply ? (replies[selectedTicketForReply.id] || []) : [];

    return (
        <HmsLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight flex items-center gap-2">
                        <Headset className="w-6 h-6 text-blue-600" />
                        Support Tickets (Phase 6)
                    </h2>
                </div>
            }
        >
            <Head title="Support Tickets" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Title Bar & Raise Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets (Phase 6)</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Client support tickets, technical inquiries, and resolution updates.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (currentCustomer) {
                                setRaiseData('customer_id', currentCustomer.id);
                            }
                            setIsRaiseModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Raise Support Ticket
                    </button>
                </div>

                {/* KPI Status Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div
                        onClick={() => handleFilterChange('all', priorityFilter)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${statusFilter === 'all' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                        <span className="text-xs uppercase font-semibold text-slate-400">Total Tickets</span>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total || 0}</p>
                    </div>
                    <div
                        onClick={() => handleFilterChange('Open', priorityFilter)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${statusFilter === 'Open' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                        <span className="text-xs uppercase font-semibold text-amber-600">Open Tickets</span>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{stats.open || 0}</p>
                    </div>
                    <div
                        onClick={() => handleFilterChange('In Progress', priorityFilter)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${statusFilter === 'In Progress' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                        <span className="text-xs uppercase font-semibold text-blue-600">In Progress</span>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{stats.in_progress || 0}</p>
                    </div>
                    <div
                        onClick={() => handleFilterChange('Resolved', priorityFilter)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${statusFilter === 'Resolved' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                        <span className="text-xs uppercase font-semibold text-emerald-600">Resolved</span>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.resolved || 0}</p>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    {/* Filter / Search bar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Priority:</span>
                            <select
                                value={priorityFilter}
                                onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
                                className="text-xs rounded-xl border-slate-300 py-1.5 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All Priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search records..."
                                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Table matching screenshot */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-y border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Ticket #</th>
                                    <th className="py-3 px-4">Customer Company</th>
                                    <th className="py-3 px-4">Subject & Message</th>
                                    <th className="py-3 px-4">Project</th>
                                    <th className="py-3 px-4">Priority</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tickets.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400">
                                            No support tickets found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.data?.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {t.ticket_number}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-semibold text-slate-900">
                                                {t.customer?.company_name || 'General Client'}
                                            </td>
                                            <td className="py-4 px-4 max-w-sm">
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {t.subject}
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                    {t.message}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {t.project?.project_name || 'General Inquiry'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {getPriorityBadge(t.priority)}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {getStatusBadge(t.status)}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleOpenReplyModal(t)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold shadow-sm transition-all active:scale-95"
                                                >
                                                    <Reply className="w-3.5 h-3.5" />
                                                    Reply
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tickets.links && tickets.links.length > 3 && (
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                            <div>
                                Showing {tickets.from || 0} to {tickets.to || 0} of {tickets.total || 0} entries
                            </div>
                            <div className="flex gap-1">
                                {tickets.links.map((link, idx) => (
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
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: RAISE SUPPORT TICKET                                             */}
            {/* ========================================================================= */}
            {isRaiseModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-150">
                        <button
                            onClick={() => setIsRaiseModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Headset className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Raise Support Ticket</h3>
                                <p className="text-xs text-slate-500">Describe your inquiry or issue for prompt resolution.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            {isAdmin && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Company *</label>
                                    <select
                                        required
                                        value={raiseData.customer_id}
                                        onChange={(e) => setRaiseData('customer_id', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select Customer Company</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.company_name} ({c.client_name})
                                            </option>
                                        ))}
                                    </select>
                                    {raiseErrors.customer_id && <p className="text-[11px] text-red-500 mt-0.5">{raiseErrors.customer_id}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Project (Optional)</label>
                                <select
                                    value={raiseData.project_id}
                                    onChange={(e) => setRaiseData('project_id', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select Related Project (Or General Inquiry)</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.project_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={raiseData.subject}
                                        onChange={(e) => setRaiseData('subject', e.target.value)}
                                        placeholder="e.g. SEO keywords not ranking / Design change"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {raiseErrors.subject && <p className="text-[11px] text-red-500 mt-0.5">{raiseErrors.subject}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={raiseData.priority}
                                        onChange={(e) => setRaiseData('priority', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Message *</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={raiseData.message}
                                    onChange={(e) => setRaiseData('message', e.target.value)}
                                    placeholder="Please describe what help or change is needed..."
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                ></textarea>
                                {raiseErrors.message && <p className="text-[11px] text-red-500 mt-0.5">{raiseErrors.message}</p>}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRaiseModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={raiseProcessing}
                                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {raiseProcessing ? 'Submitting...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: TICKET REPLY & CONVERSATION THREAD                               */}
            {/* ========================================================================= */}
            {selectedTicketForReply && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
                        <button
                            onClick={() => setSelectedTicketForReply(null)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Ticket Summary Header */}
                        <div className="pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                    {selectedTicketForReply.ticket_number}
                                </span>
                                {getPriorityBadge(selectedTicketForReply.priority)}
                                {getStatusBadge(selectedTicketForReply.status)}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {selectedTicketForReply.subject}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {selectedTicketForReply.customer?.company_name} • {selectedTicketForReply.project?.project_name || 'General Inquiry'}
                            </p>
                        </div>

                        {/* Original Message & Conversation replies */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                            {/* Original issue */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                                    <span>Original Issue / Query</span>
                                    <span className="text-[11px] text-slate-400">
                                        {new Date(selectedTicketForReply.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                                    {selectedTicketForReply.message}
                                </p>
                            </div>

                            {/* Replies */}
                            {ticketRepliesList.map((rep) => (
                                <div
                                    key={rep.id}
                                    className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs"
                                >
                                    <div className="flex items-center justify-between font-semibold text-blue-950 mb-1">
                                        <span className="flex items-center gap-1.5">
                                            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                                            {rep.user?.name || 'Support Staff'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(rep.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                                        {rep.reply_message}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <label className="text-xs font-semibold text-slate-700">Write a Reply:</label>
                                {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                                        <select
                                            value={replyData.status}
                                            onChange={(e) => setReplyData('status', e.target.value)}
                                            className="text-xs rounded-xl border-slate-300 py-1 focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <textarea
                                rows={3}
                                required
                                value={replyData.reply_message}
                                onChange={(e) => setReplyData('reply_message', e.target.value)}
                                placeholder="Type your response here..."
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            ></textarea>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTicketForReply(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    disabled={replyProcessing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {replyProcessing ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </HmsLayout>
    );
}
