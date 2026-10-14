import { act, useEffect, useState } from "react";
import { useTimer, formatElapsedSeconds } from "./TimerContext";
import { UpdateTask } from "../Api/TaskApi";

const SNOOZE_MINUTES = 1;

function toUtcMs(iso: string){
    return new Date(iso.endsWith("Z") ? iso : iso + "Z").getTime();
}

export default function EstimateAlert(){
    const {activeEntry, elapsedSeconds, stop} = useTimer();
    // const [extraSeconds, setExtraSeconds] = useState(0);
    const snoozeKey = activeEntry ? `snoozeUntil: ${activeEntry.id}` : null;
    const snoozeCountKey = activeEntry ? `snoozeCount: ${activeEntry.id}` : null;
    const [snoozeCount, setSnoozeCount] = useState(0)
    const [snoozeUntil, setSnoozeUntil] = useState(0)
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    // useEffect(() =>{
    //     setExtraSeconds(0);
    //     setError("");
    // }, [activeEntry?.id]);
    useEffect(() =>{
        setError("");
        if (!snoozeKey) {
            setSnoozeUntil(0);
            return;
        }
        try{
            setSnoozeUntil(Number(localStorage.getItem(snoozeKey)) || 0);
        }catch{
            setSnoozeUntil(0);
        }
    }, [snoozeKey])

    const estimateSeconds = (activeEntry?.estimateMinutes ?? 0) * 60;
    // const remindAt = estimateSeconds + extraSeconds;
    const reached = !!activeEntry && elapsedSeconds > estimateSeconds && estimateSeconds > 0 &&  Date.now() >= snoozeUntil;

    useEffect(() =>{
        if (!reached || !activeEntry) {
            return;
        }
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("alloted estimated time has passed", {body: activeEntry.taskTitle})
        }

    }, [reached, activeEntry?.id, snoozeUntil]);

    if (!reached || !activeEntry) {
        return null;
    }

    const overrunSeconds = elapsedSeconds - estimateSeconds; ////
    const forgot = overrunSeconds > 60;

    async function finish(countOnlyEstimate: boolean) {
        if (!activeEntry) {
            return;
        }
        setBusy(true);
        setError("");
        try{
            await UpdateTask(activeEntry.taskItemId, activeEntry.projectId, 2); // transfer task to done column
            const endedAt = countOnlyEstimate ? undefined : new Date(toUtcMs(activeEntry.startedAtUtc) + activeEntry.estimateMinutes + (snoozeCount * SNOOZE_MINUTES) * 60000).toISOString();
            await stop(undefined, endedAt);
        }catch(error){
            console.error(error)
            setError("couldn't complete action")
        }finally{
            setBusy(false);
        }
    }

    function snooze(){
        const until = Date.now() + SNOOZE_MINUTES * 60000;
        setSnoozeCount(snoozeCount + 1);
        setSnoozeUntil(until);
        try{
            if (snoozeKey) {
                localStorage.setItem(snoozeKey, String(until));
                
            }
            if (snoozeCountKey) {
                localStorage.setItem(snoozeCountKey, String(snoozeCount));
            }
        }catch{

        }
    }

    return(
        <div role="dialog" aria-modal="true" style={{
            position:"fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 400230,
        }}>
            <div style={{
                background: "#fff",
                color: "#222",
                padding: 24,
                borderRadius: 12,
                maxWidth: 420,
                width: "90%",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}>
                <h3 style={{marginTop:0}}>Estimated time has passed</h3>
                <p><strong>{activeEntry.taskTitle}</strong></p>
                <p>Estimate: {activeEntry.estimateMinutes} min time - passed:{formatElapsedSeconds(elapsedSeconds)}</p>
                {forgot && (<p>Timer has been running for{Math.floor(overrunSeconds / 60)} minutes more then estimated. did you forget to stop it?</p>)}
                {error && <p role="alert" style={{color:"#c62828"}}>{error}</p>}
                <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                    
                    <button disabled={busy} onClick={() => finish(true)}>task completed(stop and move task to done)</button>
                    <button disabled={busy} onClick={snooze}>Still working(remind in {SNOOZE_MINUTES} min)</button>
                    {forgot && (<button disabled={busy} onClick={() => finish(false)}>task completed within estimated time({activeEntry.estimateMinutes + (snoozeCount * SNOOZE_MINUTES)} min)</button>)}
                </div>
            </div>
        </div>
    )

}