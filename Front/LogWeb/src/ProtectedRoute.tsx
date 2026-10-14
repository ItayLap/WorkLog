import { Navigate } from "react-router-dom";
import { TimerProvider } from "./utils/TimerContext";
import TimerWidget from "./TimerWidget";
import EstimateAlert from "./utils/EstimateAlert";

export default function ProtectedRoute({children}:{children: JSX.Element}){
    const token = localStorage.getItem("token");
    if(!token){
        return <Navigate to="/login" replace/>;
    }
    return (<><TimerWidget/><EstimateAlert></EstimateAlert>{children}</>);
}