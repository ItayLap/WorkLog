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
    useEffect(()=>{
        loadEntries();
    },[])
 
    return(
        <div style={{padding:20}}>
            <h1>Time Entries</h1>
            {entries.map(entry =>
                <div key={entry.Id}>
                    <p>Task: {entry.taskItemId}</p>
                    <p>Note: {entry.Note}</p>
                    <p>Start: {entry.StartedAtUtc}</p>
                    <p>End: {entry.EndedAtUtc}</p>
                </div>
            )}
        </div>
    );
}
// add handling for time entry functions