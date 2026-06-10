import React, { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import { 
    getMyEntries,
    StartTimeEntry,
    StopTimeEntry,
    DeleteEntry
 } from "./Api/TimeApi";


export default function ProjectDetailsPage(){
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
            await DeleteEntry(id);
            loadEntries();
            //remove if loads twice
        }catch(error){
            console.error(error);
        }
    }

    useEffect(()=>{
        loadEntries();
    },[])
 
    return(
        <div style={{padding:20}}>
            <h1>Time Entries</h1>
            {entries.length === 0 &&(<p>no time entries yet</p>)}
            {entries.map(entry =>
                <div key={entry.Id}>
                    <p>Task: {entry.taskItemId}</p>
                    <p>Note: {entry.Note}</p>
                    <p>Start: {entry.StartedAtUtc}</p>
                    <p>End: {entry.EndedAtUtc ?? "Not done"}</p>
                    <p>Duration: {entry.durationMinutes ?? "Running"}</p>
                    {!entry.EndedAtUtc &&(<button onClick={() => handleStop(entry.Id)}>Stop</button>)}
                    <button onClick={() => handleDelete(entry.Id)}>Delete entry</button>
                </div>
            )}
        </div>
    );
}
// add handling for time entry functions