"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Todo } from "@/types/todo";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const session = authClient.useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
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
        body: JSON.stringify({ description: newTodo, is_completed: false }),
      });
      setTodos([...todos, todo]);
      setNewTodo("");
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

  if (session.isPending || loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session.data) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hello, {session.data.user.name || session.data.user.email}</span>
            <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-800">Sign Out</button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleAddTodo} className="flex gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
            />
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Add
            </button>
          </form>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {todos.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No todos yet. Add one above!</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => handleToggle(todo.id, todo.is_completed)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <span className={`text-lg ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {todo.description}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="ml-4 text-sm text-gray-400 hover:text-red-600"
                  >
                    Delete
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
