import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import DashboardPage from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Logout from "./Logout";

export default function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
                <Route path="*" element={<Navigate to="/login" replace />}/>
            </Routes>
        </BrowserRouter>
    );
}
