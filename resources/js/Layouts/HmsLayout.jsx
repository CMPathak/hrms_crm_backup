import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Globe,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Shield,
    User as UserIcon,
    UserCog,
    Rocket,
    MessageSquare,
    Headset,
    Building2,
    Bell,
    Sparkles,
    Clock,
    AlertCircle,
    CheckCircle2,
    Activity
} from 'lucide-react';

export default function HmsLayout({ header, children }) {
    const { auth, renewal_alerts = [] } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projectsOpen, setProjectsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [topProjectsOpen, setTopProjectsOpen] = useState(false);

    // Live Notification state
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [totalNotificationsCount, setTotalNotificationsCount] = useState(0);

    // Poll notifications summary every 8 seconds
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get(route('notifications.summary'));
                if (res.data) {
                    setUnreadChatCount(res.data.unreadChatCount || 0);

                    let newNotifs = res.data.notifications || [];
                    let domainAlerts = renewal_alerts.map(p => ({
                        id: `renewal_${p.id}`,
                        type: 'domain',
                        title: `Renewal: ${p.name}`,
                        description: `Renews in ${p.days_left} days (${p.renewal_date})`,
                        time: 'Now',
                        link: route('domains.index')
                    }));

                    let combined = [...newNotifs, ...domainAlerts];

                    setTotalNotificationsCount((res.data.totalNotificationsCount || 0) + domainAlerts.length);
                    setNotifications(combined);
                }
            } catch (err) {
                // silent
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 8000);
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        try {
            await axios.post(route('notifications.markChatRead'));
            setUnreadChatCount(0);
            setTotalNotificationsCount(0);
            setNotifications([]);
        } catch (e) {
            // silent
        }
    };

    const roleName = (user?.role?.role_name || '').toLowerCase();
    const roleId = Number(user?.role_id || 0);
    const isAdmin =
        roleName === 'super_admin' ||
        roleName === 'admin' ||
        roleId === 1 ||
        roleId === 2 ||
        user?.id === 1;
    const isClient = roleName === 'client' || roleId === 10;

    const navItems = isClient
        ? [
            {
                name: 'My Client Portal',
                href: route('client-portal.index'),
                icon: Building2,
                active: route().current('client-portal.*'),
            },
            /* {
                name: 'Support Tickets',
                href: route('tickets.index'),
                icon: Headset,
                active: route().current('tickets.*'),
            }, */
        ]
        : [
            {
                name: 'Dashboard',
                href: route('dashboard'),
                icon: LayoutDashboard,
                active: route().current('dashboard'),
            },
            {
                name: 'Projects',
                icon: FolderKanban,
                active: route().current('projects.*'),
                hasSubmenu: true,
                isOpen: projectsOpen,
                toggle: () => setProjectsOpen(!projectsOpen),
                submenu: [
                    { name: 'All Projects', href: route('projects.index') },
                    { name: 'Active Projects', href: route('projects.index', { status: 'active' }) },
                    { name: 'Hold Projects', href: route('projects.index', { status: 'hold' }) },
                    { name: 'Completed Projects', href: route('projects.index', { status: 'completed' }) },
                    { name: 'Closed Projects', href: route('projects.index', { status: 'closed' }) },
                    { name: 'Pending Projects', href: route('projects.index', { status: 'pending' }) },
                ],
            },
            {
                name: 'Tasks',
                href: route('tasks.index'),
                icon: CheckSquare,
                active: route().current('tasks.*'),
            },

            {
                name: 'Team Chat',
                href: route('chat.index'),
                icon: MessageSquare,
                active: route().current('chat.*'),
                badge: unreadChatCount > 0 ? unreadChatCount : null,
            },
            ...(isAdmin
                ? [
                    {
                        name: 'Client Portal',
                        href: route('client-portal.index'),
                        icon: Building2,
                        active: route().current('client-portal.*'),
                    },
                    /* {
                        name: 'Support Tickets',
                        href: route('tickets.index'),
                        icon: Headset,
                        active: route().current('tickets.*'),
                    }, */
                    {
                        name: 'Logo Registrations',
                        href: route('logo-registrations.index'),
                        icon: UserCog,
                        active: route().current('logo-registrations.*'),
                    },
                    {
                        name: 'Login History',
                        href: route('audit-trail'),
                        icon: Activity,
                        active: route().current('audit-trail'),
                    },
                ]
                : []),
            ...(isAdmin || roleName === 'sales_manager'
                ? [
                    {
                        name: 'Upcoming Renewals',
                        href: route('domains.index'),
                        icon: Globe,
                        active: route().current('domains.*'),
                        badge: renewal_alerts?.length > 0 ? renewal_alerts.length : null,
                    },
                    {
                        name: 'Users & Roles',
                        href: route('users.index'),
                        icon: UserCog,
                        active: route().current('users.*'),
                    },
                ]
                : []),
        ];

    const toggleSidebar = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const userRoleDisplay =
        user?.role?.display_name ||
        user?.role?.role_name ||
        (user?.id === 1 ? 'Super Admin' : 'Admin');

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-100 transform transition-all duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:opacity-0' : 'lg:w-64 lg:translate-x-0 lg:opacity-100'
                    }`}
            >
                {/* Brand Header */}
                <div className="h-16 flex items-center justify-between px-4 bg-slate-950/80 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-white tracking-wide overflow-hidden group">
                        <img
                            src="/hms-laravel/public/images/logo.png"
                            alt="HubTech Media Solutions Logo"
                            className="h-9 w-auto object-contain bg-white rounded-lg p-0.5 shadow-sm group-hover:scale-105 transition-transform"
                            onError={(e) => { e.currentTarget.src = '/images/logo.png'; }}
                        />
                        <div className="flex flex-col leading-tight truncate">
                            <span className="font-black text-xs text-white uppercase tracking-wider">HubTech</span>
                            <span className="text-[0.62rem] text-indigo-400 font-bold uppercase truncate">Media Solutions</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                        Main Menu
                    </div>

                    {navItems.map((item, idx) => (
                        <div key={idx}>
                            {item.hasSubmenu ? (
                                <div>
                                    <button
                                        onClick={item.toggle}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active
                                            ? 'bg-indigo-600/10 text-indigo-400'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 text-indigo-400" />
                                            <span>{item.name}</span>
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-200 ${item.isOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {item.isOpen && (
                                        <div className="pl-9 pr-2 py-1 space-y-1">
                                            {item.submenu.map((sub, sIdx) => (
                                                <Link
                                                    key={sIdx}
                                                    href={sub.href}
                                                    className="block px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* User Info & Logout Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0) ?? 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    {/* Left side: Hamburger Toggle & Header */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Toggle Sidebar Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        {header && (
                            <h1 className="text-lg font-bold text-slate-900 hidden sm:block">{header}</h1>
                        )}
                    </div>

                    {/* Right side: Quick Actions (Projects, Chat, Notifications) & Role Badge & Profile */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <>
                                {/* Quick Projects Shortcut on Top */}
                                {!isClient && (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTopProjectsOpen(!topProjectsOpen);
                                                setNotificationsOpen(false);
                                                setUserMenuOpen(false);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                                            title="Quick Projects"
                                        >
                                            <FolderKanban className="w-4 h-4 text-blue-600" />
                                            <span className="hidden md:inline">Projects</span>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                        </button>

                                        {topProjectsOpen && (
                                            <div
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                                                onClick={() => setTopProjectsOpen(false)}
                                            >
                                                <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Quick Project Navigation
                                                </div>
                                                <Link
                                                    href={route('projects.index')}
                                                    className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <span>All Projects</span>
                                                    <span className="text-[10px] text-slate-400">View</span>
                                                </Link>
                                                <Link
                                                    href={route('projects.index', { status: 'active' })}
                                                    className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Projects
                                                    </span>
                                                </Link>
                                                <Link
                                                    href={route('projects.index', { status: 'pending' })}
                                                    className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Projects
                                                    </span>
                                                </Link>
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <Link
                                                    href={route('tasks.index')}
                                                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                                >
                                                    <CheckSquare className="w-4 h-4 text-blue-500" />
                                                    <span>Tasks & Milestones</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quick Chat Shortcut with Notification Badge on Top */}
                                {!isClient && (
                                    <Link
                                        href={route('chat.index')}
                                        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-xs flex items-center justify-center"
                                        title="Internal Team Chat"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {unreadChatCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center justify-center shadow-md animate-bounce ring-2 ring-white">
                                                {unreadChatCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Notifications Option on Top */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNotificationsOpen(!notificationsOpen);
                                            setTopProjectsOpen(false);
                                            setUserMenuOpen(false);
                                        }}
                                        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-xs flex items-center justify-center"
                                        title="System Notifications"
                                    >
                                        <Bell className="w-4 h-4" />
                                        {totalNotificationsCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                                                {totalNotificationsCount}
                                            </span>
                                        )}
                                    </button>

                                    {notificationsOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                                        >
                                            <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-bold text-slate-900">Notifications</span>
                                                    {totalNotificationsCount > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                                            {totalNotificationsCount} New
                                                        </span>
                                                    )}
                                                </div>
                                                {totalNotificationsCount > 0 && (
                                                    <button
                                                        onClick={markAllRead}
                                                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-2 py-1">
                                                {notifications.length === 0 ? (
                                                    <div className="py-8 text-center text-slate-400">
                                                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                                                        <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                                                        <p className="text-[11px] text-slate-400">No pending notifications right now.</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <Link
                                                            key={n.id}
                                                            href={n.link}
                                                            onClick={() => setNotificationsOpen(false)}
                                                            className="block p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="flex items-start gap-2.5">
                                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'chat'
                                                                    ? 'bg-blue-100 text-blue-600'
                                                                    : n.type === 'ticket'
                                                                        ? 'bg-amber-100 text-amber-600'
                                                                        : 'bg-rose-100 text-rose-600'
                                                                    }`}>
                                                                    {n.type === 'chat' && <MessageSquare className="w-3.5 h-3.5" />}
                                                                    {n.type === 'ticket' && <Headset className="w-3.5 h-3.5" />}
                                                                    {n.type === 'domain' && <Globe className="w-3.5 h-3.5" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                                                                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.description}</p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))
                                                )}
                                            </div>

                                            <div className="pt-2 px-4 border-t border-slate-100 flex justify-between items-center text-[11px]">
                                                <Link
                                                    href={route('chat.index')}
                                                    onClick={() => setNotificationsOpen(false)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    Go to Team Chat →
                                                </Link>
                                                <button
                                                    onClick={() => setNotificationsOpen(false)}
                                                    className="text-slate-400 hover:text-slate-600 font-medium"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Role Badge */}
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span>Role: {userRoleDisplay}</span>
                                </div>

                                {/* User Dropdown */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                            <UserIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="max-w-[120px] truncate">{user.name || 'Super Admin'}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                    </button>

                                    {userMenuOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <div className="px-3.5 py-2 border-b border-slate-100">
                                                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href={route('profile.edit')}
                                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                            >
                                                <UserCog className="w-4 h-4 text-slate-400" />
                                                Profile Settings
                                            </Link>
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Log Out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                href={route('login')}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>

                    {/* Copyright Footer */}
                    <footer className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
                        © {new Date().getFullYear()} <span className="font-semibold text-slate-500">HubTech Media Solutions</span>. All rights reserved.
                    </footer>
                </main>
            </div>
        </div>
    );
}
