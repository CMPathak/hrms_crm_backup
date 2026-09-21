import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import MetricCards from '@/Components/MetricCards';
import {
    FolderPlus,
    Search,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    X,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Building,
    Mail,
    Phone,
    MapPin,
    Tag,
    Globe,
    Key,
    Shield,
    FileText,
    Share2,
    Lock,
    RotateCw,
    Users,
    Plus,
    Trash2,
    Edit,
    RotateCcw,
    SlidersHorizontal,
    Check,
    Download,
    Upload
} from 'lucide-react';

export default function Index({
    projects,
    metrics,
    currentFilter = 'all',
    customers = [],
    users = [],
    filters = {}
}) {
    const { flash, auth } = usePage().props;
    const currentUser = auth?.user;
    const roleName = (currentUser?.role?.role_name || '').toLowerCase();
    const roleId = Number(currentUser?.role_id || 0);
    const isAdmin =
        roleName === 'super_admin' ||
        roleName === 'admin' ||
        roleId === 1 ||
        roleId === 2 ||
        currentUser?.id === 1;

    const isSales = roleName === 'sales' || roleName === 'sales_manager';
    const canCreateProject = isAdmin || isSales;

    // Filter states from props / URL
    const [search, setSearch] = useState(filters.search || '');
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('projects.import'), formData, {
            onSuccess: () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [serviceFilter, setServiceFilter] = useState(filters.service || '');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || '');
    const [teamFilter, setTeamFilter] = useState(filters.team || '');
    const [perPage, setPerPage] = useState(5);

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [statusProject, setStatusProject] = useState(null);
    const [assignmentProject, setAssignmentProject] = useState(null);
    const [taskProject, setTaskProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);

    // Double scroll refs and synchronization
    const tableWrapperRef = useRef(null);
    const topScrollRef = useRef(null);
    const [tableScrollWidth, setTableScrollWidth] = useState(0);

    useEffect(() => {
        const updateScrollWidth = () => {
            if (tableWrapperRef.current) {
                setTableScrollWidth(tableWrapperRef.current.scrollWidth);
            }
        };
        updateScrollWidth();
        const timer = setTimeout(updateScrollWidth, 150);
        window.addEventListener('resize', updateScrollWidth);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScrollWidth);
        };
    }, [projects]);

    const handleTopScroll = () => {
        if (topScrollRef.current && tableWrapperRef.current) {
            tableWrapperRef.current.scrollLeft = topScrollRef.current.scrollLeft;
        }
    };

    const handleTableScroll = () => {
        if (topScrollRef.current && tableWrapperRef.current) {
            topScrollRef.current.scrollLeft = tableWrapperRef.current.scrollLeft;
        }
    };

    // Apply Filters helper
    const applyFilters = (newFilters = {}) => {
        const query = {
            search,
            status: statusFilter,
            service: serviceFilter,
            priority: priorityFilter,
            team: teamFilter,
            per_page: perPage,
            ...newFilters,
        };

        Object.keys(query).forEach((key) => {
            if (!query[key] || query[key] === 'all') delete query[key];
        });

        router.get(route('projects.index'), query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setServiceFilter('');
        setPriorityFilter('');
        setTeamFilter('');
        setPerPage(50);
        router.get(route('projects.index'), {}, { preserveState: true, replace: true });
    };

    // 1. Create Project Form
    const createForm = useForm({
        client_name: '',
        company_name: '',
        email: '',
        contact_person: '',
        mobile: '',
        business_category: '',
        address: '',
        project_name: '',
        service_type: 'Website Development',
        package: 'Standard',
        package_tier: 'Standard',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Active',
        payment_info: '',
        developer: '',
        seo_person: '',
        sales_person_name: '',
        sales_person_email: '',
        package_lmh: '',
        domain_name: '',
        renewal_date: '',
        gmb_access_desc: '',
        banner_reel: '',
        dvc: '',
        analytics_webmaster_email: '',
        total_keyword: '',
        approved_keywords: '',
        first_page: '',
        report_send: '',
        total_report: '',
        adword_sponser: '',
        product_details: '',
        ftp_login_details: '',
        social_media_login: '',
        issue_comment: '',
        description: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('projects.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    // 2. Edit Project Form
    const editForm = useForm({
        client_name: '',
        company_name: '',
        email: '',
        contact_person: '',
        mobile: '',
        business_category: '',
        address: '',
        project_name: '',
        service_type: '',
        package: '',
        start_date: '',
        due_date: '',
        status: '',
        priority: 'Medium',
        payment_info: '',
        developer: '',
        seo_person: '',
        sales_person_name: '',
        sales_person_email: '',
        package_lmh: '',
        domain_name: '',
        renewal_date: '',
        gmb_access_desc: '',
        banner_reel: '',
        dvc: '',
        analytics_webmaster_email: '',
        total_keyword: '',
        approved_keywords: '',
        first_page: '',
        report_send: '',
        total_report: '',
        adword_sponser: '',
        product_details: '',
        ftp_login_details: '',
        social_media_login: '',
        issue_comment: '',
        description: '',
        include_logo_registration: false,
    });

    const handleOpenEdit = (p) => {
        setEditingProject(p);
        editForm.setData({
            client_name: p.customer?.client_name || '',
            company_name: p.customer?.company_name || '',
            email: p.customer?.email || '',
            contact_person: p.customer?.contact_person || '',
            mobile: p.customer?.mobile || '',
            business_category: p.customer?.business_category || '',
            address: p.customer?.address || '',
            project_name: p.project_name || '',
            service_type: p.service_type || 'Website Development',
            package: p.package || 'Standard',
            start_date: p.start_date ? p.start_date.split('T')[0] : '',
            due_date: p.due_date ? p.due_date.split('T')[0] : '',
            status: p.status || 'Active',
            priority: p.priority || 'Medium',
            payment_info: p.payment_info || '',
            developer: p.developer || p.assignment?.developer?.name || '',
            seo_person: p.seo_person || p.assignment?.seo_executive?.name || '',
            sales_person_name: p.sales_person_name || '',
            sales_person_email: p.sales_person_email || '',
            package_lmh: p.package_lmh || '',
            domain_name: p.domain_name || p.domain_hosting?.domain_name || '',
            renewal_date: p.renewal_date || p.domain_hosting?.renewal_date || '',
            gmb_access_desc: p.gmb_access_desc || '',
            banner_reel: p.banner_reel || '',
            dvc: p.dvc || '',
            analytics_webmaster_email: p.analytics_webmaster_email || '',
            total_keyword: p.total_keyword || '',
            approved_keywords: p.approved_keywords || '',
            first_page: p.first_page || '',
            report_send: p.report_send || '',
            total_report: p.total_report || '',
            adword_sponser: p.adword_sponser || '',
            product_details: p.product_details || '',
            ftp_login_details: p.ftp_login_details || '',
            social_media_login: p.social_media_login || '',
            issue_comment: p.issue_comment || p.comments || '',
            description: p.description || '',
            include_logo_registration: !!p.logo_registration,
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingProject) return;
        editForm.put(route('projects.update', editingProject.id), {
            preserveScroll: true,
            onSuccess: () => setEditingProject(null),
        });
    };

    // 3. Status Form
    const statusForm = useForm({
        status: 'Active',
        workflow_stage: 'Project Created',
    });

    const handleOpenStatus = (p) => {
        setStatusProject(p);
        statusForm.setData({
            status: p.status || 'Active',
            workflow_stage: p.workflow_stage || 'In Progress',
        });
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        if (!statusProject) return;
        statusForm.patch(route('projects.updateStatus', statusProject.id), {
            preserveScroll: true,
            onSuccess: () => setStatusProject(null),
        });
    };

    // 4. Assignment Form
    const assignmentForm = useForm({
        developer_id: '',
        designer_id: '',
        seo_executive_id: '',
        dev_status: 'Assigned',
        dev_completion_pct: 0,
    });

    const handleOpenAssignment = (p) => {
        setAssignmentProject(p);
        assignmentForm.setData({
            developer_id: p.assignment?.developer_id || '',
            designer_id: p.assignment?.designer_id || '',
            seo_executive_id: p.assignment?.seo_executive_id || '',
            dev_status: p.assignment?.dev_status || 'Assigned',
            dev_completion_pct: p.assignment?.dev_completion_pct || 0,
        });
    };

    const handleAssignmentSubmit = (e) => {
        e.preventDefault();
        if (!assignmentProject) return;
        assignmentForm.post(route('projects.updateAssignment', assignmentProject.id), {
            preserveScroll: true,
            onSuccess: () => setAssignmentProject(null),
        });
    };

    // 5. Add Task for Project Form
    const taskForm = useForm({
        project_id: '',
        title: '',
        assigned_to: auth?.user?.id || '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Pending',
        description: '',
    });

    const handleOpenAddTask = (p) => {
        setTaskProject(p);
        taskForm.setData({
            project_id: p.id,
            title: '',
            assigned_to: auth?.user?.id || '',
            due_date: new Date().toISOString().split('T')[0],
            priority: 'Medium',
            status: 'Pending',
            description: `Task for project: ${p.project_name}`,
        });
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        taskForm.post(route('tasks.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setTaskProject(null);
                taskForm.reset();
            },
        });
    };

    // 6. Delete Project
    const handleDeleteProject = () => {
        if (!deletingProject) return;
        router.delete(route('projects.destroy', deletingProject.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingProject(null),
        });
    };

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

    return (
        <HmsLayout header="Project Management">
            <Head title="Projects - HMS Agency ERP" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium">{flash.success}</span>
                </div>
            )}

            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Project Management Board
                    </h1>
                </div>

                {canCreateProject && (
                    <div className="flex items-center gap-3">
                        <a
                            href={route('projects.export')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </a>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleImportClick}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                            Import
                        </button>

                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                            <FolderPlus className="w-4 h-4" />
                            Create Project
                        </button>
                    </div>
                )}
            </div>

            {/* Metric Cards */}
            <MetricCards metrics={metrics} currentFilter={currentFilter} />

            {/* FILTER & SEARCH BAR TOOLBAR (Matching Reference Image 1) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 space-y-3">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                    {/* Row 1: Search & Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search projects, clients, IDs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                            />
                        </div>

                        {/* All Statuses */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">In Progress / Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Testing">Testing</option>
                            <option value="Client Approval">Client Approval</option>
                            <option value="Completed">Completed</option>
                            <option value="Hold">On Hold</option>
                            <option value="Closed">Closed</option>
                        </select>

                        {/* All Services */}
                        <select
                            value={serviceFilter}
                            onChange={(e) => {
                                setServiceFilter(e.target.value);
                                applyFilters({ service: e.target.value });
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                        >
                            <option value="">All Services</option>
                            <option value="Website Development">Website Development</option>
                            <option value="SEO Optimization">SEO Optimization</option>
                            <option value="Google Ads Campaign">Google Ads Campaign</option>
                            <option value="Branding & UI Design">Branding & UI Design</option>
                            <option value="Full Retainer Package">Full Retainer Package</option>
                        </select>

                        {/* All Priorities */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                applyFilters({ priority: e.target.value });
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                        >
                            <option value="">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        {/* All Team Members */}
                        <select
                            value={teamFilter}
                            onChange={(e) => {
                                setTeamFilter(e.target.value);
                                applyFilters({ team: e.target.value });
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                        >
                            <option value="">All Team Members</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.name}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Row 2: Reset Filters */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* PROJECTS TABLE (31 Columns Matching hmsN with Horizontal Scrolling) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden mb-6">
                {/* TOP PAGINATION */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-600 bg-slate-50/50">
                    <div>
                        Showing {projects?.from ?? 0} to {projects?.to ?? 0} of {projects?.total ?? 0} entries
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(e.target.value);
                                    applyFilters({ per_page: e.target.value });
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
                                <option value="2000">Show All Entries</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link
                                href={projects?.prev_page_url || '#'}
                                preserveScroll
                                className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                            <Link
                                href={projects?.next_page_url || '#'}
                                preserveScroll
                                className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div
                    ref={tableWrapperRef}
                    onScroll={handleTableScroll}
                    className="overflow-x-auto relative"
                >
                    <table className="w-full text-left text-xs border-collapse min-w-[4200px]">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="py-2 px-4 min-w-[130px]">Table ID</th>
                                <th className="py-2 px-4 min-w-[200px]">Client Name</th>
                                <th className="py-2 px-4 min-w-[220px]">Company Name</th>
                                <th className="py-2 px-4 min-w-[220px]">Customer Email</th>
                                <th className="py-2 px-4 min-w-[180px]">Contact Person</th>
                                <th className="py-2 px-4 min-w-[170px]">Phone Number</th>
                                <th className="py-2 px-4 min-w-[170px]">Business Category</th>
                                <th className="py-2 px-4 min-w-[240px]">Address</th>
                                <th className="py-2 px-4 min-w-[220px]">Project Name</th>

                                <th className="py-2 px-4 min-w-[120px]">Start Date</th>
                                <th className="py-2 px-4 min-w-[120px]">Due Date</th>
                                <th className="py-2 px-4 min-w-[150px]">Payment Info</th>
                                <th className="py-2 px-4 min-w-[170px]">Developer</th>
                                <th className="py-2 px-4 min-w-[170px]">SEO Person</th>
                                <th className="py-2 px-4 min-w-[190px]">Domain Name</th>
                                <th className="py-2 px-4 min-w-[140px]">Renewal Date</th>
                                <th className="py-2 px-4 min-w-[180px]">Sales Person</th>
                                <th className="py-2 px-4 min-w-[200px]">Sales Person Email</th>
                                <th className="py-2 px-4 min-w-[140px]">Package LMH</th>
                                <th className="py-2 px-4 min-w-[140px]">Status Details</th>
                                <th className="py-2 px-4 min-w-[200px]">Banner & Reel & DVC</th>
                                <th className="py-2 px-4 min-w-[150px]">GMB Access</th>
                                <th className="py-2 px-4 min-w-[200px]">Total Number of Keywords</th>
                                <th className="py-2 px-4 min-w-[260px]">Approved Keywords</th>
                                <th className="py-2 px-4 min-w-[140px]">First page</th>
                                <th className="py-2 px-4 min-w-[140px]">Report Send</th>
                                <th className="py-2 px-4 min-w-[140px]">Total Report</th>
                                <th className="py-2 px-4 min-w-[180px]">Adword and Sponser</th>
                                <th className="py-2 px-4 min-w-[260px]">Google Analytics / Webmaster Email Id</th>
                                <th className="py-2 px-4 min-w-[240px]">Product Details</th>
                                <th className="py-2 px-4 min-w-[240px]">FTP/ Login Details</th>
                                <th className="py-2 px-4 min-w-[240px]">Social Media Login</th>
                                <th className="py-2 px-4 min-w-[260px]">Issue & Comment</th>
                                <th className="py-2 px-4 text-center min-w-[220px] sticky right-0 bg-slate-50 border-l border-slate-200 shadow-[-4px_0_12px_rgba(0,0,0,0.06)] z-20">
                                    <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                        <span className="text-slate-400 text-[10px]">♦</span>
                                        <span>Actions</span>
                                        <span className="text-slate-400 text-[10px]">♦</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(projects?.data || []).length === 0 ? (
                                <tr>
                                    <td colSpan="36" className="py-12 text-center text-slate-400 text-sm">
                                        No matching projects found.
                                    </td>
                                </tr>
                            ) : (
                                projects.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                        {/* 1. Table ID */}
                                        <td className="py-1.5 px-4 whitespace-nowrap">
                                            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                {p.custom_project_id || `PRJ-${p.id}`}
                                            </span>
                                        </td>

                                        {/* 2. Client Name */}
                                        <td className="py-1.5 px-4 font-bold text-slate-900">
                                            {p.customer?.client_name || '-'}
                                        </td>

                                        {/* 3. Company Name */}
                                        <td className="py-1.5 px-4 font-semibold text-slate-800">
                                            {p.customer?.company_name || '-'}
                                        </td>

                                        {/* 4. Customer Email */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.customer?.email ? (
                                                <a href={`mailto:${p.customer.email}`} className="text-indigo-600 hover:underline">
                                                    {p.customer.email}
                                                </a>
                                            ) : '-'}
                                        </td>

                                        {/* 5. Contact Person */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.customer?.contact_person || '-'}
                                        </td>

                                        {/* 6. Phone Number */}
                                        <td className="py-1.5 px-4 text-slate-700 whitespace-nowrap">
                                            {p.customer?.mobile ? (
                                                <a href={`tel:${p.customer.mobile}`} className="text-indigo-600 hover:underline">
                                                    {p.customer.mobile}
                                                </a>
                                            ) : '-'}
                                        </td>

                                        {/* 7. Business Category */}
                                        <td className="py-1.5 px-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                                                {p.customer?.business_category || '-'}
                                            </span>
                                        </td>

                                        {/* 8. Address */}
                                        <td className="py-1.5 px-4 text-slate-600 max-w-[240px] truncate" title={p.customer?.address || ''}>
                                            {p.customer?.address || '-'}
                                        </td>

                                        {/* 9. Project Name */}
                                        <td className="py-1.5 px-4 font-semibold text-slate-800">
                                            {p.project_name || '-'}
                                        </td>



                                        {/* 12. Start Date */}
                                        <td className="py-1.5 px-4 whitespace-nowrap text-slate-700">
                                            {p.start_date ? p.start_date.split('T')[0] : '-'}
                                        </td>

                                        {/* 13. Due Date */}
                                        <td className="py-1.5 px-4 whitespace-nowrap text-slate-700">
                                            {p.due_date ? p.due_date.split('T')[0] : '-'}
                                        </td>

                                        {/* 14. Payment Info */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.payment_info || '-'}
                                        </td>

                                        {/* 15. Developer */}
                                        <td className="py-1.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                            {p.developer || p.assignment?.developer?.name || (
                                                <span className="text-slate-400 italic font-normal">Unassigned</span>
                                            )}
                                        </td>

                                        {/* 16. SEO Person */}
                                        <td className="py-1.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                            {p.seo_person || p.assignment?.seo_executive?.name || (
                                                <span className="text-slate-400 italic font-normal">Unassigned</span>
                                            )}
                                        </td>

                                        {/* 17. Domain Name */}
                                        <td className="py-1.5 px-4 whitespace-nowrap">
                                            {(p.domain_name || p.domain_hosting?.domain_name) ? (
                                                <a
                                                    href={`http://${p.domain_name || p.domain_hosting?.domain_name}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                                                >
                                                    {p.domain_name || p.domain_hosting?.domain_name}
                                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">None</span>
                                            )}
                                        </td>

                                        {/* 18. Renewal Date */}
                                        <td className="py-1.5 px-4 whitespace-nowrap">
                                            {(p.renewal_date || p.domain_hosting?.renewal_date) ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                                    <Calendar className="w-3 h-3 text-indigo-500" />
                                                    {p.renewal_date || p.domain_hosting?.renewal_date}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>

                                        {/* 19. Sales Person */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.sales_person_name || '-'}
                                        </td>

                                        {/* 20. Sales Person Email */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.sales_person_email ? (
                                                <a href={`mailto:${p.sales_person_email}`} className="text-indigo-600 hover:underline">
                                                    {p.sales_person_email}
                                                </a>
                                            ) : '-'}
                                        </td>

                                        {/* 21. Package LMH */}
                                        <td className="py-1.5 px-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                                                {p.package_lmh || '-'}
                                            </span>
                                        </td>

                                        {/* 22. Status Details */}
                                        <td className="py-1.5 px-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(
                                                    p.status
                                                )}`}
                                            >
                                                {p.status || 'Active'}
                                            </span>
                                        </td>

                                        {/* 23. Banner & Reel & DVC */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {((p.banner_reel || '') + ' ' + (p.dvc || '')).trim() || '-'}
                                        </td>

                                        {/* 24. GMB Access */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.gmb_access_desc || '-'}
                                        </td>

                                        {/* 25. Total Number of Keywords */}
                                        <td className="py-1.5 px-4 text-slate-700 font-semibold">
                                            {p.total_keyword || '-'}
                                        </td>

                                        {/* 26. Approved Keywords (Scrollable) */}
                                        <td className="py-1.5 px-4">
                                            {p.approved_keywords ? (
                                                <div className="max-h-20 overflow-y-auto p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {p.approved_keywords}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>

                                        {/* 27. First page */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.first_page || '-'}
                                        </td>

                                        {/* 28. Report Send */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.report_send || '-'}
                                        </td>

                                        {/* 29. Total Report */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.total_report || '-'}
                                        </td>

                                        {/* 30. Adword and Sponser */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.adword_sponser || '-'}
                                        </td>

                                        {/* 31. Google Analytics / Webmaster Email Id */}
                                        <td className="py-1.5 px-4 text-slate-700">
                                            {p.analytics_webmaster_email || '-'}
                                        </td>

                                        {/* 32. Product Details */}
                                        <td className="py-1.5 px-4">
                                            {p.product_details ? (
                                                <div className="max-h-20 overflow-y-auto p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {p.product_details}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>

                                        {/* 33. FTP/ Login Details */}
                                        <td className="py-1.5 px-4">
                                            {p.ftp_login_details ? (
                                                <div className="max-h-20 overflow-y-auto p-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {p.ftp_login_details}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>

                                        {/* 34. Social Media Login */}
                                        <td className="py-1.5 px-4">
                                            {p.social_media_login ? (
                                                <div className="max-h-20 overflow-y-auto p-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {p.social_media_login}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>

                                        {/* 35. Issue & Comment (Scrollable) */}
                                        <td className="py-1.5 px-4">
                                            {(p.issue_comment || p.comments) ? (
                                                <div className="max-h-20 overflow-y-auto p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {p.issue_comment || p.comments}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>

                                        {/* 31. ACTIONS (5 Buttons Matching Image 2, Sticky Right) */}
                                        <td className="py-2 px-4 text-center whitespace-nowrap sticky right-0 bg-white/95 backdrop-blur-xs border-l border-slate-200 shadow-[-4px_0_12px_rgba(0,0,0,0.06)] z-10">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* 1. Yellow/Amber Edit Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(p)}
                                                    className="w-8 h-8 rounded-lg border border-amber-400 text-amber-500 bg-amber-50/40 hover:bg-amber-100/70 flex items-center justify-center transition-colors cursor-pointer"
                                                    title="Edit Project Details"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                {/* 2. Cyan/Sky Update Status Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenStatus(p)}
                                                    className="w-8 h-8 rounded-lg border border-cyan-400 text-cyan-500 bg-cyan-50/40 hover:bg-cyan-100/70 flex items-center justify-center transition-colors cursor-pointer"
                                                    title="Update Status & Workflow Stage"
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>

                                                {/* 3. Dark/Black Manage Team Assignments - Admin Only */}
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAssignment(p)}
                                                        className="w-8 h-8 rounded-lg border border-slate-800 text-slate-800 bg-slate-100/60 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Manage Department Assignments"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* 4. Blue Add Task Button - Admin Only */}
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAddTask(p)}
                                                        className="w-8 h-8 rounded-lg border border-blue-500 text-blue-600 bg-blue-50/40 hover:bg-blue-100/70 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Add Task for this Project"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* 5. Red Delete Project Button - Admin Only */}
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingProject(p)}
                                                        className="w-8 h-8 rounded-lg border border-rose-400 text-rose-500 bg-rose-50/40 hover:bg-rose-100/70 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Delete Project Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION (Dynamic per-page and page links) */}
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
                                    applyFilters({ per_page: e.target.value });
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
                                <option value="2000">Show All Entries</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link
                                href={projects?.prev_page_url || '#'}
                                preserveScroll
                                className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.prev_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                            <Link
                                href={projects?.next_page_url || '#'}
                                preserveScroll
                                className={`px-2 py-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${projects?.next_page_url ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>


            {/* MODAL 1: CREATE PROJECT (Comprehensive 34 Fields) */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-indigo-600 text-white rounded-t-2xl">
                            <div className="flex items-center gap-2.5">
                                <FolderPlus className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Create New Project</h3>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Section 1: Customer Information */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4" /> 1. Client & Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                                        <input
                                            type="text"
                                            value={createForm.data.client_name}
                                            onChange={(e) => createForm.setData('client_name', e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.company_name}
                                            onChange={(e) => createForm.setData('company_name', e.target.value)}
                                            placeholder="e.g. Acme Corporation"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Email</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="client@acme.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                                        <input
                                            type="text"
                                            value={createForm.data.contact_person}
                                            onChange={(e) => createForm.setData('contact_person', e.target.value)}
                                            placeholder="Contact Person"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={createForm.data.mobile}
                                            onChange={(e) => createForm.setData('mobile', e.target.value)}
                                            placeholder="e.g. 9876543210"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category</label>
                                        <input
                                            type="text"
                                            value={createForm.data.business_category}
                                            onChange={(e) => createForm.setData('business_category', e.target.value)}
                                            placeholder="e.g. E-Commerce"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                                        <textarea
                                            rows="2"
                                            value={createForm.data.address}
                                            onChange={(e) => createForm.setData('address', e.target.value)}
                                            placeholder="Full Address..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Project Scope & Dates */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> 2. Project Scope & Timeline
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.project_name}
                                            onChange={(e) => createForm.setData('project_name', e.target.value)}
                                            placeholder="e.g. E-Commerce Web Portal"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    {/* 
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                                        <select
                                            value={createForm.data.service_type}
                                            onChange={(e) => createForm.setData('service_type', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        >
                                            <option value="Website Development">Website Development</option>
                                            <option value="SEO Optimization">SEO Optimization</option>
                                            <option value="Google Ads Campaign">Google Ads Campaign</option>
                                            <option value="Branding & UI Design">Branding & UI Design</option>
                                            <option value="Full Retainer Package">Full Retainer Package</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Package Tier</label>
                                        <input
                                            type="text"
                                            value={createForm.data.package}
                                            onChange={(e) => createForm.setData('package', e.target.value)}
                                            placeholder="e.g. Standard"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div> 
                                    */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date <span className="text-rose-500">*</span></label>
                                        <input
                                            type="date"
                                            required
                                            value={createForm.data.start_date}
                                            onChange={(e) => createForm.setData('start_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date <span className="text-rose-500">*</span></label>
                                        <input
                                            type="date"
                                            required
                                            value={createForm.data.due_date}
                                            onChange={(e) => createForm.setData('due_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status Details</label>
                                        <select
                                            value={createForm.data.status}
                                            onChange={(e) => createForm.setData('status', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Active">Active / In Progress</option>
                                            <option value="Testing">Testing</option>
                                            <option value="Client Approval">Client Approval</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Hold">On Hold</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                                        <select
                                            value={createForm.data.priority}
                                            onChange={(e) => createForm.setData('priority', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Info</label>
                                        <input
                                            type="text"
                                            value={createForm.data.payment_info}
                                            onChange={(e) => createForm.setData('payment_info', e.target.value)}
                                            placeholder="e.g. Paid / Monthly"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Team Assignments & Sales */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> 3. Department Assignments & Sales
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Developer</label>
                                        <input
                                            type="text"
                                            list="projDevList"
                                            value={createForm.data.developer}
                                            onChange={(e) => createForm.setData('developer', e.target.value)}
                                            placeholder="Select Developer"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                        <datalist id="projDevList">
                                            {users.map((u) => <option key={u.id} value={u.name} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Person</label>
                                        <input
                                            type="text"
                                            list="projSeoList"
                                            value={createForm.data.seo_person}
                                            onChange={(e) => createForm.setData('seo_person', e.target.value)}
                                            placeholder="Select SEO Executive"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                        <datalist id="projSeoList">
                                            {users.map((u) => <option key={u.id} value={u.name} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Person</label>
                                        <input
                                            type="text"
                                            value={createForm.data.sales_person_name}
                                            onChange={(e) => createForm.setData('sales_person_name', e.target.value)}
                                            placeholder="Sales Person Name"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Person Email</label>
                                        <input
                                            type="email"
                                            value={createForm.data.sales_person_email}
                                            onChange={(e) => createForm.setData('sales_person_email', e.target.value)}
                                            placeholder="sales@company.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Package LMH</label>
                                        <input
                                            type="text"
                                            value={createForm.data.package_lmh}
                                            onChange={(e) => createForm.setData('package_lmh', e.target.value)}
                                            placeholder="e.g. LVC / MVC / HVC"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Domain, GMB & Technical Assets */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> 4. Domain, GMB & Media Assets
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Domain Name</label>
                                        <input
                                            type="text"
                                            value={createForm.data.domain_name}
                                            onChange={(e) => createForm.setData('domain_name', e.target.value)}
                                            placeholder="e.g. acmebrand.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Date</label>
                                        <input
                                            type="date"
                                            value={createForm.data.renewal_date}
                                            onChange={(e) => createForm.setData('renewal_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">GMB Access</label>
                                        <input
                                            type="text"
                                            value={createForm.data.gmb_access_desc}
                                            onChange={(e) => createForm.setData('gmb_access_desc', e.target.value)}
                                            placeholder="e.g. Done / Pending"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Banner & Reel</label>
                                        <input
                                            type="text"
                                            value={createForm.data.banner_reel}
                                            onChange={(e) => createForm.setData('banner_reel', e.target.value)}
                                            placeholder="e.g. 5 Banners"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">DVC</label>
                                        <input
                                            type="text"
                                            value={createForm.data.dvc}
                                            onChange={(e) => createForm.setData('dvc', e.target.value)}
                                            placeholder="e.g. Completed"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Google Analytics / Webmaster Email</label>
                                        <input
                                            type="email"
                                            value={createForm.data.analytics_webmaster_email}
                                            onChange={(e) => createForm.setData('analytics_webmaster_email', e.target.value)}
                                            placeholder="analytics@client.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Design Status</label>
                                        <input
                                            type="text"
                                            value={createForm.data.design_status || ''}
                                            onChange={(e) => createForm.setData('design_status', e.target.value)}
                                            placeholder="e.g. In Progress"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            id="include_logo_registration"
                                            checked={createForm.data.include_logo_registration}
                                            onChange={(e) => createForm.setData('include_logo_registration', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                        />
                                        <label htmlFor="include_logo_registration" className="ml-2 block text-sm font-medium text-slate-700">
                                            Include Logo Registration
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: SEO Deliverables */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Key className="w-4 h-4" /> 5. SEO Deliverables & Reports
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Number of Keywords</label>
                                        <input
                                            type="text"
                                            value={createForm.data.total_keyword}
                                            onChange={(e) => createForm.setData('total_keyword', e.target.value)}
                                            placeholder="e.g. 20"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">First page</label>
                                        <input
                                            type="text"
                                            value={createForm.data.first_page}
                                            onChange={(e) => createForm.setData('first_page', e.target.value)}
                                            placeholder="e.g. 5 Keywords"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Report Send</label>
                                        <input
                                            type="text"
                                            value={createForm.data.report_send}
                                            onChange={(e) => createForm.setData('report_send', e.target.value)}
                                            placeholder="e.g. Weekly"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Report</label>
                                        <input
                                            type="text"
                                            value={createForm.data.total_report}
                                            onChange={(e) => createForm.setData('total_report', e.target.value)}
                                            placeholder="e.g. 4"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Adword and Sponser</label>
                                        <input
                                            type="text"
                                            value={createForm.data.adword_sponser}
                                            onChange={(e) => createForm.setData('adword_sponser', e.target.value)}
                                            placeholder="Campaign details"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    {/* Approved Keywords WITH SCROLL */}
                                    <div className="md:col-span-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Approved Keywords <span className="text-slate-400 font-normal">(Scrollable)</span>
                                            </label>
                                            <span className="text-[11px] text-slate-400">Add keywords separated by lines or commas</span>
                                        </div>
                                        <textarea
                                            rows="3"
                                            value={createForm.data.approved_keywords}
                                            onChange={(e) => createForm.setData('approved_keywords', e.target.value)}
                                            placeholder="1. Best Dental Clinic&#10;2. Top Cosmetic Dentist..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-32 min-h-[85px] focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 6: Logins, Details & Issue Comment */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> 6. Logins & Notes
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Product Details <span className="text-slate-400 font-normal">(Scrollable)</span>
                                            </label>
                                        </div>
                                        <textarea
                                            rows="2"
                                            value={createForm.data.product_details}
                                            onChange={(e) => createForm.setData('product_details', e.target.value)}
                                            placeholder="e.g. Web Development + 1 Year SEO"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-32 min-h-[85px] focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">FTP / Server Login Details</label>
                                            <textarea
                                                rows="3"
                                                value={createForm.data.ftp_login_details}
                                                onChange={(e) => createForm.setData('ftp_login_details', e.target.value)}
                                                placeholder="Host, User, Pass, Port..."
                                                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Social Media Login</label>
                                            <textarea
                                                rows="3"
                                                value={createForm.data.social_media_login}
                                                onChange={(e) => createForm.setData('social_media_login', e.target.value)}
                                                placeholder="Facebook, Instagram logins..."
                                                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Issue & Comment WITH SCROLL */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Issue & Comment <span className="text-slate-400 font-normal">(Scrollable)</span>
                                            </label>
                                            <span className="text-[11px] text-slate-400">Client remarks, pending changes, or notes</span>
                                        </div>
                                        <textarea
                                            rows="4"
                                            value={createForm.data.issue_comment}
                                            onChange={(e) => createForm.setData('issue_comment', e.target.value)}
                                            placeholder="Write issues & comments here..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-36 min-h-[95px] focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

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
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {createForm.processing ? 'Creating Project...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT PROJECT */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-500 text-white rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Edit className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Edit Project: {editingProject.project_name}</h3>
                            </div>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Section 1: Customer Information */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4" /> 1. Client & Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                                        <input
                                            type="text"
                                            value={editForm.data.client_name}
                                            onChange={(e) => editForm.setData('client_name', e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.data.company_name}
                                            onChange={(e) => editForm.setData('company_name', e.target.value)}
                                            placeholder="e.g. Acme Corp"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Email</label>
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            placeholder="client@company.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                                        <input
                                            type="text"
                                            value={editForm.data.contact_person}
                                            onChange={(e) => editForm.setData('contact_person', e.target.value)}
                                            placeholder="Manager name"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={editForm.data.mobile}
                                            onChange={(e) => editForm.setData('mobile', e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category</label>
                                        <input
                                            type="text"
                                            value={editForm.data.business_category}
                                            onChange={(e) => editForm.setData('business_category', e.target.value)}
                                            placeholder="e.g. Healthcare, IT, Retail"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={editForm.data.address}
                                            onChange={(e) => editForm.setData('address', e.target.value)}
                                            placeholder="Full business or office address"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Project Milestones & Package */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> 2. Project Deliverables & Timeline
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2 md:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.data.project_name}
                                            onChange={(e) => editForm.setData('project_name', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    {/* 
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                                        <select
                                            value={editForm.data.service_type}
                                            onChange={(e) => editForm.setData('service_type', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        >
                                            <option value="Website Development">Website Development</option>
                                            <option value="SEO Optimization">SEO Optimization</option>
                                            <option value="Google Ads Campaign">Google Ads Campaign</option>
                                            <option value="Branding & UI Design">Branding & UI Design</option>
                                            <option value="Full Retainer Package">Full Retainer Package</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Package Tier</label>
                                        <input
                                            type="text"
                                            value={editForm.data.package}
                                            onChange={(e) => editForm.setData('package', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div> 
                                    */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                                        <select
                                            value={editForm.data.status}
                                            onChange={(e) => editForm.setData('status', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Active">Active / In Progress</option>
                                            <option value="Testing">Testing</option>
                                            <option value="Client Approval">Client Approval</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Hold">On Hold</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                                        <select
                                            value={editForm.data.priority}
                                            onChange={(e) => editForm.setData('priority', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={editForm.data.start_date}
                                            onChange={(e) => editForm.setData('start_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={editForm.data.due_date}
                                            onChange={(e) => editForm.setData('due_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Info</label>
                                        <input
                                            type="text"
                                            value={editForm.data.payment_info}
                                            onChange={(e) => editForm.setData('payment_info', e.target.value)}
                                            placeholder="Advance paid, remaining balance terms..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Staff & Team Assignments */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> 3. Department & Staff Assignments
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Developer</label>
                                        <input
                                            type="text"
                                            list="editDevList"
                                            value={editForm.data.developer}
                                            onChange={(e) => editForm.setData('developer', e.target.value)}
                                            placeholder="Select or enter developer"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                        <datalist id="editDevList">
                                            {users.map((u) => <option key={u.id} value={u.name} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Person</label>
                                        <input
                                            type="text"
                                            list="editSeoList"
                                            value={editForm.data.seo_person}
                                            onChange={(e) => editForm.setData('seo_person', e.target.value)}
                                            placeholder="Select or enter SEO person"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                        <datalist id="editSeoList">
                                            {users.map((u) => <option key={u.id} value={u.name} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Person</label>
                                        <input
                                            type="text"
                                            value={editForm.data.sales_person_name}
                                            onChange={(e) => editForm.setData('sales_person_name', e.target.value)}
                                            placeholder="Sales lead name"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Person Email</label>
                                        <input
                                            type="email"
                                            value={editForm.data.sales_person_email}
                                            onChange={(e) => editForm.setData('sales_person_email', e.target.value)}
                                            placeholder="sales@company.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Package LMH</label>
                                        <input
                                            type="text"
                                            value={editForm.data.package_lmh}
                                            onChange={(e) => editForm.setData('package_lmh', e.target.value)}
                                            placeholder="e.g. LVC / MVC / HVC"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Domain, GMB & Technical Assets */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> 4. Domain, GMB & Media Assets
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Domain Name</label>
                                        <input
                                            type="text"
                                            value={editForm.data.domain_name}
                                            onChange={(e) => editForm.setData('domain_name', e.target.value)}
                                            placeholder="e.g. acmebrand.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Date</label>
                                        <input
                                            type="date"
                                            value={editForm.data.renewal_date}
                                            onChange={(e) => editForm.setData('renewal_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">GMB Access</label>
                                        <input
                                            type="text"
                                            value={editForm.data.gmb_access_desc}
                                            onChange={(e) => editForm.setData('gmb_access_desc', e.target.value)}
                                            placeholder="e.g. Done / Pending"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Banner & Reel</label>
                                        <input
                                            type="text"
                                            value={editForm.data.banner_reel}
                                            onChange={(e) => editForm.setData('banner_reel', e.target.value)}
                                            placeholder="e.g. 5 Banners"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">DVC</label>
                                        <input
                                            type="text"
                                            value={editForm.data.dvc}
                                            onChange={(e) => editForm.setData('dvc', e.target.value)}
                                            placeholder="e.g. Completed"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Google Analytics / Webmaster Email</label>
                                        <input
                                            type="email"
                                            value={editForm.data.analytics_webmaster_email}
                                            onChange={(e) => editForm.setData('analytics_webmaster_email', e.target.value)}
                                            placeholder="analytics@client.com"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Design Status</label>
                                        <input
                                            type="text"
                                            value={editForm.data.design_status || ''}
                                            onChange={(e) => editForm.setData('design_status', e.target.value)}
                                            placeholder="e.g. In Progress"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            id="edit_include_logo_registration"
                                            checked={editForm.data.include_logo_registration}
                                            onChange={(e) => editForm.setData('include_logo_registration', e.target.checked)}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
                                        />
                                        <label htmlFor="edit_include_logo_registration" className="ml-2 block text-sm font-medium text-slate-700">
                                            Include Logo Registration
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: SEO Deliverables */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Key className="w-4 h-4" /> 5. SEO Deliverables & Reports
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Number of Keywords</label>
                                        <input
                                            type="text"
                                            value={editForm.data.total_keyword}
                                            onChange={(e) => editForm.setData('total_keyword', e.target.value)}
                                            placeholder="e.g. 20"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">First page</label>
                                        <input
                                            type="text"
                                            value={editForm.data.first_page}
                                            onChange={(e) => editForm.setData('first_page', e.target.value)}
                                            placeholder="e.g. 5 Keywords"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Report Send</label>
                                        <input
                                            type="text"
                                            value={editForm.data.report_send}
                                            onChange={(e) => editForm.setData('report_send', e.target.value)}
                                            placeholder="e.g. Weekly"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Report</label>
                                        <input
                                            type="text"
                                            value={editForm.data.total_report}
                                            onChange={(e) => editForm.setData('total_report', e.target.value)}
                                            placeholder="e.g. 4"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Adword and Sponser</label>
                                        <input
                                            type="text"
                                            value={editForm.data.adword_sponser}
                                            onChange={(e) => editForm.setData('adword_sponser', e.target.value)}
                                            placeholder="Campaign details"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>

                                    {/* Approved Keywords WITH SCROLL */}
                                    <div className="md:col-span-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Approved Keywords <span className="text-amber-600 font-normal">(Scrollable)</span>
                                            </label>
                                            <span className="text-[11px] text-slate-400">Add keywords separated by lines or commas</span>
                                        </div>
                                        <textarea
                                            rows="3"
                                            value={editForm.data.approved_keywords}
                                            onChange={(e) => editForm.setData('approved_keywords', e.target.value)}
                                            placeholder="1. Best Dental Clinic&#10;2. Top Cosmetic Dentist..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-32 min-h-[85px] focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 6: Logins, Details & Issue Comment */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> 6. Logins & Notes
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Product Details <span className="text-slate-400 font-normal">(Scrollable)</span>
                                            </label>
                                        </div>
                                        <textarea
                                            rows="2"
                                            value={editForm.data.product_details}
                                            onChange={(e) => editForm.setData('product_details', e.target.value)}
                                            placeholder="e.g. Web Development + 1 Year SEO"
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-32 min-h-[85px] focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">FTP / Server Login Details</label>
                                            <textarea
                                                rows="3"
                                                value={editForm.data.ftp_login_details}
                                                onChange={(e) => editForm.setData('ftp_login_details', e.target.value)}
                                                placeholder="Host, User, Pass, Port..."
                                                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Social Media Login</label>
                                            <textarea
                                                rows="3"
                                                value={editForm.data.social_media_login}
                                                onChange={(e) => editForm.setData('social_media_login', e.target.value)}
                                                placeholder="Facebook, Instagram logins..."
                                                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Issue & Comment WITH SCROLL */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Issue & Comment <span className="text-amber-600 font-normal">(Scrollable)</span>
                                            </label>
                                            <span className="text-[11px] text-slate-400">Add issues, client feedback, or notes</span>
                                        </div>
                                        <textarea
                                            rows="4"
                                            value={editForm.data.issue_comment}
                                            onChange={(e) => editForm.setData('issue_comment', e.target.value)}
                                            placeholder="Write issues & comments here..."
                                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-36 min-h-[95px] focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {editForm.processing ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: UPDATE STATUS & WORKFLOW STAGE */}
            {statusProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <RotateCw className="w-5 h-5 text-sky-600" />
                                <h3 className="font-bold text-slate-900">Update Status & Stage</h3>
                            </div>
                            <button onClick={() => setStatusProject(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleStatusSubmit} className="pt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
                                <select
                                    value={statusForm.data.status}
                                    onChange={(e) => statusForm.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="Active">Active / In Progress</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Testing">Testing</option>
                                    <option value="Client Approval">Client Approval</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Hold">On Hold</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Workflow Stage</label>
                                <select
                                    value={statusForm.data.workflow_stage}
                                    onChange={(e) => statusForm.setData('workflow_stage', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="Project Created">Project Created</option>
                                    <option value="Requirement Gathering">Requirement Gathering</option>
                                    <option value="UI/UX Design">UI/UX Design</option>
                                    <option value="Frontend Development">Frontend Development</option>
                                    <option value="Backend Integration">Backend Integration</option>
                                    <option value="SEO Audit & Setup">SEO Audit & Setup</option>
                                    <option value="Quality Assurance">Quality Assurance</option>
                                    <option value="Live Deployment">Live Deployment</option>
                                    <option value="Maintenance Retainer">Maintenance Retainer</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setStatusProject(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="px-5 py-2 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs"
                                >
                                    Update Status
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: MANAGE TEAM ASSIGNMENT */}
            {assignmentProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-800" />
                                <h3 className="font-bold text-slate-900">Manage Assignments: {assignmentProject.project_name}</h3>
                            </div>
                            <button onClick={() => setAssignmentProject(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAssignmentSubmit} className="pt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Developer</label>
                                <select
                                    value={assignmentForm.data.developer_id}
                                    onChange={(e) => assignmentForm.setData('developer_id', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="">-- Unassigned Developer --</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned SEO Executive</label>
                                <select
                                    value={assignmentForm.data.seo_executive_id}
                                    onChange={(e) => assignmentForm.setData('seo_executive_id', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="">-- Unassigned SEO --</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Development Status</label>
                                    <input
                                        type="text"
                                        value={assignmentForm.data.dev_status}
                                        onChange={(e) => assignmentForm.setData('dev_status', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Completion %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={assignmentForm.data.dev_completion_pct}
                                        onChange={(e) => assignmentForm.setData('dev_completion_pct', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAssignmentProject(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={assignmentForm.processing}
                                    className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                                >
                                    Save Assignments
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: ADD TASK FOR PROJECT */}
            {taskProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-900">Add Task: {taskProject.project_name}</h3>
                            </div>
                            <button onClick={() => setTaskProject(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleTaskSubmit} className="pt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Implement Responsive Header"
                                    value={taskForm.data.title}
                                    onChange={(e) => taskForm.setData('title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign To Employee *</label>
                                <select
                                    required
                                    value={taskForm.data.assigned_to}
                                    onChange={(e) => taskForm.setData('assigned_to', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="">-- Select Employee --</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={taskForm.data.due_date}
                                        onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={taskForm.data.priority}
                                        onChange={(e) => taskForm.setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Instructions</label>
                                <textarea
                                    rows="3"
                                    value={taskForm.data.description}
                                    onChange={(e) => taskForm.setData('description', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setTaskProject(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={taskForm.processing}
                                    className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                                >
                                    Assign Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 6: DELETE CONFIRMATION */}
            {deletingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Project</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Are you sure you want to permanently delete project <span className="font-bold text-slate-800">"{deletingProject.project_name}"</span> ({deletingProject.custom_project_id})?
                        </p>
                        <p className="text-xs text-rose-500 mt-1">This action cannot be undone.</p>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setDeletingProject(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteProject}
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
