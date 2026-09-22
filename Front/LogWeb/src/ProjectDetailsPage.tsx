import React, { useEffect, useState } from "react";
import{
    CreateTask,
    GetTasks,
    UpdateTask,
    DeleteTask
} from "./Api/TaskApi" ;

import {Link, useParams} from "react-router-dom";
import Api from "./Api";
import axios from "axios";
import { useTimer, formatElapsedSeconds } from "./TimerContext";
import { StopTimeEntry } from "./Api/TimeApi";
import { Button } from "react-bootstrap";

import {planOptimalSchedule, ScheduleResult} from "./PlanOptimalSchedule";

export default function ProjectDetailsPage(){
    const {projectId} = useParams();

    const [error, setError] = useState("");
    const [tasks, setTasks] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [estimateMinutes, setEstimateMinutes] = useState(0);

    const {activeEntry, elapsedSeconds, start, stop, refresh} = useTimer();

    const [avalibleMinutes, SetAvalibleMinutes] = useState(480); // default 8 hour work day
    const [plan , setPlan] = useState<ScheduleResult | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    function getNote(taskId:string){
        return notes[taskId]??"";
    }

    //note
    function setNoteFor(taskId: string, value: string){
        setNotes(n => ({...n,[taskId]: value}));
    }

    async function loadTasks() {
        if (!projectId) return;
        try{
            const data = await GetTasks(projectId);
            setTasks(data);
        }catch(error){
            console.error(error);
        }
    }
    useEffect(()=>{
        loadTasks();
    }, [])

    async function HandleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!projectId) {
            return;
        }
        try{
            await CreateTask({ title, estimateMinutes }, projectId);
            setTitle("");
            setEstimateMinutes(0);
            loadTasks();
        }catch(error){
            console.error(error);
        }
    }

    async function HandleDelete(taskId: string) {
        if(!projectId){
            return;
        }
        const shouldDelete = window.confirm("Delete this task?");
        if (shouldDelete) {
            try{
                await DeleteTask(taskId, projectId);
                await loadTasks();
                await refresh();
            }catch(deleteError){
                if (axios.isAxiosError(deleteError)) {
                    setError(deleteError.response?.data?.error ?? "Failed to delete task");
                }
            }
            return;
        }
    }

    async function MoveToTasks(taskId: string, status: number) {
        if (!projectId) {
            return;
        }
        try{
            await UpdateTask(taskId, projectId, status);
            loadTasks();
        }catch(error){
            console.error(error)
        }
    }
    async function onStart(taskId: string) {
        try{
            await start(taskId, getNote(taskId) || "Stopped from frontend");
            setNoteFor(taskId, "");
        }catch(Error){
            if (axios.isAxiosError(Error)) {
                setError(Error.response?.data?.error ?? "start failed");
            }
            console.log(Error)
        }
    }

    async function onStop(taskId: string ) {
        try{   
            await stop(getNote(taskId));
            setNoteFor(taskId, "");
        }catch(Error){
            console.log(Error)
        }
    }

    function handlePlan(){
        const nonCompletedTasks = tasks
        .filter(t => t.status !== 2)
        .map(t =>({
            id: t.id,
            title: t.title,
            estimateMinutes: t.estimateMinutes,
        }));

        const result = planOptimalSchedule(nonCompletedTasks, avalibleMinutes);
        setPlan(result);
    }

    return(
        <div style={{padding:20}}>
            <h1>Project Tasks</h1>
            <form onSubmit={HandleCreate}>
                <input value={title} placeholder="Task Title" onChange={e=> setTitle(e.target.value)} />
                <input type="number" value={estimateMinutes} placeholder="Estimated task length" onChange={e=> setEstimateMinutes(Number(e.target.value))}/>
                <button type="submit">Create task</button>
            </form>

            <div style={{
                marginTop:20,
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 8,
                background:"#fafafa",
                maxWidth: 480,
            }}>
                <h3 style={{marginTop:0}}> plan out your tasks</h3>
                <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                    <input type="text" value={avalibleMinutes} onChange={e => SetAvalibleMinutes(Number(e.target.value))} style={{width:100}}/>
                    <span>minutes avalible</span>
                    <button onClick={handlePlan}>Create plan</button>
                </div>
                {plan && (
                    <div style={{marginTop: 16}}>
                        <p>
                            <strong>Doable tasks:</strong>{plan.selectedTasks.length}
                            (Used {plan.totalMinutesUsed} out of {avalibleMinutes} min,
                            {plan.remainingMinutes} minutes left)
                        </p>
                        <ul>
                            {plan.selectedTasks.map(t => (
                                <li key={t.id}>{t.title} - {t.estimateMinutes} min</li>
                            ))}
                        </ul>
                        {plan.skippedTasks.length > 0 &&(
                            // react fragment
                            <> 
                                <p><strong>Uncompleted tasks:</strong></p>    
                                <ul>
                                    {plan.skippedTasks.map(t =>(
                                        <li key={t.id} style={{opacity:0.6}}>{t.title} - {t.estimateMinutes} min</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && (<p role="alert">{error}</p>)}

            <div style={{ display:"flex", gap: 20, marginTop:30 }}>

                <Column title="Todo"
                    tasks={tasks.filter(x => x.status === 0)}
                    onMove={MoveToTasks}                    
                    getNote={getNote}
                    setNoteFor={setNoteFor}
                    onStart={onStart}
                    onStop={onStop}
                    onDelete={HandleDelete}
                    activeEntry={activeEntry}
                    elapsedSeconds={elapsedSeconds}/>

                <Column title="In Progress"
                    tasks={tasks.filter(x => x.status === 1)}
                    onMove={MoveToTasks}
                    getNote={getNote}
                    setNoteFor={setNoteFor}
                    onStart={onStart}
                    onStop={onStop}
                    onDelete={HandleDelete}
                    activeEntry={activeEntry}
                    elapsedSeconds={elapsedSeconds}
                />

                <Column title="Done"
                    tasks={tasks.filter(x => x.status === 2)}
                    onMove={MoveToTasks}
                    getNote={getNote}
                    setNoteFor={setNoteFor}
                    onStart={onStart}
                    onStop={onStop}
                    onDelete={HandleDelete}
                    activeEntry={activeEntry}
                    elapsedSeconds={elapsedSeconds}
                />

            </div>
        </div>
    );
}

interface ColumnProps{
    title:string;
    tasks: any[];
    getNote:(taskId:string) => string;
    setNoteFor:(taskId: string, value: string) => void;
    onMove: (taskId: string, status: number) => void;
    onStart: (taskId: string) => void
    onStop: (taskId: string) => void
    onDelete: (taskId: string) => void
    activeEntry: { taskItemId: string } | null
    elapsedSeconds: number
}

function Column({title, tasks, getNote, setNoteFor, onMove, onStart, onStop, onDelete, activeEntry, elapsedSeconds}:ColumnProps) {
    return(
        <div>
            <h2>{title}</h2>
            {tasks.map(task =>{
                const isRunning = activeEntry?.taskItemId === task.id;
                const anotherRunning = !!activeEntry && !isRunning;

                return(
                <div key={task.id} style={isRunning ? {
                    border: "2px solid #2e7d32", borderRadius: 6, padding: 8, marginBottom: 8
                } : {marginBottom: 8}}>
                    <h4>{task.title}</h4>
                    <p>Estimate: {task.estimateMinutes}</p>
                    <button onClick={() => onDelete(task.id)}>Delete Task</button>
                    <button onClick={() => onMove(task.id, 0)}>Todo</button>
                    <button onClick={() => onMove(task.id, 1)}>In progress</button>
                    <button onClick={() => onMove(task.id, 2)}>Done</button>
                    {isRunning ? (
                        <div>
                            <span style={{fontFamily: "monospace", fontSize: 18, margin:"0 8px"}}>{formatElapsedSeconds(elapsedSeconds)}</span>
                            <input type="Text" placeholder="Stop note(Optional)" value={getNote(task.id)} onChange={e => setNoteFor(task.id, e.target.value)}/>
                            <button onClick={() => onStop(task.id)}> stop timer</button>
                        </div>) : (
                            <div>
                                <input type="Text" placeholder="Note(Optional)" value={getNote(task.id)} onChange={e => setNoteFor(task.id, e.target.value)}/>
                                <button onClick={() => onStart(task.id)} disabled={anotherRunning} title={anotherRunning ? "Another timer is already running" : ""}>
                                    Start task timer
                                </button>
                            </div>
                        )}
                        <Link to={`/tasks/${task.id}/timeEntries`}>Move to entries</Link>
                    </div>
                )
            })}
        </div>
    )
}