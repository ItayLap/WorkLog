import { Link } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getRoleFromToken } from "./utils/auth";

export default function DashboardPage(){
    const role = getRoleFromToken();
    return(
        <div className="container mt-5">
            <h2>welcome to WorkLog</h2>
            <p>You are logged in.</p>
            <Link to="/logout">
                <Button variant="danger">Logout</Button>
            </Link>

            <Card className="p-3 mt-3">
                <h5>User Panel</h5>
                <p>avaliblewesf for all userd</p>
            </Card>{role === "Admin" &&(
                <Card className="p-3 mt-3 border-danger">
                    <h5>Admin Panel</h5>
                    <p>avaliblewesf for ONLYYY Admins</p>
                    <Button variant="danger" >Manage Users</Button>
                </Card>
            )}
        </div>
    );
}