import {useTimer, formatElapsedSeconds} from "./TimerContext";

function ColorfulTimer(seconds: number): string{
    const h = Math.floor((seconds/3600) % 24);
    const m = Math.floor((seconds/3600) % 60);
    const s = Math.floor(seconds % 60);
    const pad = (n:number) => n.toString().padStart(2,"0");
    const digits = pad(h) + pad(m) + pad(s);
    const lighter = digits
    .replace(/0/g,"a")
    .replace(/1/g,"b")
    .replace(/2/g,"c")
    return "#" + lighter;
}


export default function TimerWidget(){
    const {activeEntry, elapsedSeconds, stop} = useTimer();
    if (!activeEntry) {
        return null;
    }
     const backgroundColor = ColorfulTimer(elapsedSeconds);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 16px",
            background: backgroundColor,
            color: "#fff"
        }}>
            <span style={{opacity: 0.7, fontSize: 13}}>{activeEntry.taskTitle} Timer</span>
            <span style={{fontFamily: "monospace", fontSize: 18}}>{formatElapsedSeconds(elapsedSeconds)}</span>
            <button onClick={() => stop()}>Stop</button>
        </div>

    );
}
