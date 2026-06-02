import { data } from "react-router-dom";
import Api from "../Api";

export interface StartTimeEntryRequest{
    taskItemId: string;
    note? : string;
}
export interface StopTimeEntryRequest{
    note? : string;
}

export async function getMyEntries() {
    const responce = await Api.get("time-entries/my");

    return responce.data;
}

export async function StartTimeEntry(data: StartTimeEntryRequest) { 
    const responce = await Api.post("/time-entries/start", data);
    return responce.data;
}
export async function StopTimeEntry(data: StopTimeEntryRequest, Id: string) { 
    const responce = await Api.post(`/time-entries/${Id}/stop`, data);
    return responce.data;
}

export async function DeleteEntry(id: string) 
{ 
    const responce = await Api.delete(`/time-entries/${id}`)
    return responce.data;
}
