import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

export default function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="*" element={<Navigate to="/login" replace />}/>
            </Routes>
        </BrowserRouter>
    );
}
