import React, { useState, useEffect } from "react";
import { fetchAllUsers } from "../../services/userServices"; // adjust path as needed
import { userActivation } from "../../services/adminService";

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleActivate = async (user) => {
    setDeactivatingId(user.id);
    try {
      await userActivation(user.id, user.contact_information, user.chat_id, 1);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: true } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...user, is_active: true });
      }
    } catch (err) {
      console.error("Error activating user", err);
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleDeactivate = async (user) => {
    setDeactivatingId(user.id);

    try {
      await userActivation(user.id, user.contact_information, user.chat_id, 0);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...user, is_active: false });
      }
    } catch (err) {
      console.error("Error deactivating user", err);
    } finally {
      setDeactivatingId(null);
    }
  };

  const formatLabel = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const filteredUsers = users.filter((user) =>
    (user.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 flex">
      {/* Left panel: user list */}
      <div className="w-1/2 pr-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <table className="table-auto w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 text-left w-2/5">Name</th>
              <th className="py-2 text-left w-1/5">Role</th>
              <th className="py-2 text-left w-1/5">Status</th>
              <th className="py-2 text-left w-1/5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-2">{user.name || "—"}</td>
                <td className="py-2">{user.role || "—"}</td>
                <td className="py-2">
                  {user.is_active ? "Active" : "Deactivated"}
                </td>
                <td className="py-2 space-x-2 flex overflow-hidden">
                  {user.is_active ? (
                    <button
                      onClick={() => handleDeactivate(user)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      {deactivatingId === user.id
                        ? "Deactivating…"
                        : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(user)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      {deactivatingId === user.id ? "Activating…" : "Activate"}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right panel: user details */}
      <div className="w-1/2 overflow-auto h-[50vh] border-2">
        {" "}
        {selectedUser ? (
          <div className="bg-gray-50 p-4 rounded shadow space-y-2 w-full">
            <h2 className="text-2xl font-semibold border-b-2 mb-4">
              User Details
            </h2>
            {Object.entries(selectedUser).map(([key, value]) => (
              <p key={key}>
                <strong>{formatLabel(key)}:</strong> {value ?? "—"}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">
            <p>Select a user to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
