"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface Stats {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    completion_rate: number;
    priority_breakdown: {
        high: number;
        medium: number;
        low: number;
    };
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const data = await apiFetch("/todos/stats");
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading || !stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Main Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-black">{stats.completion_rate}%</span>
                    <span className="text-green-500 text-xs font-medium">↑ Healthy</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div
                        className="bg-black h-full transition-all duration-1000"
                        style={{ width: `${stats.completion_rate}%` }}
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
                <div className="mt-2 text-3xl font-bold text-black">{stats.pending_tasks}</div>
                <p className="text-gray-400 text-xs mt-1">Requiring attention</p>
            </div>

            {/* Priority Breakdown */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Risk Profile</span>
                    <div className="flex gap-6 mt-4">
                        <div className="flex flex-col">
                            <span className="text-red-500 font-bold text-xl">{stats.priority_breakdown.high}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium">High</span>
                            <div className="w-8 h-1 bg-red-100 rounded-full mt-1">
                                <div className="bg-red-500 h-full rounded-full" style={{ width: stats.priority_breakdown.high > 0 ? '100%' : '0%' }} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-amber-500 font-bold text-xl">{stats.priority_breakdown.medium}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium">Medium</span>
                            <div className="w-8 h-1 bg-amber-100 rounded-full mt-1">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: stats.priority_breakdown.medium > 0 ? '100%' : '0%' }} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-blue-500 font-bold text-xl">{stats.priority_breakdown.low}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium">Low</span>
                            <div className="w-8 h-1 bg-blue-100 rounded-full mt-1">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: stats.priority_breakdown.low > 0 ? '100%' : '0%' }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <svg className="w-16 h-16 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
