export function getRelativeTime(date: Date | string | number): string {
    // Coerce incoming value to a Date instance
    const d = date instanceof Date ? date : new Date(date);

    if (isNaN(d.getTime())) {
        // invalid date input
        return "Ismeretlen időpont";
    }

    const now = Date.now();
    let diff = now - d.getTime();

    // clock skew protection
    if (diff < 0) diff = 0;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 3) {
        return d.toLocaleString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    if (days > 0) {
        return `${days} napja`;
    }
    if (hours > 0) {
        return `${hours} órája`;
    }
    if (minutes > 0) {
        return `${minutes} perce`;
    }
    if (seconds >= 10) {
        return `${seconds} másodperce`;
    }

    return 'Pár másodperce';
}