import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";

export default function Adminpage(){
    const [users, setUsers] = useState<any[]>([]);

    const token =localStorage.getItem("token");
    useEffect(() => {
        fetch("/api/admin/users",{
            headers:{
                Authorization: `Bearer ${token}`
            }
        }).then(res => {
            if(!res.ok){
                throw new Error("Failed to fetch users");
            }
            return res.json();
        })
        .then(data => setUsers(data))
        .catch(err => console.error(err));
    }, [])

    const changeRole = async(id: string, role: string) =>{
        await fetch(`/api/admin/set-role?userId=${id}&role=${role}`,{
            method: "PUT",
            headers: {
                Authorization: `Bearer${token}`
            }
        });
        window.location.reload();
    };
    return (
        <div className="container mt-4">
        
            <h3>Admin Panel</h3>
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