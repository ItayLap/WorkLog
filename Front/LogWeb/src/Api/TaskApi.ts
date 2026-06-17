import { data } from "react-router-dom";
import Api from "../Api";

export interface CreateTaskRequest{
    title: string;
    estimateMinutes: number;
}

export async function GetTasks(projectId: string) {
    const responce = await Api.get(`/projects/${projectId}/tasks`);

    return responce.data;
}

export async function CreateTask(data: CreateTaskRequest, projectId: String) { 
    const responce = await Api.post(`/projects/${projectId}/tasks`, data);

    return responce.data;
}

export async function DeleteTask(id: string, projectId: String) 
{ 
    await Api.delete(`/projects/${projectId}/tasks/${id}`)
}

export async function UpdateTask(taskId: string, projectId: String, status: number) {
    const responce = await Api.put(`/projects/${projectId}/tasks/${taskId}`, {status});
    return responce.data;
}