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

export default function ProjectDetailsPage(){
    const {projectId} = useParams();

    const [error, setError] = useState("");
    const [tasks, setTasks] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [estimateMinutes, setEstimateMinutes] = useState(0);

    const {activeEntry, elapsedSeconds, start, stop, refresh} = useTimer();

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
            await start(taskId, "started from front end");
        }catch(Error){
            if (axios.isAxiosError(Error)) {
                setError(Error.response?.data?.error ?? "start failed");
            }
            console.log(Error)
        }
    }

    async function onStop() {
        try{
            await stop();
        }catch(Error){
            console.log(Error)
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

            <div style={{ display:"flex", gap: 20, marginTop:30 }}>

                <Column title="Todo"
                    tasks={tasks.filter(x => x.status === 0)}
                    onMove={MoveToTasks}
                    onStart={onStart}
                    onStop={onStop}
                    onDelete={HandleDelete}
                    activeEntry={activeEntry}
                    elapsedSeconds={elapsedSeconds}/>

                <Column title="In Progress"
                    tasks={tasks.filter(x => x.status === 1)}
                    onMove={MoveToTasks}
                    onStart={onStart}
                    onStop={onStop}
                    onDelete={HandleDelete}
                    activeEntry={activeEntry}
                    elapsedSeconds={elapsedSeconds}
                />

                <Column title="Done"
                    tasks={tasks.filter(x => x.status === 2)}
                    onMove={MoveToTasks}
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
    onMove: (taskId: string, status: number) => void;
    onStart: (taskId: string) => void
    onStop: () => void
    onDelete: (taskId: string) => void
    activeEntry: { taskItemId: string } | null
    elapsedSeconds: number
}

function Column({title, tasks, onMove, onStart, onStop, onDelete, activeEntry, elapsedSeconds}:ColumnProps) {
    return(
        <div>
            <h2>{title}</h2>
            {tasks.map(task =>{
                const isRunning = activeEntry?.taskItemId === task.id;
                const anotherRunning = activeEntry!! && !isRunning;

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
                            <button onClick={onStop}> stop timer</button>
                        </div>) : (
                            
                                <button onClick={() => onStart(task.id)} disabled={anotherRunning} title={anotherRunning ? "Another timer is already running" : ""}>
                                    Start task timer
                                </button>
                        )}
                    </div>
                );
            })}
        </div>
    )
}





























// import React, { useEffect, useState } from "react";
// import{
//     CreateTask,
//     GetTasks,
//     UpdateTask,
//     DeleteTask,
// } from "./Api/TaskApi" ;

// import {
//     StartTimeEntry
// }from "./Api/TimeApi" ;

// import {Link, useParams} from "react-router-dom";
// import Api from "./Api";
// import axios from "axios";



// export default function ProjectDetailsPage(){
//     const {projectId} = useParams();

//     const [error, setError] = useState("");

//     const [tasks, setTasks] = useState<any[]>([]);

//     const [title, setTitle] = useState("");

//     const [estimateMinutes, setEstimateMinutes] = useState(0);

    


//     async function loadTasks() {
//         if (!projectId) return;
//         try{
//             const data = await GetTasks(projectId);
//             setTasks(data);
//             console.log("Rerender");
//         }catch(error){
//             console.error(error);
//         }
//     }

//     useEffect(()=>{
//         loadTasks();
//     }, [projectId])

//     async function HandleCreate(e: React.FormEvent) {
//         e.preventDefault();

//         if (!projectId) {
//             return;
//         }
//         try{
//             await CreateTask({
//                 title,
//                 estimateMinutes
//             }, projectId);
//             setTitle("");
//             setEstimateMinutes(0);
//             await loadTasks();

//         }catch(error){
//             console.error(error);
//         }
//     }
//     async function HandleDelete(taskId: string) {
//         if(!projectId){
//             return;
//         }
//         const shouldDelete = window.confirm(
//             "Delete this task?"
//         );
//         if (shouldDelete) {
//             try{
//                 await DeleteTask(taskId, projectId);
//                 await loadTasks();
//             }catch(deleteError){
//                 if (axios.isAxiosError(deleteError)) {
//                     setError(
//                         deleteError.response?.data?.error ?? "Failed to delete task"
//                     );
//                 }
//             }
//             return;
//         }
//     }

//     async function MoveToTasks(taskId: string, status: number) {
//         if (!projectId) {
//             return;
//         }
//         try{
//             await UpdateTask(
//                 taskId,
//                 projectId,
//                 status
//             );
//             await loadTasks();

//         }catch(error){
//             console.error(error)
//         }
//     }
//     async function onStart(taskId: string) {
//         setError("");
//         try{
//             const startedEntry = await StartTimeEntry({
//                 taskItemId: taskId,
//                 note: "started from frontend"
//             });
//             // await GetActiveTimeEntry();
//             // TimerState();
//             // setActiveEntry(startedEntry);
//         }catch(startError){
//             if (axios.isAxiosError(startError)) {
//                 setError(startError.response?.data?.error ??
//                     startError.response?.data?.message ??
//                     "Failed to start timer"
//                 )
//             }
//         }
//     }
//     return(
//         <div style={{padding:20}}>
//             <h1>Project Tasks</h1>
//             <form onSubmit={HandleCreate}>
//                 <input value={title} placeholder="Task Title" onChange={e=> setTitle(e.target.value)} />
//                 <input type="number" value={estimateMinutes} placeholder="Estimated task length" onChange={e=> setEstimateMinutes(Number(e.target.value))}/>
//                 <button type="submit">Create task</button>
//             </form>

//             {error && (<p role="alert">{error}</p>)}

//             <div style={{
//                 display:"flex",
//                 gap: 20,
//                 marginTop:30
//             }}>
//                 <Column title="Todo"
//                 tasks={tasks.filter(x => x.status === 0)}
//                 onMove={MoveToTasks}
//                 onStart={onStart}
//                 onDelete={HandleDelete}/>

//                 <Column title="In Progress" 
//                 tasks={tasks.filter(x => x.status === 1)}
//                 onMove={MoveToTasks}
//                 onStart={onStart}
//                 onDelete={HandleDelete}/>

//                 <Column title="Done"
//                 tasks={tasks.filter(x => x.status === 2)}
//                 onMove={MoveToTasks}
//                 onStart={onStart}
//                 onDelete={HandleDelete}/>
//                 {/* Import state to  */}
//             </div>
//         </div>
//     );
// }
// interface ColumnProps{
//     title:string;
//     tasks: any[];
//     onMove: (taskId: string, status: number) => void;
//     onStart: (taskId: string) => void
//     onDelete: (taskId: string) => void
// }

// function Column({title, tasks, onMove, onStart, onDelete}:ColumnProps) {
//     return(
//         <div>
//             <h2>{title}</h2>
//             {tasks.map(task =>(
//                 <div key={task.id}>
//                     <h4>{task.title}</h4>
//                     <p>Estimate: {task.estimateMinutes}</p>
//                     <p>Time spent:{}</p>
//                     <button onClick={() => onDelete(task.id)}>Delete Task</button>
//                     <button onClick={() => onMove(task.id, 0)}>Todo</button>
//                     <button onClick={() => onMove(task.id, 1)}>In progress</button>
//                     <button onClick={() => onMove(task.id, 2)}>Done</button>
//                     <button onClick={() => onStart(task.id)}>Start task timer</button>
//                     <Link to={`/tasks/${task.id}/timeEntries`}>Move to entries</Link>    
//                 </div>
//             ))}
//         </div>
//     )
// }