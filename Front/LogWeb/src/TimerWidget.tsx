import {useTimer, formatElapsedSeconds} from "./TimerContext";
export default function TimerWidget(){
    const {activeEntry, elapsedSeconds, stop} = useTimer();
    if (!activeEntry) {
        return null;
    }
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 16px",
            background: "#1b1b1b",
            color: "#fff"
        }}>
            <span style={{opacity: 0.7, fontSize: 13}}>{activeEntry.taskTitle} Timer</span>
            <span style={{fontFamily: "monospace", fontSize: 18}}>{formatElapsedSeconds(elapsedSeconds)}</span>
            <button onClick={() => stop()}>Stop</button>
        </div>
    );
}