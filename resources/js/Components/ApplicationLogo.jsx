import React from 'react';

export default function ApplicationLogo({ className = 'h-16 w-auto', ...props }) {
    return (
        <img
            src="/hms-laravel/public/images/logo.png"
            alt="HubTech Media Solutions Logo"
            className={`object-contain ${className}`}
            onError={(e) => {
                e.currentTarget.src = '/images/logo.png';
            }}
            {...props}
        />
    );
}
