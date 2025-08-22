import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register(){
  const [name,setName]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [role,setRole]=useState('member');
    const [err,setErr]=useState(null);
    const nav = useNavigate();

    const submit = async e => {
        e.preventDefault();
        setErr(null);
        try {
        await api.post('/register', { name, email, password, role });
        nav('/login');
        } catch (error) {
        setErr(error.response?.data?.message || JSON.stringify(error.response?.data) || error.message);
        }
    };

    return (
        <div className="container d-flex vh-100 align-items-center justify-content-center">
        <div className="card p-4" style={{width: 420}}>
            <h3 className="mb-3">Register</h3>
            {err && <div className="alert alert-danger">{err}</div>}
            <form onSubmit={submit}>
            <input className="form-control mb-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required/>
            <input className="form-control mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
            <select className="form-select mb-3" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
            </select>
            <button className="btn btn-prime w-100">Register</button>
            </form>
            <div className="mt-3 text-center">Already have account? <Link to="/login">Login</Link></div>
        </div>
        </div>
    );
}
