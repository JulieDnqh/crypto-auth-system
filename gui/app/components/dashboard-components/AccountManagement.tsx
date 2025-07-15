"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { ErrorModal } from "@/app/components/ErrorModal";
import { Label } from "@/app/components/label";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    failedLoginAttempts: number;
    accountLockedUntil: string | null;
    createdAt: string;
}

export default function AccountManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lockDuration, setLockDuration] = useState<number>(5); // Default lock for 5 minutes

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setError("Authentication token not found. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch users.");
            }

            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while fetching users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleLockUnlock = async (userId: string, action: 'lock' | 'unlock') => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setError("Authentication token not found. Please sign in again.");
            return;
        }

        try {
            const url = `http://localhost:5000/api/admin/users/${userId}/${action}`;
            const options: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };

            if (action === 'lock') {
                options.body = JSON.stringify({ lockDurationMinutes: lockDuration });
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${action} user.`);
            }

            alert(`User ${action}ed successfully!`);
            fetchUsers(); // Refresh the user list
        } catch (err: any) {
            setError(err.message || `An unexpected error occurred while ${action}ing user.`);
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <ErrorModal isOpen={!!error} onClose={() => setError(null)} errorMessage={error} />;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#001C44] mb-4">Account Management</h2>
            <div className="mb-4 flex items-center space-x-2">
                <Label htmlFor="lockDuration" className="text-gray-700">Lock Duration (minutes):</Label>
                <Input
                    id="lockDuration"
                    type="number"
                    value={lockDuration}
                    onChange={(e) => setLockDuration(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-24"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Email</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Name</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Role</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Failed Attempts</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Locked Until</th>
                            <th className="py-2 px-4 border-b text-left text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="py-2 px-4 border-b text-gray-800">{user.email}</td>
                                <td className="py-2 px-4 border-b text-gray-800">{user.firstName} {user.lastName}</td>
                                <td className="py-2 px-4 border-b text-gray-800">{user.role}</td>
                                <td className="py-2 px-4 border-b text-gray-800">{user.failedLoginAttempts}</td>
                                <td className="py-2 px-4 border-b text-gray-800">
                                    {user.accountLockedUntil ? new Date(user.accountLockedUntil).toLocaleString() : 'N/A'}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date() ? (
                                        <Button
                                            onClick={() => handleLockUnlock(user.id, 'unlock')}
                                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                                        >
                                            Unlock
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleLockUnlock(user.id, 'lock')}
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                                        >
                                            Lock
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
