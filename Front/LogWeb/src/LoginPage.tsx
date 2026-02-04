import * as React from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {login} from './Api';
import { useState } from "react";


export default function LoginPage() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try{
            const{token} = await login(email, password);
            localStorage.setItem('token', token);
            navigate('/dashboard');
        }catch{
            setError('Invalid email or password');
        }
    }
    return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <Card style={{width: 380}}>
            <Card.Body>
                <Card.Title className="mb-4 text-center">WorkLog -- Login</Card.Title>

                {error && <div className="text-danger text-center mb3">{error}</div>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">Login</Button>
                </Form>

                <div className="text-center mt-3">
                    <small>
                        No account <Link to="/register">Register</Link>
                    </small>
                </div>
                
            </Card.Body>

        </Card>
    </div>
);
}