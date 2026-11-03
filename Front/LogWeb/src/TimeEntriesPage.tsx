import React, { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import { 
    getMyEntries,
    StopTimeEntry,
    DeleteEntry,
    UpdateNote
 } from "./Api/TimeApi";
import { useTimer, formatElapsedSeconds } from "./utils/TimerContext";

export default function TimeEntriesPage(){
    const [entries, setEntries] = useState<any[]>([]);
    const {activeEntry, elapsedSeconds, stop, refresh} = useTimer();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");

    async function loadEntries() {
        try{
            const data = await getMyEntries();
            setEntries(data);
        }catch(error){
            console.error(error);
        }
    }

    async function handleStop(id: string) {
        try{
            if(activeEntry?.id === id){
                await stop();
            }else{
                await StopTimeEntry({}, id)
            }
            await loadEntries();
            await refresh
        }catch(error){
            console.error(error);
        }
    }

    async function handleDelete(id: string) {
        try{
            if (!entries.find(x => x.id === id)?.endedAtUtc) {
                await handleStop(id);
            }
            await DeleteEntry(id);
            await loadEntries();
            await refresh();
        }catch(error){
            console.error(error);
        }
    }

    async function saveNote(id: string) {
        try{
            await UpdateNote(id, draft);
            setEditingId(null);
            await loadEntries();
            await refresh();
        }catch(error){
            console.error(error);
        }
    }

    function startEdit(entry : any){
        setEditingId(entry.id);
        setDraft(entry.note ?? "");
    }

    useEffect(()=>{
        loadEntries();
        refresh();
    },[])
 
    return(
        <div style={{padding:20}}>
            <h1>Time Entries</h1>
            {activeEntry &&(
                <div style={{padding: 16,
                    marginBottom: 20,
                    border:"1px solid #ccc",
                    borderRadius: 8,
                    background: "#f7fff7"
                }}>
                    <h3 style={{margin:0}}> Active timer</h3>
                    <p style={{margin:"8px 0"}}>Task: {activeEntry.taskTitle}</p>
                    <p style={{margin:"8px 0", fontSize:28, fontFamily:"monoscope"}}>Time spent: {formatElapsedSeconds(elapsedSeconds)}</p>
                    <button onClick={() => handleStop(activeEntry.id)}>Stop</button>
                </div>
            )}
            {entries.length === 0 &&(<p>no time entries yet</p>)}
            {entries.map(entry =>
                <div key={entry.id}>
                    <p>Task: {entry.taskTitle}</p>
                    {editingId === entry.id ?(
                        <p>
                            <input value={draft} maxLength={500} autoFocus onChange={e => setDraft(e.target.value)}
                                onKeyDown={ e => {
                                    if (e.key === "Enter") saveNote(entry.id);
                                    if (e.key === "Escape") setEditingId(null);       
                            }}/>
                            <button onClick={() => saveNote(entry.id)}>Save</button>
                            <button onClick={() => setEditingId(null)}>Cancel</button>

                        </p>
                    ):(
                        <p>Note: {entry.note || "-"}{" "}
                        <button onClick={(() => startEdit(entry))}>{entry.note ? "Edit note" : "Add note"}</button></p>
                    )}
                    <p>Start: {new Date(entry.startedAtUtc.endsWith("Z") ? entry.startedAtUtc : entry.startedAtUtc + "Z").toLocaleString()}</p>
                    <p>End: {entry.endedAtUtc ? new Date(entry.endedAtUtc.endsWith("Z") ? entry.endedAtUtc : entry.endedAtUtc + "Z").toLocaleString() : "Not done"}</p>
                    <p>Duration: {entry.durationMinutes != null ? `${entry.durationMinutes} min` : "Running"}</p>
                    {!entry.endedAtUtc && (<button onClick={() => handleStop(entry.id)}>Stop</button>)}
                    <button onClick={() => handleDelete(entry.id)}>Delete entry</button>
                </div>
            )}
        </div>
    );
    // add widget active entry && activeEntry? fromatelapsed? handlestop?

}
