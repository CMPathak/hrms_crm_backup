import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    Users, 
    Layers, 
    PauseCircle, 
    CheckCircle2, 
    Archive, 
    Hourglass,
    Key,
    Share2,
    Video,
    Image as ImageIcon
} from 'lucide-react';

export default function MetricCards({ metrics, currentFilter = 'all' }) {
    if (!metrics) return null;

    const cards = [
        {
            title: 'Total Customers',
            value: metrics.customerCount ?? 0,
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/80 hover:bg-indigo-100/80',
            iconBg: 'bg-indigo-100 text-indigo-600',
            href: route('projects.index'),
            active: currentFilter === 'all',
        },
        {
            title: 'Active Projects',
            value: metrics.activeCount ?? 0,
            icon: Layers,
            color: 'text-sky-600',
            bg: 'bg-sky-50/80 hover:bg-sky-100/80',
            iconBg: 'bg-sky-100 text-sky-600',
            href: route('projects.index', { status: 'active' }),
            active: currentFilter === 'active',
        },
        {
            title: 'Hold Projects',
            value: metrics.holdCount ?? 0,
            icon: PauseCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50/80 hover:bg-amber-100/80',
            iconBg: 'bg-amber-100 text-amber-600',
            href: route('projects.index', { status: 'hold' }),
            active: currentFilter === 'hold',
        },
        {
            title: 'Completed Projects',
            value: metrics.completedCount ?? 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/80 hover:bg-emerald-100/80',
            iconBg: 'bg-emerald-100 text-emerald-600',
            href: route('projects.index', { status: 'completed' }),
            active: currentFilter === 'completed',
        },
        {
            title: 'Closed Projects',
            value: metrics.closedCount ?? 0,
            icon: Archive,
            color: 'text-slate-700',
            bg: 'bg-slate-50/80 hover:bg-slate-100/80',
            iconBg: 'bg-slate-200 text-slate-700',
            href: route('projects.index', { status: 'closed' }),
            active: currentFilter === 'closed',
        },
        {
            title: 'Pending Projects',
            value: metrics.pendingCount ?? 0,
            icon: Hourglass,
            color: 'text-rose-600',
            bg: 'bg-rose-50/80 hover:bg-rose-100/80',
            iconBg: 'bg-rose-100 text-rose-600',
            href: route('projects.index', { status: 'pending' }),
            active: currentFilter === 'pending',
        },
    ];

    const notifs = metrics.notifications || {};

    return (
        <div className="space-y-4 mb-6">
            {/* Top 6 Metric Cards in One Line with Equal Height */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 items-stretch">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={idx}
                            href={card.href}
                            className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 h-full shadow-sm hover:shadow-md ${
                                card.active
                                    ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/10'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2 w-full">
                                <div className="min-w-0 flex-1">
                                    <span className="text-[0.8rem] font-semibold text-slate-500 leading-snug line-clamp-2 min-h-[2.4em] flex items-end">
                                        {card.title}
                                    </span>
                                    <h3 className={`text-2xl font-bold tracking-tight mt-1 ${card.color}`}>
                                        {Number(card.value).toLocaleString()}
                                    </h3>
                                </div>
                                <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconBg}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Action Notifications Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* GMB Card */}
                <div className="p-3.5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-rose-500 to-red-600 flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                        <span className="flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" /> GMB Access
                        </span>
                        <span className="opacity-75">Status</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/15">
                        <div>
                            <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                            <span className="text-xl font-bold">{notifs.gmbTotal ?? 0}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                            <span className="text-xl font-bold text-amber-300">{notifs.gmbPending ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Social Media Card */}
                <div className="p-3.5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                        <span className="flex items-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5" /> Social Media
                        </span>
                        <span className="opacity-75">Status</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/15">
                        <div>
                            <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                            <span className="text-xl font-bold">{notifs.smTotal ?? 0}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                            <span className="text-xl font-bold text-amber-300">{notifs.smPending ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* DVC Card */}
                <div className="p-3.5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-cyan-500 to-teal-600 flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                        <span className="flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" /> DVC
                        </span>
                        <span className="opacity-75">Status</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/15">
                        <div>
                            <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                            <span className="text-xl font-bold">{notifs.dvcTotal ?? 0}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                            <span className="text-xl font-bold text-amber-300">{notifs.dvcPending ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Banner & Reel Card */}
                <div className="p-3.5 rounded-2xl text-white shadow-sm bg-gradient-to-br from-pink-500 to-rose-600 flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                        <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Banner & Reel
                        </span>
                        <span className="opacity-75">Status</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/15">
                        <div>
                            <span className="text-[0.7rem] uppercase tracking-wider opacity-80 block">Total</span>
                            <span className="text-xl font-bold">{notifs.brTotal ?? 0}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[0.7rem] uppercase tracking-wider text-amber-200 block">Pending</span>
                            <span className="text-xl font-bold text-amber-300">{notifs.brPending ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
