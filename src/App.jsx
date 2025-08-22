import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { setSessionExpiredHandler } from './api/api';

export default function App(){
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setSessionExpired(true);
    });
  }, []);

  const handleOk = () => {
    setSessionExpired(false);
    window.location.href = '/login';
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail/></ProtectedRoute>} />
      </Routes>

      {/* Modal Session Timeout */}
      {sessionExpired && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{zIndex: 99999}}>
              <div className="modal-header">
                <h5 className="modal-title">Session Timeout</h5>
              </div>
              <div className="modal-body">
                <p>Your session has expired. Please login again.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleOk}>OK</button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
}
