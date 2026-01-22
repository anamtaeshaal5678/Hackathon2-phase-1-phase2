"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Todo } from "@/types/todo";
import { apiFetch } from "@/lib/api";

import Link from "next/link";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function Dashboard() {
  const router = useRouter();
  const session = authClient.useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.isPending) return;
    if (session.data === null) {
      router.push("/signin");
    } else {
      fetchTodos();
    }
  }, [session.isPending, session.data, router]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/todos");
      setTodos(data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch todos. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const todo = await apiFetch("/todos", {
        method: "POST",
        body: JSON.stringify({
          description: newTodo,
          is_completed: false,
          priority: newPriority
        }),
      });
      setTodos([todo, ...todos]);
      setNewTodo("");
      setNewPriority("medium");
    } catch (e) {
      console.error(e);
      setError("Failed to add todo");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await apiFetch(`/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      console.error(e);
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/todos/${id}`, {
        method: "DELETE"
      });
      setTodos(todos.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      setError("Failed to delete todo");
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  if (session.isPending || loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session.data) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-shadow-sm">System Dashboard</h1>
            <Link
              href="/chat"
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-black hover:opacity-70 transition-all border-b border-black/10 pb-1 w-fit"
            >
              <svg className="w-4 h-4 bg-black text-white rounded-sm p-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.59.233.918.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              Chat System Active →
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{session.data.user.name || session.data.user.email}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold italic">Standard Core Access</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm"
              title="Terminate Session"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        <AnalyticsDashboard />

        <div className="bg-white shadow-xl shadow-black/5 rounded-2xl p-6 mb-8 border border-white/20">
          <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-xl bg-gray-50 border-none shadow-inner focus:ring-2 focus:ring-black sm:text-sm p-4 h-12"
            />
            <div className="flex gap-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="rounded-xl bg-gray-50 border-none text-xs font-bold uppercase tracking-wider px-4 focus:ring-2 focus:ring-black h-12"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                className="whitespace-nowrap inline-flex items-center justify-center px-8 h-12 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-black hover:bg-zinc-800 transition-all active:scale-95"
              >
                Deploy Task
              </button>
            </div>
          </form>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium border border-red-100 italic">Error: {error}</div>}

        <div className="bg-white shadow-xl shadow-black/5 rounded-2xl overflow-hidden border border-white/20">
          <ul className="divide-y divide-gray-50">
            {todos.length === 0 ? (
              <li className="p-12 text-center text-gray-400 font-medium italic">System idle. No active tasks found.</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={todo.is_completed}
                        onChange={() => handleToggle(todo.id, todo.is_completed)}
                        className="peer h-6 w-6 opacity-0 absolute cursor-pointer z-10"
                      />
                      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center border-gray-200 transition-all peer-checked:bg-black peer-checked:border-black`}>
                        {todo.is_completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold transition-all ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-900 font-bold'}`}>
                        {todo.description}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tighter ${getPriorityColor(todo.priority)}`}>
                          {todo.priority || "medium"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Created {new Date(todo.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

