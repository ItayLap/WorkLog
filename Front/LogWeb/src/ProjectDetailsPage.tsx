import React, { useEffect, useState } from "react";
import{
    CreateTask,
    GetTasks,
    UpdateTask
} from "./Api/TaskApi" ;

import {Link, useParams} from "react-router-dom";
import { create } from "axios";
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
        }catch(error){
            console.error(error);
        }
    }
    useEffect(()=>{
        loadTasks();
    },[])

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
        
            // loadTasks();

        }catch(error){
            console.error(error);
        }
    }
}
