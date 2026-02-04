"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface DaprComponent {
    name: string;
    type: string;
    status: string;
    version: string;
    metadata: any;
}

interface DaprData {
    sidecar: {
        version: string;
        status: string;
        uptime: string;
        app_id: string;
    };
    components: DaprComponent[];
    service_invocations: {
        total: number;
        success: number;
        failed: number;
        avg_latency_ms: number;
    };
    pub_sub: {
        messages_published: number;
        messages_consumed: number;
        dead_letters: number;
    };
}

export default function DaprPanel() {
    const [data, setData] = useState<DaprData | null>(null);

    useEffect(() => {
        fetchDaprMetrics();
        const interval = setInterval(fetchDaprMetrics, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchDaprMetrics = async () => {
        try {
            const result = await apiFetch("/phase-v/dapr/metrics");
            setData(result);
        } catch (e) {
            console.error("Failed to fetch Dapr metrics:", e);
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
            <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                    <h2 className="text-sm font-bold text-white">Dapr Service Mesh</h2>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold ${data.sidecar.status === 'healthy'
                        ? 'bg-emerald-400/20 text-emerald-100'
                        : 'bg-amber-400/20 text-amber-100'
                    }`}>
                    {data.sidecar.status}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Sidecar Info */}
                <div className="bg-white/40 rounded-lg p-3 border border-white/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-slate-700 mb-1">Sidecar v{data.sidecar.version}</div>
                            <div className="text-[10px] text-slate-500 font-mono">App ID: {data.sidecar.app_id}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Uptime</div>
                            <div className="text-xs font-bold text-slate-700">{data.sidecar.uptime}</div>
                        </div>
                    </div>
                </div>

                {/* Components */}
                <div>
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Components</h3>
                    <div className="space-y-2">
                        {data.components.map((comp, i) => (
                            <div key={i} className="bg-white/40 rounded-lg p-3 border border-white/60">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${comp.status === 'connected' || comp.status === 'ready'
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-500'
                                            }`} />
                                        <span className="text-xs font-bold text-slate-700">{comp.name}</span>
                                    </div>
                                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                        {comp.type}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono ml-4">
                                    {comp.metadata.host || comp.metadata.brokers}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="text-[9px] text-blue-600 uppercase font-bold mb-1">Service Invocations</div>
                        <div className="text-lg font-bold text-blue-700">{data.service_invocations.success.toLocaleString()}</div>
                        <div className="text-[10px] text-blue-500">
                            {data.service_invocations.avg_latency_ms}ms avg • {data.service_invocations.failed} failed
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                        <div className="text-[9px] text-purple-600 uppercase font-bold mb-1">Pub/Sub Messages</div>
                        <div className="text-lg font-bold text-purple-700">{data.pub_sub.messages_consumed.toLocaleString()}</div>
                        <div className="text-[10px] text-purple-500">
                            {data.pub_sub.messages_published} published • {data.pub_sub.dead_letters} DLQ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
