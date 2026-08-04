import React, { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import { 
    getMyEntries,
    StopTimeEntry,
    DeleteEntry,
    GetActiveTimeEntry
 } from "./Api/TimeApi";


export default function TimeEntriesPage(){
    const [entries, setEntries] = useState<any[]>([]);

    

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
            await StopTimeEntry({note:"frontend stopped"}, id)
        }catch(error){
            console.error(error);
        }
    }

    async function handleDelete(id: string) {
        try{
            await handleStop(id); //////
            await DeleteEntry(id);
            loadEntries();
        }catch(error){
            console.error(error);
        }
    }

    interface ActiveTimeEntry{
        id: string;
        taskItemId: string;
        startedAtUtc: string;
        endedAtUtc: string;
        note: string | null;
    }

    const [activeEntry, setActiveEntry] = useState<ActiveTimeEntry | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() =>{

        if (!activeEntry) {
            setElapsedSeconds(0);
            return;
        }
        const currentEntry = activeEntry;
        function UpdateElapsedTime(){
            const startedAt = new Date(
                currentEntry.startedAtUtc
            ).getTime();
            const currentTime = Date.now();
            const seconds = Math.floor(
                (currentTime - startedAt) / 1000
            );
            setElapsedSeconds(seconds);
        }
        UpdateElapsedTime();
        const intervalId = window.setInterval(
            UpdateElapsedTime, 1000
        );
        return () =>{
            window.clearInterval(intervalId);
        }
    }, [activeEntry])



    useEffect(()=>{
        loadEntries();
    },[])
 
    return(
        <div style={{padding:20}}>
            <h1>Time Entries</h1>
            {entries.length === 0 &&(<p>no time entries yet</p>)}
            {entries.map(entry =>
                <div key={entry.id}>
                    <p>Task: {entry.taskItemId}</p>
                    <p>Note: {entry.note}</p>
                    <p>Start: {entry.startedAtUtc}</p>
                    <p>End: {entry.endedAtUtc ?? "Not done"}</p>
                    <p>Duration: {entry.durationMinutes ?? "Running"}</p>
                    {!entry.endedAtUtc &&(<button onClick={() => handleStop(entry.id)}>Stop</button>)}
                    <button onClick={() => handleDelete(entry.id)}>Delete entry</button>
                </div>
            )}
        </div>
    );
}
