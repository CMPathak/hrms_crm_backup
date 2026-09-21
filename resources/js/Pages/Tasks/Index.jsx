import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import {
    CheckSquare,
    Plus,
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    X,
    Edit2,
    Trash2,
    RotateCcw,
    Folder,
    User,
    Filter,
    Check,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function TasksIndex({ tasks, stats, projects, users, filters, isManager }) {
    const { flash, auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || '');
    const [projectFilter, setProjectFilter] = useState(filters.project_id || '');
    const [assignedToFilter, setAssignedToFilter] = useState(filters.assigned_to || '');

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deletingTask, setDeletingTask] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    
    const totalTasks = tasks.length;
    const totalPages = Math.ceil(totalTasks / perPage) || 1;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedTasks = tasks.slice(startIndex, startIndex + perPage);

    // Create Form
    const createForm = useForm({
        title: '',
        project_id: '',
        assigned_to: currentUserId || '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Pending',
        description: '',
    });

    // Edit Form
    const editForm = useForm({
        title: '',
        project_id: '',
        assigned_to: '',
        due_date: '',
        priority: 'Medium',
        status: 'Pending',
        description: '',
    });

    // Handle filter submit
    const applyFilters = (newFilters = {}) => {
        setCurrentPage(1);
        const query = {
            search,
            status: statusFilter,
            priority: priorityFilter,
            project_id: projectFilter,
            assigned_to: assignedToFilter,
            ...newFilters,
        };

        // Remove empty keys
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        router.get(route('tasks.index'), query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatCardClick = (statKey) => {
        const mappedStatus = {
            today: 'Today',
            pending: 'Pending',
            completed: 'Completed',
            overdue: 'Overdue',
            upcoming: 'Upcoming',
        }[statKey];

        const nextStatus = statusFilter === mappedStatus ? '' : mappedStatus;
        setStatusFilter(nextStatus);
        applyFilters({ status: nextStatus });
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setPriorityFilter('');
        setProjectFilter('');
        setAssignedToFilter('');
        router.get(route('tasks.index'), {}, { preserveState: true, replace: true });
    };

    // Open Edit Modal
    const handleOpenEdit = (task) => {
        setEditingTask(task);
        editForm.setData({
            title: task.title || '',
            project_id: task.project_id || '',
            assigned_to: task.assigned_to || '',
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
            priority: task.priority || 'Medium',
            status: task.status || 'Pending',
            description: task.description || '',
        });
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('tasks.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    // Submit Edit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingTask) return;
        editForm.put(route('tasks.update', editingTask.id), {
            onSuccess: () => {
                setEditingTask(null);
            },
        });
    };

    // Quick Mark Status
    const handleQuickStatus = (task, newStatus) => {
        router.patch(route('tasks.updateStatus', task.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    // Submit Delete
    const handleDelete = () => {
        if (!deletingTask) return;
        router.delete(route('tasks.destroy', deletingTask.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingTask(null);
            },
        });
    };

    // Priority badge helper
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Low':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    // Status badge helper
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Overdue':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'Today':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Upcoming':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <HmsLayout header="Personal Task Board">
            <Head title="Task Management Board - HMS ERP" />

            {/* Flash Alerts */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <CheckSquare className="w-7 h-7 text-indigo-600" />
                        Personal Task Board
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Organize daily priorities, pending tasks, overdue items, and upcoming deliverables.
                    </p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Assign New Task
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {/* Today's Tasks */}
                <div
                    onClick={() => handleStatCardClick('today')}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
                        statusFilter === 'Today'
                            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Today's</span>
                        <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-blue-600">{stats.today}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Due today</p>
                </div>

                {/* Pending */}
                <div
                    onClick={() => handleStatCardClick('pending')}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
                        statusFilter === 'Pending'
                            ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <p className="text-[11px] text-slate-400 mt-1">In progress</p>
                </div>

                {/* Completed */}
                <div
                    onClick={() => handleStatCardClick('completed')}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
                        statusFilter === 'Completed'
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.completed}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Done deliverables</p>
                </div>

                {/* Overdue */}
                <div
                    onClick={() => handleStatCardClick('overdue')}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
                        statusFilter === 'Overdue'
                            ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                            : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-rose-600">{stats.overdue}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Past due date</p>
                </div>

                {/* Upcoming */}
                <div
                    onClick={() => handleStatCardClick('upcoming')}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md col-span-2 md:col-span-1 ${
                        statusFilter === 'Upcoming'
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
                        <Calendar className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-indigo-600">{stats.upcoming}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Future deadlines</p>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-6 shadow-xs">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search tasks by title or details..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            applyFilters({ status: e.target.value });
                        }}
                        className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                    >
                        <option value="">All Statuses</option>
                        <option value="Today">Today</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Upcoming">Upcoming</option>
                    </select>

                    {/* Priority Dropdown */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                            applyFilters({ priority: e.target.value });
                        }}
                        className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                    >
                        <option value="">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    {/* Project Dropdown */}
                    <select
                        value={projectFilter}
                        onChange={(e) => {
                            setProjectFilter(e.target.value);
                            applyFilters({ project_id: e.target.value });
                        }}
                        className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 max-w-[200px]"
                    >
                        <option value="">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.project_name}
                            </option>
                        ))}
                    </select>

                    {/* Assignee Filter (for managers) */}
                    {isManager && (
                        <select
                            value={assignedToFilter}
                            onChange={(e) => {
                                setAssignedToFilter(e.target.value);
                                applyFilters({ assigned_to: e.target.value });
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 max-w-[180px]"
                        >
                            <option value="">All Assignees</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                        >
                            Filter
                        </button>
                        {(search || statusFilter || priorityFilter || projectFilter || assignedToFilter) && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-sm font-medium rounded-xl transition-colors"
                                title="Reset filters"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Task Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">No tasks found</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            There are currently no tasks matching your search or active filter criteria.
                        </p>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Assign New Task
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                        <th className="py-3.5 px-4 whitespace-nowrap">Task Details</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Project</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Assigned To</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {paginatedTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="hover:bg-slate-50/80 transition-colors group"
                                        >
                                            {/* Task Details */}
                                            <td className="py-4 px-4 max-w-md whitespace-nowrap">
                                                <div className="flex items-start gap-2.5">
                                                    <button
                                                        onClick={() =>
                                                            handleQuickStatus(
                                                                task,
                                                                task.status === 'Completed' ? 'Pending' : 'Completed'
                                                            )
                                                        }
                                                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                                            task.status === 'Completed'
                                                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                                                : 'border-slate-300 hover:border-indigo-600 text-transparent hover:text-indigo-400'
                                                        }`}
                                                        title={
                                                            task.status === 'Completed'
                                                                ? 'Mark as Pending'
                                                                : 'Mark as Completed'
                                                        }
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div>
                                                        <div
                                                            className={`font-semibold text-slate-800 ${
                                                                task.status === 'Completed' ? 'line-through text-slate-400' : ''
                                                            }`}
                                                        >
                                                            {task.title}
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Project */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {task.project ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                        <Folder className="w-3 h-3 text-slate-400" />
                                                        {task.project.project_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">
                                                        General / Internal
                                                    </span>
                                                )}
                                            </td>

                                            {/* Assignee */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {task.assignee?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-slate-800 truncate">
                                                            {task.assignee?.name || 'Unassigned'}
                                                        </p>
                                                        {task.assigner && (
                                                            <p className="text-[10px] text-slate-400">
                                                                by {task.assigner.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Due Date */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="text-xs text-slate-600 font-medium">
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                                                </span>
                                            </td>

                                            {/* Priority */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority || 'Medium'}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                                                        task.status
                                                    )}`}
                                                >
                                                    {task.status || 'Pending'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1">
                                                    {task.status !== 'Completed' ? (
                                                        <button
                                                            onClick={() => handleQuickStatus(task, 'Completed')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                            title="Mark as Completed"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleQuickStatus(task, 'Pending')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            title="Reopen Task"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleOpenEdit(task)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        title="Edit Task"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeletingTask(task)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* PAGINATION */}
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white text-sm text-slate-600">
                            <div>
                                Showing {totalTasks === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalTasks)} of {totalTasks} entries
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="text-sm border border-slate-200 rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="200">200</option>
                                        <option value="500">500</option>
                                        <option value="1000">1000</option>
                                        <option value={Math.max(2000, totalTasks)}>Show All Entries</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-colors ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-colors ${currentPage === totalPages || totalPages === 0 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Task Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                Assign New Task
                            </h3>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Task Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Optimize Homepage Load Speed"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                                {createForm.errors.title && (
                                    <p className="text-xs text-rose-600 mt-1">{createForm.errors.title}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Project (Optional)
                                    </label>
                                    <select
                                        value={createForm.data.project_id}
                                        onChange={(e) => createForm.setData('project_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="">-- General Task --</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.project_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Assign To <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={createForm.data.assigned_to}
                                        onChange={(e) => createForm.setData('assigned_to', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Due Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.due_date}
                                        onChange={(e) => createForm.setData('due_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={createForm.data.priority}
                                        onChange={(e) => createForm.setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={createForm.data.status}
                                        onChange={(e) => createForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Today">Today</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Upcoming">Upcoming</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Description / Notes
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Add any helpful instructions or checklist items..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {createForm.processing ? 'Assigning...' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-600" />
                                Edit Task #{editingTask.id}
                            </h3>
                            <button
                                onClick={() => setEditingTask(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Task Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                                {editForm.errors.title && (
                                    <p className="text-xs text-rose-600 mt-1">{editForm.errors.title}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Project (Optional)
                                    </label>
                                    <select
                                        value={editForm.data.project_id}
                                        onChange={(e) => editForm.setData('project_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="">-- General Task --</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.project_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Assign To <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={editForm.data.assigned_to}
                                        onChange={(e) => editForm.setData('assigned_to', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Due Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.data.due_date}
                                        onChange={(e) => editForm.setData('due_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={editForm.data.priority}
                                        onChange={(e) => editForm.setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Today">Today</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Upcoming">Upcoming</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Description / Notes
                                </label>
                                <textarea
                                    rows="3"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center">Delete Task</h3>
                        <p className="text-sm text-slate-500 text-center mt-2">
                            Are you sure you want to delete <span className="font-semibold text-slate-700">"{deletingTask.title}"</span>? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setDeletingTask(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
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
