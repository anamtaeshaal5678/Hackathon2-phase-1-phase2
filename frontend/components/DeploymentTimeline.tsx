"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Deployment {
    id: string;
    version: string;
    commit_sha: string;
    status: string;
    deployed_at: string;
    deployed_by: string;
    environment: string;
    replicas: number;
    namespace: string;
}

interface DeploymentData {
    deployments: Deployment[];
    current_version: string;
    last_deployment: string;
}

export default function DeploymentTimeline() {
    const [data, setData] = useState<DeploymentData | null>(null);

    useEffect(() => {
        fetchDeployments();
        const interval = setInterval(fetchDeployments, 20000);
        return () => clearInterval(interval);
    }, []);

    const fetchDeployments = async () => {
        try {
            const result = await apiFetch("/phase-v/deployments/history");
            setData(result);
        } catch (e) {
            console.error("Failed to fetch deployments:", e);
        }
    };

    if (!data) {
        return (
            <div className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-40 bg-white/30 rounded" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-emerald-500';
            case 'rollback': return 'bg-amber-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-emerald-100 text-emerald-700';
            case 'rollback': return 'bg-amber-100 text-amber-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-sm font-bold text-white">Deployment Timeline</h2>
                </div>
                <div className="text-xs text-white/80 font-mono">
                    Current: {data.current_version}
                </div>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {data.deployments.map((deploy, index) => (
                    <div key={deploy.id} className="relative">
                        {/* Timeline Line */}
                        {index < data.deployments.length - 1 && (
                            <div className="absolute left-[11px] top-8 w-0.5 h-full bg-slate-200" />
                        )}

                        <div className="flex gap-3">
                            {/* Timeline Dot */}
                            <div className={`w-6 h-6 rounded-full ${getStatusColor(deploy.status)} flex-shrink-0 flex items-center justify-center shadow-lg relative z-10`}>
                                {deploy.status === 'success' && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {deploy.status === 'rollback' && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>

                            {/* Deployment Card */}
                            <div className="flex-1 bg-white/40 rounded-lg p-3 border border-white/60 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-700">{deploy.version}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBgColor(deploy.status)}`}>
                                                {deploy.status}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">
                                            {deploy.commit_sha} • {deploy.namespace}/{deploy.environment}
                                        </div>
                                    </div>
                                    <button className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">
                                        Rollback
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                    <span>{deploy.deployed_by}</span>
                                    <span>•</span>
                                    <span>{new Date(deploy.deployed_at).toLocaleString()}</span>
                                    <span>•</span>
                                    <span>{deploy.replicas} replicas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
