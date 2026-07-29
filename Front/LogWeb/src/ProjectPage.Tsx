import React, { useEffect, useState } from "react";
import{
    CreateProject,
    DeleteProject,
    GetProjects
} from "./Api/ProjectApi" ;

import {Link} from "react-router-dom";
import { create } from "axios";
import axios  from "axios";

export default function ProjectPage(){

    const [error, setError] = useState("");

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
        const shouldDelete = window.confirm(
            "Delete this task?"
        );
        if (shouldDelete) {
            try{
                await DeleteProject(id);
                loadProjects();
            }catch(deleteError){
                if (axios.isAxiosError(deleteError)) {
                    setError(
                        deleteError.response?.data?.error ?? "Failed to delete Project"
                    );
                }
            }
        }
        return;
    }

    return(
        <div style={{padding: 20}}>
            <div className="projects-page">
                <div className="projects-header">
                    <h1>Projects</h1>
                    <p>Create and manage your workLog projects</p>
                </div>
            </div>
            <div className="create-project-card">
                <form className="create-project-form" onSubmit={handleCreate}>
                    <input placeholder="Project name" value={name} onChange={e=> setName(e.target.value)}/>
                    <button type="submit">Create</button>
                </form>
            </div>
            <div className="projects-grid">
                {projects.map(project =>(
                    <div key={project.id} className="project-card">
                        <h3>{project.name}</h3>
                        <div className="project-actions">
                            <Link to={`/projects/${project.id}`} className="open-button">Open project</Link>
                            <button onClick={() => handleDelete(project.id)} className="delete-button">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

}
