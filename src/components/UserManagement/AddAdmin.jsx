import React, { useEffect, useState } from "react";
import { addAdmin } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function AddAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", isError: false });
  const navigate = useNavigate();

  const isNameValid = (input) => /^[a-zA-Z\s]+$/.test(input);
  const isPasswordValid = (input) => input.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isNameValid(name)) {
      setToast({
        message: "Name must not contain special characters",
        isError: true,
      });
      setLoading(false);
      return;
    }

    if (!isPasswordValid(password)) {
      setToast({
        message: "Password must be at least 8 characters",
        isError: true,
      });
      setLoading(false);
      return;
    }

    try {
      await addAdmin(name, email, password);
      setToast({ message: "Admin created successfully", isError: false });

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error creating admin", error);
      setToast({
        message: "Failed to create admin. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(
      () => setToast({ message: "", isError: false }),
      3000
    );
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="flex justify-center items-center h-full p-4 bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add Admin</h2>

        {toast.message && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50
          ${
            toast.isError
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
          >
            {toast.message}
            <button
              onClick={() => setToast({ message: "", isError: false })}
              className="ml-4 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter name"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter email"
            required
          />
        </div>

        <div className="mb-6 relative">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 pr-10"
            placeholder="Enter password"
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-9 right-3 cursor-pointer text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Add Admin"}
        </button>
      </form>
    </div>
  );
}

export default AddAdmin;
