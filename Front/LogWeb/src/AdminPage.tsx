import { useEffect, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
type UserRow = {
    id: string;
    email:string;
    role: string;
}

export default function Adminpage(){
    const [users, setUsers] = useState<UserRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("token");

    async function loadUsers () {
        setError("")
        if (!token) return;

        try {
            const res = await fetch("/api/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok)
            {
                throw new Error("Failed to fetch users");
            }

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError("Failed to load users");
            console.error(err);
        }
    };
    useEffect(() => {
        loadUsers();

    }, []);

    async function  changeRole (id: string, role: "Admin" | "User") {
        if (!token)return;
            
        try{
            const res = await fetch(`/api/admin/set-role?userId=${id}&role=${role}`,{
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            loadUsers();
        }catch(err){
             setError("failed to update role");
             console.error(err);
        }
    };
    return (
        <div className="container mt-4">
        
            <h3>Admin Panel</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td><Button 
                                size="sm" 
                                variant="warning" 
                                onClick={() => changeRole(u.id, "Admin")}>
                                    Set admin role
                                </Button>
                                {" "}
                                <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => changeRole(u.id, "User")}>
                                    Set user role
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}