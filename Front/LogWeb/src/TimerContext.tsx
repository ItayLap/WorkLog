import React, {Children, createContext, useContext, useEffect, useState} from "react";
import { GetActiveTimeEntry, StartTimeEntry, StopTimeEntry  } from "./Api/TimeApi";

interface ActiveTimeEntry{
    id: string;
    taskItemId: string;
    taskTitle: string;
    startedAtUtc: string;
    endedAtUtc: string;
    note: string | null;
}
interface TimerContextValue{
    activeEntry: ActiveTimeEntry | null;
    elapsedSeconds: number;
    refresh: () => Promise<void>;
    start: (taskItemId: string, note?:string) => Promise<void>;
    stop: () => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function formatElapsedSeconds(totalSeconds: number){
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600)/60);
    const s = Math.floor(totalSeconds % 60);
    const pad = (n:number) => n.toString().padStart(2,"0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function TimerProvider({children}: {children: React.ReactNode}){
    const [activeEntry, setActiveEntry] = useState<ActiveTimeEntry | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    async function refresh() {
        try{
            const data = await GetActiveTimeEntry();
            setActiveEntry(data ?? null);
        }catch (error){
            console.error(error);
        }
    }

    async function start(taskItemId: string, note?:string) {
        await StartTimeEntry({taskItemId,note})
        await refresh();
    }

    async function stop() {
        if (!activeEntry) return;
        await StopTimeEntry({note:"stoped"}, activeEntry.id)
        setActiveEntry(null);
    }

    useEffect(() =>{
        refresh();
    }, []);

    useEffect(() =>{
        if (!activeEntry) 
        {
            setElapsedSeconds(0);
            return;
        }
        const currentEntry = activeEntry;
        function update(){
            const isoUtc = currentEntry.startedAtUtc.endsWith("Z") ? currentEntry.startedAtUtc : currentEntry.startedAtUtc + "Z";
            const startedAt = new Date(isoUtc).getTime(); 
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)); 
        }
        update();
        const intervalId = window.setInterval(
            update, 1000
        );
        return () =>{
            window.clearInterval(intervalId);
        }
    }, [activeEntry])
            
    return(<TimerContext.Provider value={{activeEntry, elapsedSeconds, refresh, start, stop}}>{children}</TimerContext.Provider>);
}

export function useTimer(){
    const ctx = useContext(TimerContext);
    if(!ctx){
        throw new Error("useTimer must be used within a TimerProvider")
    }
    return ctx;
}

    // function update() 
    // { 
    //     const isoUtc = currentEntry.startedAtUtc.endsWith("Z") ? currentEntry.startedAtUtc : currentEntry.startedAtUtc + "Z";
    //     const startedAt = new Date(isoUtc).getTime(); 
    //     setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)); 
    // }