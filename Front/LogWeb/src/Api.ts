const API_URL = '/api';

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password}),
    });
    if(!res.ok){
        throw new Error('Invalid credentials');
    }
    return res.json(); //{token}
}

export async function register(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password}),
    });
    if(!res.ok){
        throw new Error('Invalid credentials');
    }
    return res.json(); //{token}
}