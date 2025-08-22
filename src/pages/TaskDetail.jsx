import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export default function TaskDetail(){
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(()=> { load(); fetchUsers(); }, [id]);

  async function load(){ const res = await api.get(`/tasks/${id}`); setTask(res.data); }
  async function fetchUsers(){ 
    try { 
            const r = await api.get('/users'); setUsers(r.data); 
        } catch (e) {
            console.error("Terjadi error:", e);
        }
    }

  const updateStatus = async (status) => { await api.put(`/tasks/${id}`, { status }); load(); }
  const assignTo = async (assigned_to) => { await api.post(`/tasks/${id}/assign`, { assigned_to }); load(); }

  if(!task) return <div className="container py-4">Loading...</div>;

  return (
    <div className="container py-4">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="mb-3">
        <select className="form-select w-auto d-inline-block me-2" defaultValue={task.status} onChange={e=>updateStatus(e.target.value)}>
          <option value="todo">todo</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
        </select>

        <select className="form-select w-auto d-inline-block" defaultValue={task.assigned_to || ''} onChange={e=>assignTo(e.target.value)}>
          <option value="">-- assign to --</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
    </div>
  );
}
