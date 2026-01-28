"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Todo } from "@/types/todo";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";

const TABS = [
  { id: "sp0", label: "SP-0: Constitution" },
  { id: "sp1", label: "SP-1: Specification" },
  { id: "sp2", label: "SP-2: Plan" },
  { id: "sp3", label: "SP-3: Tasks" },
  { id: "sp5", label: "SP-5: Tasks" },
];

const MOCK_PODS = [
  { name: "todo-backend-678d6778f7-j7jt", ready: "1/1", status: "Running", restarts: 0, age: "14d" },
  { name: "todo-backend-678d6778f7-gibxj", ready: "1/1", status: "Running", restarts: 0, age: "14d" },
  { name: "todo-frontend-5bc8c8d977-bsvzr", ready: "1/1", status: "Running", restarts: 0, age: "465s" },
  { name: "todo-frontend-5bc8c8d977-iftzh", ready: "1/1", status: "Running", restarts: 0, age: "14d" },
];

export default function Dashboard() {
  const router = useRouter();
  const session = authClient.useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sp0");

  useEffect(() => {
    if (session.isPending) return;
    if (session.data === null) {
      router.push("/signin");
    } else {
      fetchTodos();
      fetchSystemStatus();
      fetchStats();

      // Auto-refresh every 10 seconds for real-time monitoring feel
      const interval = setInterval(() => {
        fetchTodos(true); // Pass true for silent update
        fetchSystemStatus();
        fetchStats();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [session.isPending, session.data, router]);

  const fetchSystemStatus = async () => {
    try {
      const data = await apiFetch("/system/status");
      setSystemStatus(data);
    } catch (e) {
      console.error("Failed to fetch system status:", e);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiFetch("/todos/stats");
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  const fetchTodos = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await apiFetch("/todos");
      setTodos(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const todo = await apiFetch("/todos", {
        method: "POST",
        body: JSON.stringify({
          title: newTodo,
          description: "",
          is_completed: false,
          priority: "medium"
        }),
      });
      setTodos([todo, ...todos]);
      setNewTodo("");
    } catch (e) {
      console.error(e);
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
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  if (session.isPending || loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] p-4 lg:p-8 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-40 bg-white/50 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white/50 rounded-xl" />
            <div className="h-96 bg-white/50 rounded-xl" />
          </div>
          <div className="h-64 bg-white/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-700 font-sans p-4 lg:p-8 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Phase Header Card */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/40">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Phase IV — Spec-Driven Development <span className="text-slate-400 font-normal">(SP Constitution)</span>
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded transition-colors"
              >
                Terminate Session
              </button>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300" />)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-slate-200/50 p-1 flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[#4a5568] text-white shadow-sm"
                  : "text-slate-500 hover:bg-white/50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {[
              { label: "Spec-First", desc: "No action without a written spec." },
              { label: "AI-Only Execution", desc: "Docker AI, kubectl-ai, kagent" },
              { label: "Local-Only Deployment", desc: "Minikube, no cloud" },
              { label: "Reviewable Artifacts", desc: "Prompts, outputs, errors." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                  ✓
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-800 whitespace-nowrap">{item.label}:</span>
                  <span className="text-slate-600">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights Bar */}
          <div className="bg-[#4a5568] p-4 flex flex-wrap gap-4 lg:gap-8 items-center text-[10px] lg:text-[11px] font-mono text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">●</span>
              <span className="uppercase text-white/50 whitespace-nowrap">Intelligence:</span>
              <span className="font-bold">ENABLED</span>
            </div>
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-white/50 whitespace-nowrap">Completion:</span>
                  <span className="font-bold">{stats.completion_rate}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-white/50 whitespace-nowrap">Pending:</span>
                  <span className="font-bold">{stats.pending_tasks}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="uppercase text-white/50 whitespace-nowrap">Priority:</span>
                  <div className="flex gap-2">
                    <span className="bg-red-500/20 text-red-400 px-1.5 rounded">H:{stats.priority_breakdown?.high || 0}</span>
                    <span className="bg-amber-500/20 text-amber-400 px-1.5 rounded">M:{stats.priority_breakdown?.medium || 0}</span>
                    <span className="bg-blue-500/20 text-blue-400 px-1.5 rounded">L:{stats.priority_breakdown?.low || 0}</span>
                  </div>
                </div>
                <div className="flex-1 flex justify-end gap-2 italic text-emerald-400 min-w-[200px]">
                  <span className="text-white/30 whitespace-nowrap">NEXT SUGGESTED SPEC:</span>
                  <span className="truncate">{todos.length === 0 ? "Initialize core service architecture" : "Optimize container orchestration parameters"}</span>
                </div>
              </>
            )}
            {!stats && <span className="animate-pulse">GATHERING INSIGHTS...</span>}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Specification & Pods */}
          <div className="space-y-6">

            <div className="glass-card rounded-xl overflow-hidden min-h-[400px]">
              <div className="bg-slate-100/80 px-4 py-3 flex items-center justify-between border-b border-white/40">
                <h2 className="text-sm font-bold tracking-wider text-slate-800">SP-0: Specification</h2>
                <div className="flex items-center gap-2 text-[10px] bg-white/60 px-2 py-1 rounded border border-white/40 font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Kubernetes SOC99+ 14d Logstore 2.7
                </div>
              </div>

              <div className="p-4 space-y-4">
                <form onSubmit={handleAddTodo} className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-white/50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button type="submit" className="bg-[#4a5568] text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:opacity-90">
                    Add
                  </button>
                </form>

                <div className="space-y-1">
                  {todos.length === 0 && !loading && (
                    <div className="py-20 text-center text-[10px] uppercase tracking-widest text-slate-300 font-bold italic">
                      SYSTEM IDLE // NO SPECIFICATIONS LOADED
                    </div>
                  )}
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-center justify-between p-3 bg-white/40 rounded-lg group border border-transparent hover:border-white/60 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={todo.is_completed}
                          onChange={() => handleToggle(todo.id, todo.is_completed)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm font-medium ${todo.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {todo.title}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(todo.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="w-4 h-4 bg-slate-800 rounded flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18.286c-3.472 0-6.286-2.814-6.286-6.286s2.814-6.286 6.286-6.286 6.286 2.814 6.286 6.286-2.814 6.286-6.286 6.286z" /></svg>
                    </span>
                    Running on <span className="text-slate-800">Kubernetes <span className="font-normal opacity-60">(Minikube)</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pods Initial Section */}
            <div className="glass-card rounded-xl overflow-hidden p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Kubernetes Pods
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/40">
                    <th className="pb-2">Pod Name</th>
                    <th className="pb-2">Ready</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium text-slate-600">
                  {(systemStatus?.pods || MOCK_PODS).slice(0, 4).map((pod: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 font-mono text-[10px]">{pod.name}</td>
                      <td className="py-2.5">{pod.ready}</td>
                      <td className="py-2.5 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${pod.status === 'Running' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_5px_rgba(16,185,129,0.5)]`} />
                        {pod.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Right Column: Chatbot & Pod Stats */}
          <div className="space-y-6">

            {/* Chatbot Card */}
            <div className="glass-card rounded-xl overflow-hidden flex flex-col min-h-[500px]">
              <div className="bg-slate-100/80 px-4 py-3 flex items-center justify-between border-b border-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-800">Chatbot</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-2 py-1 rounded border border-white/40 font-bold text-[10px] text-slate-500">
                  Minikube
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>

            {/* Service Controls Section */}
            <div className="flex flex-wrap gap-2">
              <button className="bg-white/60 border border-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                Todo Backend Pods
              </button>
              <button className="bg-white/60 border border-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                Todo Service
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                System Details & Services
              </h2>
              <div className="space-y-2">
                {(systemStatus?.services || ["Todo Backend (Public)", "Backend Deployment (Helm)"]).map((service: string, i: number) => (
                  <div key={i} className="bg-white/60 border border-white p-3 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.944a1 1 0 10-1.414-1.414l.707-.707a1 1 0 101.414 1.414l-.707.707zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zM12.939 16.222a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 111.414-1.414l.707.707zM6.126 12.651a1 1 0 10-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{service}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">0.1ms</span>
                  </div>
                ))}
              </div>

              {/* Health Monitor Alert Panel */}
              <div className="pt-4 border-t border-slate-200">
                <h2 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-[0.2em]">Health Monitor</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg">
                    <div className="text-[10px] font-bold text-amber-600 mb-0.5">Next.js 16.1.1</div>
                    <div className="text-[8px] text-amber-500 uppercase tracking-tighter">Status: STALE</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                    <div className="text-[10px] font-bold text-emerald-600 mb-0.5">Turbopack</div>
                    <div className="text-[8px] text-emerald-500 uppercase tracking-tighter">Status: OPTIMIZED</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg col-span-2 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400 uppercase text-[9px]">Runtime Context:</span>
                    <span className="text-slate-800 font-bold">STABLE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Pods Table at bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-tighter">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Kubernetes Pods
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/40">
                    <th className="pb-3">Pod Name</th>
                    <th className="pb-3">Ready</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Restarts</th>
                    <th className="pb-3 text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium text-slate-600">
                  {(systemStatus?.pods || MOCK_PODS).map((pod: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-white/20 transition-colors">
                      <td className="py-3 font-mono text-[10px]">{pod.name}</td>
                      <td className="py-3">{pod.ready}</td>
                      <td className="py-3 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${pod.status === 'Running' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {pod.status}
                      </td>
                      <td className="py-3">{pod.restarts}</td>
                      <td className="py-3 text-right text-slate-400">{pod.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Log Console */}
          <div className="glass-card rounded-xl bg-slate-900 border-0 p-4 font-mono text-[10px] text-emerald-500/80 flex flex-col gap-2 max-h-[200px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1 flex-shrink-0">
              <span className="text-white font-bold uppercase tracking-widest text-[9px]">System Log</span>
              <span className="text-[8px] animate-pulse">● LIVE</span>
            </div>
            <div className="space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
              <div className="flex gap-2"><span className="text-white/20">00:01:04</span> [INFO] Cluster initialization successful.</div>
              <div className="flex gap-2"><span className="text-white/20">00:03:12</span> [INFO] Deployment: todo-backend scaling up...</div>
              <div className="flex gap-2"><span className="text-white/20">00:04:45</span> [WARN] HMR handshake: stale context detected.</div>
              <div className="flex gap-2 text-white"><span className="text-white/20">00:05:01</span> [DEBUG] 200 GET /system/status</div>
              <div className="flex gap-2 text-emerald-400"><span className="text-white/20">00:07:22</span> [INFO] AI Insights bar synchronized.</div>
              <div className="flex gap-2 text-white/50 italic"><span className="text-white/20">00:08:44</span> [SYSTEM] Layout stabilization active.</div>
              <div className="flex gap-2 animate-pulse"><span className="text-white/20">now</span> [INFO] Agentic Intelligence active.</div>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

