import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import DashboardPage from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AdminPage from "./AdminPage";
import Logout from "./Logout";
import AdminRoute from "./AdminRoute";
import ProjectPage from "./ProjectPage"
import ProjectDetailsPage from "./ProjectDetailsPage"
import TimeEntriesPage from "./TimeEntriesPage"

export default function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
                <Route path="/projects" element={<ProtectedRoute><ProjectPage/></ProtectedRoute>}/>
                <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailsPage/></ProtectedRoute>}/>
                <Route path="/:taskId/timeEntries" element={<ProtectedRoute><TimeEntriesPage/></ProtectedRoute>}/>
                <Route path="/admin" element={<AdminRoute><AdminPage/></AdminRoute>}/>
                <Route path="*" element={<Navigate to="/login" replace />}/>
            </Routes>
        </BrowserRouter>
    );
}
