"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  failedLoginAttempts: number;
  accountLockedUntil: string | null;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockDuration, setLockDuration] = useState<number>(5); // Default lock duration in minutes

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users.");
      toast.error(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLockUnlock = async (userId: string, action: "lock" | "unlock") => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      let url = `http://localhost:5000/api/admin/users/${userId}/${action}`;
      let body: any = {};

      if (action === "lock") {
        body = { lockDurationMinutes: lockDuration };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${action}ing user.`);
      }

      const result = await response.json();
      toast.success(result.message);
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      toast.error(err.message || `Failed to ${action} user.`);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
      <h2 className="text-2xl font-bold text-[#001C44] mb-6">User Management</h2>

      <div className="mb-4 flex items-center space-x-4">
        <Label htmlFor="lockDuration" className="text-lg">Lock Duration (minutes):</Label>
        <Input
          id="lockDuration"
          type="number"
          value={lockDuration}
          onChange={(e) => setLockDuration(Number(e.target.value))}
          min="1"
          className="w-24"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Failed Attempts</th>
              <th className="py-2 px-4 border-b text-left">Locked Until</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.firstName} {user.lastName}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">{user.failedLoginAttempts}</td>
                <td className="py-2 px-4 border-b">
                  {user.accountLockedUntil ? new Date(user.accountLockedUntil).toLocaleString() : "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {user.accountLockedUntil ? (
                    <Button
                      onClick={() => handleLockUnlock(user.id, "unlock")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Unlock
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleLockUnlock(user.id, "lock")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
