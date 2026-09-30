import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", description: "" });
    const [form, setForm] = useState({ title: "", description: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    // load tasks once when the page opens
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await api.get("/tasks");
                setTasks(data);
            } catch (err) {
                if (err.response?.status === 401) {
                    logout(); // token invalid or expired
                } else {
                    setError(err.response?.data?.message || "Could not load tasks");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addTask = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await api.post("/tasks", form);
            setTasks([data, ...tasks]);
            setForm({ title: "", description: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Could not add task");
        }
    };
    const toggleTask = async (task) => {
        try {
            const { data } = await api.patch(`/tasks/${task._id}`, {
                completed: !task.completed,
            });
            setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
        } catch (err) {
            setError(err.response?.data?.message || "Could not update task");
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter((t) => t._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete task");
        }
    };
    const startEdit = (task) => {
        setEditingId(task._id);
        setEditForm({ title: task.title, description: task.description });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async (id) => {
        if (!editForm.title.trim()) {
            setError("Title cannot be empty");
            return;
        }
        setError("");
        try {
            const { data } = await api.patch(`/tasks/${id}`, editForm);
            setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
            setEditingId(null);
        } catch (err) {
            setError(err.response?.data?.message || "Could not update task");
        }
    };
    const doneCount = tasks.filter((t) => t.completed).length;
    const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
    return (
        <div className="container">
            <div className="card">
                <div className="header">
                    <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="header-text">
                        <h2>Hi, {user.name} 👋</h2>
                        <p>{doneCount} of {tasks.length} tasks completed</p>
                    </div>
                    <button className="btn btn-secondary btn-small" onClick={logout}>Logout</button>
                </div>

                <div className="progress">
                    <div className="progress-bar" style={{ width: `${percent}%` }} />
                </div>

                <form className="add-form" onSubmit={addTask}>
                    <input name="title" placeholder="What needs to be done?" value={form.title} onChange={handleChange} required />
                    <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
                    <button className="btn" type="submit">＋ Add</button>
                </form>

                {error && <div className="error">{error}</div>}
                {loading && <p className="muted">Loading...</p>}
                {!loading && tasks.length === 0 && (
                    <div className="empty">
                        <div className="big">🎯</div>
                        <p>No tasks yet. Add your first one!</p>
                    </div>
                )}

                <ul className="task-list">
                    {tasks.map((task) => (
                        <li className={task.completed ? "task is-done" : "task"} key={task._id}>
                            {editingId === task._id ? (
                                <>
                                    <div className="edit-inputs">
                                        <input name="title" placeholder="What needs to be done?" value={form.title} onChange={handleChange} maxLength={100} required />
                                        <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} maxLength={300} />
                                    </div>
                                    <button className="btn btn-small" onClick={() => saveEdit(task._id)}>Save</button>
                                    <button className="btn btn-small btn-secondary" onClick={cancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
                                    <div className="task-body">
                                        <div className={task.completed ? "task-title done" : "task-title"}>{task.title}</div>
                                        {task.description && <div className="task-desc">{task.description}</div>}
                                    </div>
                                    <button className="btn btn-small btn-secondary" onClick={() => startEdit(task)}>Edit</button>
                                    <button className="btn btn-small btn-danger" onClick={() => deleteTask(task._id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}