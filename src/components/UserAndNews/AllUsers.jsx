import React, { useState, useEffect } from "react";
import { getAllUsers } from "../../services/UserEngagementServ"; // Adjust import path based on your project structure

function AllUsers() {
  const [allUsers, setAllUsers] = useState([]); // Store all users
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers(); // Fetch all users
        if (Array.isArray(response)) {
          setAllUsers(response); // Store all users in state if response is an array
        } else {
          console.error("Unexpected response format:", response);
          setAllUsers([]); // Set to empty array if not an array
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]); // Fallback to empty array on error
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Calculate start and end indexes for pagination
  const startIndex = (currentPage - 1) * 20;
  const endIndex = startIndex + 20;
  const paginatedUsers = allUsers.slice(startIndex, endIndex);

  // Handle pagination
  const handleNextPage = () => {
    if (endIndex < allUsers.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div>
      <h1>All Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Business Type</th>
                <th>Contact Information</th>
                <th>Chat ID</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{startIndex + index + 1}</td> <td>{user.name}</td>
                  <td>{user.business_type}</td>
                  <td>{user.contact_information}</td>
                  <td>{user.chat_id}</td> {/* Display Chat ID here */}
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginRight: "10px", // Add space between buttons
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
              Previous Page
            </button>
            <button
              onClick={handleNextPage}
              disabled={endIndex >= allUsers.length}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
              Next Page
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AllUsers;
