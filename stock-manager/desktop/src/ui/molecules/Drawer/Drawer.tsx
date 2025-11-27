import React, { useEffect } from 'react';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: string;
}

export const Drawer = ({ open, onClose, title, children, width = 'max-w-md' }: DrawerProps) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />
            <div
                className={`fixed top-0 right-0 h-full w-full ${width} bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    <header className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                        >
                            ✕
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6">{children}</div>
                </div>
            </div>
        </>
    );
};
