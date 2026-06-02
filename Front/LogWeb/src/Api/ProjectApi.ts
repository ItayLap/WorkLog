import { data } from "react-router-dom";
import Api from "../Api";

export interface CreateProjectRequest{
    name : string;
}

export async function GetProjects() {
    const responce = await Api.get("/projects");

    return responce.data;
}

export async function CreateProject(data: CreateProjectRequest) { 
    const responce = await Api.post("/projects", data);
    return responce.data;
}

export async function DeleteProject(id: string) 
{ 
    await Api.delete(`/projects/${id}`)
}
