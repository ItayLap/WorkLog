import { Navigate } from "react-router-dom";
import { TimerProvider } from "./TimerContext";
import TimerWidget from "./TimerWidget";
export default function ProtectedRoute({children}:{children: JSX.Element}){
    const token = localStorage.getItem("token");
    if(!token){
        return <Navigate to="/login" replace/>;
    }
    return (<><TimerWidget/>{children};</>);
}