import React, { useEffect, useState } from "react";
import{
    CreateTask,
    GetTasks,
    UpdateTask,
    DeleteTask
} from "./Api/TaskApi" ;

import {
    StartTimeEntry
}from "./Api/TimeApi" ;

import {Link, useParams} from "react-router-dom";
import Api from "./Api";
import axios from "axios";



export default function ProjectDetailsPage(){
    const {projectId} = useParams();

    const [error, setError] = useState("");

    const [tasks, setTasks] = useState<any[]>([]);

    const [title, setTitle] = useState("");

    const [estimateMinutes, setEstimateMinutes] = useState(0);

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
    async function loadTasks() {
        if (!projectId) return;
        try{
            const data = await GetTasks(projectId);
            setTasks(data);
            console.log("Rerender");
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
            await CreateTask({
                title,
                estimateMinutes
            }, projectId);
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
        const shouldDelete = window.confirm(
            "Delete this task?"
        );
        if (shouldDelete) {
            try{
                await DeleteTask(taskId, projectId);
                await loadTasks();
            }catch(deleteError){
                if (axios.isAxiosError(deleteError)) {
                    setError(
                        deleteError.response?.data?.error ?? "Failed to delete task"
                    );
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
            await UpdateTask(
                taskId,
                projectId,
                status
            );
            loadTasks();

        }catch(error){
            console.error(error)
        }
    }
    async function onStart(taskId: string) {
        try{
            await StartTimeEntry({
                taskItemId: taskId,
                note: "started from frontend"
            });
        }catch(error){
            console.error(error);
        }
    }
    return(
        <div style={{padding:20}}>
            <h1>Project Tasks</h1>
            <form onSubmit={HandleCreate}>
                <input value={title} placeholder="Task Title" onChange={e=> setTitle(e.target.value)} />
                <input type="number" value={estimateMinutes} placeholder="Estimated task length" onChange={e=> setEstimateMinutes(Number(e.target.value))}/>
                <button type="submit">Create task</button>
            </form>

            {error && (<p role="alert">{error}</p>)}

            <div style={{
                display:"flex",
                gap: 20,
                marginTop:30
            }}>
                <Column title="Todo"
                tasks={tasks.filter(x => x.status === 0)}
                onMove={MoveToTasks}
                onStart={onStart}
                onDelete={HandleDelete}/>

                <Column title="In Progress"
                tasks={tasks.filter(x => x.status === 1)}
                onMove={MoveToTasks}
                onStart={onStart}
                onDelete={HandleDelete}/>

                <Column title="Done"
                tasks={tasks.filter(x => x.status === 2)}
                onMove={MoveToTasks}
                onStart={onStart}
                onDelete={HandleDelete}/>
                
            </div>
        </div>
    );
}
interface ColumnProps{
    title:string;
    tasks: any[];
    onMove: (taskId: string, status: number) => void;
    onStart: (taskId: string) => void
    onDelete: (taskId: string) => void
}
interface ActiveTimeEntry{
    id: string;
    taskItemId: string;
    startedAtUtc: string;
    endedAtUtc: string;
    note: string | null;
}

function Column({title, tasks, onMove, onStart, onDelete}:ColumnProps) {
    return(
        <div>
            <h2>{title}</h2>
            {tasks.map(task =>(
                <div key={task.id}>
                    <h4>{task.title}</h4>
                    <p>Estimate: {task.estimateMinutes}</p>
                    <button onClick={() => onDelete(task.id)}>Delete Task</button>
                    <button onClick={() => onMove(task.id, 0)}>Todo</button>
                    <button onClick={() => onMove(task.id, 1)}>In progress</button>
                    <button onClick={() => onMove(task.id, 2)}>Done</button>
                    <button onClick={() => onStart(task.id)}>Start task timer</button>
                    <Link to={`/tasks/${task.id}/timeEntries`}>Move to entries</Link>    
                </div>
            ))}
        </div>
    )
}