interface NotificationBadgeProps {
    count: number;
}

const NotificationBadge = ({ count }: NotificationBadgeProps) => {
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold items-center justify-center">
                {count > 9 ? '9+' : count}
            </span>
        </span>
    );
};

export default NotificationBadge;
