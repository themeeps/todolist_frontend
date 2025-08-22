import React, { useEffect, useState, useRef } from 'react';
import api from '../api/api';
import { useSelector } from 'react-redux';
import defaultUser from "../assets/default_user.png";

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selProject, setSelProject] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalProfilOpen, setModalProfilOpen] = useState(false);

    // Update Task
    const [modalTaskOpen, setModalTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    //Create Task
    const [modalCreateTaskOpen, setModalCreateTaskOpen] = useState(false);
    const [newTaskProject, setNewTaskProject] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState(   '');
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
    const [allUsers, setAllUsers] = useState([]);

    // Create Project
    const [modalCreateProjectOpen, setModalCreateProjectOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectStartDate, setNewProjectStartDate] = useState('');
    const [newProjectEndDate, setNewProjectEndDate] = useState('');

    // Edit Project
    const [modalEditProjectOpen, setModalEditProjectOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editProjectTitle, setEditProjectTitle] = useState('');
    const [editProjectDescription, setEditProjectDescription] = useState('');
    const [editProjectStartDate, setEditProjectStartDate] = useState('');
    const [editProjectEndDate, setEditProjectEndDate] = useState('');

    //Users
    const [users, setUsers] = useState([]);

    const [statusFilter, setStatusFilter] = useState('');
    const [assignedUserFilter, setAssignedUserFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTasks = tasks.filter(task => {
    let matchesStatus = statusFilter ? task.status === statusFilter : true;
    let matchesUser = assignedUserFilter ? task.assigned_to === parseInt(assignedUserFilter) : true;
    let matchesSearch = searchQuery
        ? (task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

    return matchesStatus && matchesUser && matchesSearch;
    });

    useEffect(() => {
        api.get('/users').then(res => setUsers(res.data));
    }, []);

    const openEditProjectModal = (project) => {
        setSelectedProject(project);
        setEditProjectTitle(project.title);
        setEditProjectDescription(project.description || '');
        setEditProjectStartDate(project.start_date || '');
        setEditProjectEndDate(project.end_date || '');
        setModalEditProjectOpen(true);
    };

    const deleteProject = async (projectId) => {
    if(!confirm("Are you sure to delete this project?")) return;
    try {
        await api.delete(`/projects/${projectId}`);
        fetchProjects(); 
    } catch(e) {
        console.error(e);
        alert("Failed to delete project");
    }
    };

    const user = useSelector(s => s.auth.user);
    const dropdownRef = useRef(null);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        const res = await api.get('/projects');
        setProjects(res.data.data ?? res.data);
    };

    const fetchTasks = async (projectId) => {
        const res = await api.get('/tasks', { params: { project_id: projectId } });
        setTasks(res.data.data ?? res.data);
    };

    const onSelect = (p) => {
        setSelProject(p);
        fetchTasks(p.id);
    };

    const logout = async () => {
        try {
        await api.post('/logout');
        } catch (e) {
        console.error('Logout error:', e);
        } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        }
    };

  // ✨ Task Modal
    const openTaskModal = async (taskId) => {
    try {
        const resTask = await api.get(`/tasks/${taskId}`);
        const task = resTask.data;

        // jika member, hanya boleh membuka task miliknya
        if(user.role !== 'admin' && task.assigned_to !== user.id && task.owner_id !== user.id) {
        return alert("You are not allowed to access this task");
        }

        // ambil semua user untuk dropdown assign (admin saja)
        const resUsers = await api.get('/users');
        setSelectedTask({ ...task, users: resUsers.data });
        setModalTaskOpen(true);

    } catch (e) {
        console.error(e);
        alert("Task not found or error loading task.");
    }
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
        await api.put(`/tasks/${taskId}`, { status });
        openTaskModal(taskId); 
        fetchTasks(selProject.id);
        } catch (e) {
        console.error(e);
        alert("Failed to update status");
        }
    };

    const assignTaskTo = async (taskId, assigned_to) => {
        try {
        await api.post(`/tasks/${taskId}/assign`, { assigned_to });
        openTaskModal(taskId); 
        fetchTasks(selProject.id);
        } catch (e) {
        console.error(e);
        alert("Failed to assign task (check permissions)");
        }
    };

    const openCreateTaskModal = async () => {
        try {
            const resUsers = await api.get('/users');
            setAllUsers(resUsers.data);
            setModalCreateTaskOpen(true);
        } catch(e) {
            console.error(e);
            alert("Failed to load users");
        }
    };

    const deleteTask = async (taskId) => {
        if(!confirm("Are you sure to delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks(selProject.id); 
        } catch(e) {
            console.error(e);
            alert("Failed to delete task");
        }
    };

    return (
        <div className="container d-flex vh-100 align-items-center justify-content-center">
        <div className="container py-4">
            <div className="card card-dashboard">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Dashboard To-do List</h2>

                {/* Profil + Dropdown */}
                <div className="position-relative" ref={dropdownRef}>
                <div
                    className="d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <img
                    src={defaultUser}
                    alt={user?.name}
                    className="rounded-circle me-2"
                    style={{ width: 40, height: 40 }}
                    />
                    <span>{user?.name}</span>
                </div>

                {dropdownOpen && (
                    <div
                    className="position-absolute bg-white shadow rounded"
                    style={{ right: 0, top: '100%', minWidth: 120, zIndex: 1000, padding: 10 }}
                    >
                    <button
                        className="dropdown-item"
                        onClick={() => { setModalProfilOpen(true); setDropdownOpen(false); }}
                    >
                        Profile
                    </button>
                    <hr style={{ margin: 2 }} />
                    <button
                        className="dropdown-item text-danger"
                        onClick={() => { logout(); setDropdownOpen(false); }}
                    >
                        Logout
                    </button>
                    </div>
                )}
                </div>
            </div>

            <div className="row">
                <div className="col-md-5">
                    <div className="d-flex justify-content-between align-items-center">
                    <h5>Projects</h5>
                    {user?.role === 'admin' && (
                        <button
                            className="btn btn-prime mb-2"
                            onClick={() => setModalCreateProjectOpen(true)}
                        >
                            + Create Project
                        </button>
                        )}
                    </div>
                <ul className="list-group">
                    {projects.map(p => (
                    <li
                            key={p.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${selProject?.id === p.id ? 'bg-select' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onSelect(p)}
                        >
                        <div>{p.title ?? p.name}</div>
                        {user?.role === 'admin' && (
                        <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-warning" onClick={() => openEditProjectModal(p)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteProject(p.id)}>Delete</button>
                        </div>
                        )}
                    </li>
                    ))}
                </ul>
                {/* {user?.role === 'admin' && <button className="btn btn-primary mt-3" onClick={() => alert('create project modal')}>Create Project</button>} */}
                </div>

                <div className="col-md-7">
                <div className="d-flex justify-content-between align-items-center">
                    <h5>{selProject ? `Tasks — ${selProject.title ?? selProject.name}` : ''}</h5>
                    {user?.role === 'admin' && selProject && (
                    <button
                        className="btn btn-prime mb-2"
                        onClick={openCreateTaskModal}
                    >
                        + Create Task
                    </button>
                    )}
                </div>

                {/* Filter & Search Controls */}
                <div className="d-flex gap-2 mb-3">
                    <select
                    className="form-select w-auto"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    >
                    <option value="">All Status</option>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    </select>

                    <select
                    className="form-select w-auto"
                    value={assignedUserFilter}
                    onChange={e => setAssignedUserFilter(e.target.value)}
                    >
                    <option value="">All Users</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                    </select>

                    <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Search task..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* List Tasks */}
                <ul className="list-group">
                    {filteredTasks.map(t => (
                    <li
                        key={t.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <div>
                        <span
                            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                            onClick={() => openTaskModal(t.id)}
                        >
                            {t.title}
                        </span>
                        <div className="text-muted small">status: {t.status}</div>
                        </div>
                        <div>{t.assigned_user?.name ?? t.assignedUser?.name ?? '—'}</div>

                        {user?.role === 'admin' && (
                        <button
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => deleteTask(t.id)}
                        >
                            Delete
                        </button>
                        )}
                    </li>
                    ))}
                </ul>
                </div>

            </div>
            </div>
        </div>

        {/* Modal Profil */}
        {modalProfilOpen && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Profile</h5>
                    <button type="button" className="btn-close" onClick={() => setModalProfilOpen(false)}></button>
                </div>
                <div className="modal-body text-center">
                    <img src={defaultUser} className="rounded-circle mb-3" style={{ width: 100, height: 100 }} />
                </div>
                <div className="mx-3">
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModalProfilOpen(false)}>Close</button>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Modal Task */}
        {modalTaskOpen && selectedTask && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{selectedTask.title}</h5>
                    <button type="button" className="btn-close" onClick={() => { setSelectedTask(null); setModalTaskOpen(false); }}></button>
                </div>
                <div className="modal-body">
                    <p>{selectedTask.description}</p>
                    <p>
                        <strong>Start Date:</strong> {selectedTask.project?.start_date || '—'}<br />
                        <strong>End Date:</strong> {selectedTask.project?.end_date || '—'}
                    </p>
                    <div className="mb-3">
                        <select
                            className="form-select w-auto d-inline-block me-2"
                            value={selectedTask.status}
                            onChange={e => updateTaskStatus(selectedTask.id, e.target.value)}
                            disabled={!(user.role === 'admin' || selectedTask.owner_id === user.id || selectedTask.assigned_to === user.id)}
                            >
                            <option value="todo">todo</option>
                            <option value="in_progress">in_progress</option>
                            <option value="done">done</option>
                        </select>

                    {user?.role === 'admin' && (
                        <select
                        className="form-select w-auto d-inline-block"
                        value={selectedTask.assigned_to || ''}
                        onChange={e => assignTaskTo(selectedTask.id, e.target.value)}
                        >
                        <option value="">-- assign to --</option>
                        {selectedTask.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => { setSelectedTask(null); setModalTaskOpen(false); }}>Close</button>
                </div>
                </div>
            </div>
            </div>
        )}

        {modalCreateTaskOpen && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">Create Task</h5>
                    <button type="button" className="btn-close" onClick={() => setModalCreateTaskOpen(false)}></button>
                    </div>
                    <div className="modal-body">
                    <div className="mb-3">
                        <label className="form-label">Project</label>
                        <select
                        className="form-select"
                        value={newTaskProject}
                        onChange={e => setNewTaskProject(e.target.value)}
                        >
                        <option value="">-- select project --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.title ?? p.name}</option>)}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                        type="text"
                        className="form-control"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                        className="form-control"
                        value={newTaskDescription}
                        onChange={e => setNewTaskDescription(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Assign to</label>
                        <select
                        className="form-select"
                        value={newTaskAssignedTo}
                        onChange={e => setNewTaskAssignedTo(e.target.value)}
                        >
                        <option value="">-- select user --</option>
                        {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    </div>

                    <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModalCreateTaskOpen(false)}>Close</button>
                    <button className="btn btn-primary" onClick={async () => {
                        if(!newTaskProject || !newTaskTitle) return alert("Project & Title are required");
                        try {
                        await api.post('/tasks', {
                            project_id: newTaskProject,
                            title: newTaskTitle,
                            description: newTaskDescription,
                            status: 'todo',
                            assigned_to: newTaskAssignedTo || null
                        });

                        // refresh task list jika project sama dengan yang sedang dipilih
                        if(selProject?.id == newTaskProject) fetchTasks(selProject.id);

                        setModalCreateTaskOpen(false);
                        setNewTaskProject('');
                        setNewTaskTitle('');
                        setNewTaskDescription('');
                        setNewTaskAssignedTo('');
                        } catch(e) {
                        console.error(e);
                        alert("Failed to create task");
                        }
                    }}>Create</button>
                    </div>
                </div>
                </div>
            </div>
            )}

            {modalCreateProjectOpen && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">Create Project</h5>
                    <button type="button" className="btn-close" onClick={() => setModalCreateProjectOpen(false)}></button>
                    </div>
                    <div className="modal-body">
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                        type="text"
                        className="form-control"
                        value={newProjectTitle}
                        onChange={e => setNewProjectTitle(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                        className="form-control"
                        value={newProjectDescription}
                        onChange={e => setNewProjectDescription(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                        type="date"
                        className="form-control"
                        value={newProjectStartDate}
                        onChange={e => setNewProjectStartDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                        type="date"
                        className="form-control"
                        value={newProjectEndDate}
                        onChange={e => setNewProjectEndDate(e.target.value)}
                        />
                    </div>
                    </div>
                    <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModalCreateProjectOpen(false)}>Close</button>
                    <button className="btn btn-primary" onClick={async () => {
                        if(!newProjectTitle) return alert("Title is required");
                        try {
                        await api.post('/projects', {
                            title: newProjectTitle,
                            description: newProjectDescription,
                            start_date: newProjectStartDate || null,
                            end_date: newProjectEndDate || null
                        });

                        fetchProjects(); // refresh project list

                        setModalCreateProjectOpen(false);
                        setNewProjectTitle('');
                        setNewProjectDescription('');
                        setNewProjectStartDate('');
                        setNewProjectEndDate('');
                        } catch(e) {
                        console.error(e);
                        alert("Failed to create project");
                        }
                    }}>Create</button>
                    </div>
                </div>
                </div>
            </div>
            )}

            {modalEditProjectOpen && selectedProject && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h5 className="modal-title">Edit Project</h5>
                        <button type="button" className="btn-close" onClick={() => setModalEditProjectOpen(false)}></button>
                        </div>
                        <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                            type="text"
                            className="form-control"
                            value={editProjectTitle}
                            onChange={e => setEditProjectTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                            className="form-control"
                            value={editProjectDescription}
                            onChange={e => setEditProjectDescription(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Start Date</label>
                            <input
                            type="date"
                            className="form-control"
                            value={editProjectStartDate}
                            onChange={e => setEditProjectStartDate(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">End Date</label>
                            <input
                            type="date"
                            className="form-control"
                            value={editProjectEndDate}
                            onChange={e => setEditProjectEndDate(e.target.value)}
                            />
                        </div>
                        </div>
                        <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setModalEditProjectOpen(false)}>Close</button>
                        <button className="btn btn-primary" onClick={async () => {
                            if(!editProjectTitle) return alert("Title is required");
                            try {
                            await api.put(`/projects/${selectedProject.id}`, {
                                title: editProjectTitle,
                                description: editProjectDescription,
                                start_date: editProjectStartDate || null,
                                end_date: editProjectEndDate || null
                            });
                            fetchProjects();
                            setModalEditProjectOpen(false);
                            } catch(e) {
                            console.error(e);
                            alert("Failed to update project");
                            }
                        }}>Save Changes</button>
                        </div>
                    </div>
                    </div>
                </div>
                )}



        </div>
    );
}
