import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(null);
    const [modalOpen, setModalOpen] = useState(false); // modal error
    const [loading, setLoading] = useState(false); 
    const dispatch = useDispatch();
    const nav = useNavigate();

    const submit = async e => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
        const result = await dispatch(login({ email, password }));

        if (result.type === 'auth/login/fulfilled') {
            nav('/');
        } else {
            setErr(result.payload || 'Email atau password salah.');
            setModalOpen(true);
        }
        } catch (err) {
        setErr(err.message);
        setModalOpen(true);
        } finally {
        setLoading(false); // selesai loading
        }
    };

    return (
        <div className="container d-flex vh-100 align-items-center justify-content-center">
        <div className="card p-4" style={{ width: 420 }}>
            <h3 className="mb-3">Login</h3>

            <form onSubmit={submit}>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                />
            </div>
            <button className="btn btn-prime w-100">Login</button>
            </form>

            <div className="mt-3 text-center">
            No account? <Link to="/register">Register</Link>
            </div>
        </div>

        {/* Modal error login */}
        {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title text-danger">Login Failed</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                <p>{err}</p>
                </div>
                <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                    Close
                </button>
                </div>
            </div>
            </div>
        </div>
        )}

        {loading && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-3" style={{ alignItems: 'center'}}>
                <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 mb-0">Please wait...</p>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}
