import React, { useEffect, useState } from "react";
import{
    CreateProject,
    DeleteProject,
    GetProjects
} from "./Api/ProjectApi" ;

import {Link} from "react-router-dom";
import { create } from "axios";
export default function ProjectPage(){

    const [projects, setProjects] = useState<any[]>([]);

    const [name, setName] = useState("");

    async function loadProjects() {
        try{
            const data = await GetProjects();
            setProjects(data);
        }catch(error){
            console.error(error);
        }
    }

    useEffect(() =>{
        loadProjects();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try{
            await CreateProject({name});
            setName("");
            loadProjects();
        }catch(error){
            console.error(error);
        }
    }

    async function handleDelete(id: string) {
        try{
            await DeleteProject(id);
            loadProjects();
        }catch (error){
            console.error(error);
        }
    }
    return(
        <div style={{padding: 20}}>
            <h1>Projects</h1>
            <form onSubmit={handleCreate}>
                <input placeholder="Project name" value={name} onChange={e=> setName(e.target.value)}/>
                <button type="submit">Create</button>
            </form>
            <div style={{marginTop: 20}}>
                {projects.map(project =>(
                    <div key={project.id} style={{border:"1px solid gray", padding: 12,marginBottom: 10}}>
                        <h3>{project.name}</h3>
                        <Link to={`/projects/${project.id}`}>Open project</Link>
                        <button onClick={() => handleDelete(project.id)} style={{marginLeft: 10}}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    )

}
