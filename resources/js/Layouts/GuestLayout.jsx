import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 sm:p-6">
            <div className="mb-4 flex flex-col items-center">
                <Link href="/" className="transition-transform hover:scale-105">
                    <ApplicationLogo className="h-28 w-auto max-w-[280px] drop-shadow-sm" />
                </Link>
            </div>

            <div className="w-full overflow-hidden bg-white p-6 shadow-xl border border-slate-200/80 rounded-2xl sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
