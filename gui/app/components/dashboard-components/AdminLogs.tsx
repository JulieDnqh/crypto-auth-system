"use client";

import { useState, useEffect } from 'react';
import { ErrorModal } from "@/app/components/ErrorModal";
import { Button } from "@/app/components/button"; // Import Button component

interface LogEntry {
    id: string;
    timestamp: string;
    email: string;
    action: string;
    status: string;
    details: string;
}

export default function AdminLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setError("Authentication token not found. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/logs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch logs.");
            }

            const data = await response.json();
            setLogs(data);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while fetching logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleDownloadLogs = () => {
        if (logs.length === 0) {
            alert("No logs to download.");
            return;
        }

        const logContent = logs.map(logEntry => {
            const timestamp = new Date(logEntry.timestamp).toISOString();
            const email = logEntry.email || 'N/A';
            const action = logEntry.action;
            const status = logEntry.status;
            const details = logEntry.details || '';
            return `[${timestamp}] [${email}] [${action}] [${status}] ${details}`;
        }).join('\n');

        const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `security_logs_${new Date().toISOString().slice(0, 10)}.log`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) return <p>Loading logs...</p>;
    if (error) return <ErrorModal isOpen={!!error} onClose={() => setError(null)} errorMessage={error} />;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#001C44] mb-4">System Logs</h2>
            <div className="mb-4">
                <Button
                    onClick={handleDownloadLogs}
                    className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    Download Logs
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white table-fixed w-full">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Timestamp</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Email</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Action</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Status</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((logEntry) => (
                            <tr key={logEntry.id}>
                                <td className="py-2 px-4 border-b text-gray-800">{new Date(logEntry.timestamp).toLocaleString()}</td>
                                <td className="py-2 px-4 border-b text-gray-800">{logEntry.email || 'N/A'}</td>
                                <td className="py-2 px-4 border-b text-gray-800">{logEntry.action}</td>
                                <td className="py-2 px-4 border-b text-gray-800">{logEntry.status}</td>
                                <td className="py-2 px-4 border-b text-gray-800 max-w-xs overflow-y-auto max-h-20">{logEntry.details || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}