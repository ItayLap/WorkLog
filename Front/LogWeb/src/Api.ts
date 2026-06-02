import axios from "axios"; //
const API_URL = '/Api';
const Api = axios.create({baseURL:"http://localhost:5067/api"});

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

Api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers .Authorization = `Bearer ${token}`;
    }
    return config;
});

export default Api;