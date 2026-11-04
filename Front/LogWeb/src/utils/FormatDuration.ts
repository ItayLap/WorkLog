export function formatDuration(totalSeconds: number){
    const s = Math.max(0, Math.floor(totalSeconds));
    const w = Math.floor(s / 604800);
    const d = Math.floor((s % 604800) / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    const parts: string[] = [];
    if (w > 0) parts.push(`${w} w`);
    if (w > 0 || d > 0) parts.push(`${d} d`);
    if (w > 0 || d > 0 || h > 0) parts.push(`${h} h`);
    if (w > 0 || d > 0 || h > 0 || m > 0) parts.push(`${m} m`);
    parts.push(`${sec} s`);
    return parts.join(" ");
}
