"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface ComplianceCheck {
    id: string;
    name: string;
    status: string;
    score: number;
    description: string;
}

interface ComplianceData {
    overall_score: number;
    last_audit: string;
    checks: ComplianceCheck[];
    violations: any[];
    warnings: any[];
}

export default function GitOpsCompliance() {
    const [data, setData] = useState<ComplianceData | null>(null);

    useEffect(() => {
        fetchCompliance();
        const interval = setInterval(fetchCompliance, 20000);
        return () => clearInterval(interval);
    }, []);

    const fetchCompliance = async () => {
        try {
            const result = await apiFetch("/phase-v/gitops/compliance");
            setData(result);
        } catch (e) {
            console.error("Failed to fetch compliance:", e);
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
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-sm font-bold text-white">GitOps Compliance</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{data.overall_score}%</span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Score Indicator */}
                <div className="bg-white/40 rounded-lg p-4 border border-white/60">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700">Constitution Compliance</span>
                        <span className="text-xs font-bold text-emerald-600">{data.overall_score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${data.overall_score}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        Last audit: {new Date(data.last_audit).toLocaleTimeString()}
                    </div>
                </div>

                {/* Compliance Checks */}
                <div>
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">SDD Checks</h3>
                    <div className="space-y-1.5">
                        {data.checks.map((check) => (
                            <div key={check.id} className="bg-white/40 rounded-lg p-2.5 border border-white/60 flex items-center justify-between hover:shadow-sm transition-all">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${check.status === 'passed' ? 'bg-emerald-100' : 'bg-amber-100'
                                        }`}>
                                        {check.status === 'passed' ? (
                                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-700">{check.id}: {check.name}</div>
                                        <div className="text-[10px] text-slate-500">{check.description}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-slate-600">{check.score}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warnings */}
                {data.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] uppercase font-bold text-amber-700">Recommendations</span>
                        </div>
                        {data.warnings.map((warning, i) => (
                            <div key={i} className="text-[11px] text-amber-700 ml-6">
                                • {warning.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
