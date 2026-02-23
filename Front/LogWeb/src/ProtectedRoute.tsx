import { Navigate } from "react-router-dom";
export default function ProtectedRoute({children}:{children: JSX.Element}){
    const token = localStorage.getItem("token");
    if(!token){
        return <Navigate to="/login" replace/>;
    }

    const payload =JSON.parse(atob(token.split('.')[1]));
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if(role !== "Admin"){
        return <Navigate to="/dashboard" replace/>;
    }
    return children;
}