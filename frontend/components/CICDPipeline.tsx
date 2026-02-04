"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface PipelineStage {
    name: string;
    status: string;
    duration: string;
}

interface PipelineRun {
    id: string;
    name: string;
    status: string;
    conclusion: string;
    started_at: string;
    completed_at: string;
    duration: string;
    trigger: string;
    branch: string;
    commit: {
        sha: string;
        message: string;
        author: string;
    };
    stages: PipelineStage[];
}

interface PipelineData {
    latest_run: PipelineRun;
    recent_runs: any[];
    statistics: {
        success_rate: number;
        avg_duration: string;
        total_runs: number;
        failures_last_week: number;
    };
}

export default function CICDPipeline() {
    const [data, setData] = useState<PipelineData | null>(null);

    useEffect(() => {
        fetchPipelineStatus();
        const interval = setInterval(fetchPipelineStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchPipelineStatus = async () => {
        try {
            const result = await apiFetch("/phase-v/pipeline/status");
            setData(result);
        } catch (e) {
            console.error("Failed to fetch pipeline status:", e);
        }
    };

    if (!data) {
        return (
            <div className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-40 bg-white/30 rounded" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-sm font-bold text-white">CI/CD Pipeline</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Latest Run */}
                <div className="bg-white/40 rounded-lg p-4 border border-white/60">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2.5 h-2.5 rounded-full ${data.latest_run.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="text-xs font-bold text-slate-700">
                                    Run #{data.latest_run.id}
                                </span>
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                                    {data.latest_run.branch}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium">
                                {data.latest_run.commit.message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {data.latest_run.commit.sha} • {data.latest_run.duration}
                            </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${data.latest_run.status === 'success'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {data.latest_run.conclusion}
                        </div>
                    </div>

                    {/* Pipeline Stages */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {data.latest_run.stages.map((stage, i) => (
                            <div key={i} className="bg-white/60 rounded p-2 border border-slate-200">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {stage.status === 'success' ? (
                                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <div className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                                    )}
                                    <span className="text-[10px] font-bold text-slate-700">{stage.name}</span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono">{stage.duration}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white/40 rounded-lg p-3 border border-white/60 text-center">
                        <div className="text-lg font-bold text-emerald-600">{data.statistics.success_rate}%</div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Success Rate</div>
                    </div>
                    <div className="bg-white/40 rounded-lg p-3 border border-white/60 text-center">
                        <div className="text-lg font-bold text-blue-600">{data.statistics.total_runs}</div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Total Runs</div>
                    </div>
                    <div className="bg-white/40 rounded-lg p-3 border border-white/60 text-center">
                        <div className="text-lg font-bold text-purple-600">{data.statistics.avg_duration}</div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Avg Duration</div>
                    </div>
                    <div className="bg-white/40 rounded-lg p-3 border border-white/60 text-center">
                        <div className="text-lg font-bold text-amber-600">{data.statistics.failures_last_week}</div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Failures (7d)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
