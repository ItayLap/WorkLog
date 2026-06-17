import React, { useEffect, useState } from "react";
import{
    CreateTask,
    GetTasks,
    UpdateTask
} from "./Api/TaskApi" ;

import {Link, useParams} from "react-router-dom";


export default function ProjectDetailsPage(){
    const {projectId} = useParams();

    const [tasks, setTasks] = useState<any[]>([]);

    const [title, setTitle] = useState("");

    const [estimateMinutes, setEstimateMinutes] = useState(0);
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
    
    return(
        <div style={{padding:20}}>
            <h1>Project Tasks</h1>
            <form onSubmit={HandleCreate}>
                <input value={title} placeholder="Task Title" onChange={e=> setTitle(e.target.value)} />
                <input type="number" value={estimateMinutes} placeholder="Estimated task length" onChange={e=> setEstimateMinutes(Number(e.target.value))}/>
                <button type="submit">Create task</button>
            </form>
            <div style={{
                display:"flex",
                gap: 20,
                marginTop:30
            }}>
                <Column title="Todo"
                tasks={tasks.filter(x => x.status === 0)}
                onMove={MoveToTasks}/>

                <Column title="In Progress"
                tasks={tasks.filter(x => x.status === 1)}
                onMove={MoveToTasks}/>

                <Column title="Done"
                tasks={tasks.filter(x => x.status === 2)}
                onMove={MoveToTasks}/>
            </div>
        </div>
    );
}
interface ColumnProps{
    title:string;
    tasks: any[];
    onMove: (taskId: string, status: number) => void;
}
function Column({title, tasks, onMove}:ColumnProps) {
    return(
        <div>
            <h2>{title}</h2>
            {tasks.map(task =>(
                <div key={task.id}>
                    <h4>{task.title}</h4>
                    <p>Estimate: {task.estimateMinutes}</p>
                    <button onClick={() => onMove(task.id, 0)}>Todo</button>
                    <button onClick={() => onMove(task.id, 1)}>In progress</button>
                    <button onClick={() => onMove(task.id, 2)}>Done</button>
                    <Link to="/:taskId/timeEntries">Move to entries</Link>    
                </div>
            ))}
        </div>
    )
}