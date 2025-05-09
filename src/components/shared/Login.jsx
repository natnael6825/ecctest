import { adminLogin } from "../../services/adminService";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", isError: false });

  const getFailedLoginInfo = (email) => {
    const data = JSON.parse(localStorage.getItem(`failedLogin_${email}`)) || {
      count: 0,
      lockedUntil: null,
    };
    return data;
  };

  const setFailedLoginInfo = (email, data) => {
    localStorage.setItem(`failedLogin_${email}`, JSON.stringify(data));
  };

  const clearFailedLoginInfo = (email) => {
    localStorage.removeItem(`failedLogin_${email}`);
  };

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", isError: false });
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const { count, lockedUntil } = getFailedLoginInfo(email);

    if (lockedUntil && new Date().getTime() < new Date(lockedUntil).getTime()) {
      setErrorMessage(
        "Your account is temporarily locked due to multiple failed login attempts. Please try again later."
      );
      setLoading(false);
      return;
    }

    try {
      const result = await adminLogin(email, password);

      if (result.token) {
        clearFailedLoginInfo(email);
        setCookie("token", result.token, 1);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("adminInfo", JSON.stringify(result));
        navigate("/");
      } else {
        throw new Error("No token returned.");
      }
    } catch (error) {
      console.error("Error logging in admin", error);

      const newCount = count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const lockedUntil = new Date(new Date().getTime() + LOCK_DURATION_MS);
        setFailedLoginInfo(email, { count: newCount, lockedUntil });

        setToast({
          message: "Security alert: multiple failed login attempts detected!",
          isError: true,
        });

        setErrorMessage(
          `Too many failed attempts. Account locked until ${lockedUntil.toLocaleTimeString()}.`
        );
      } else {
        setFailedLoginInfo(email, { count: newCount, lockedUntil: null });
        setErrorMessage(
          `Login failed. Attempt ${newCount}/${MAX_ATTEMPTS}. Please check your credentials.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      {toast.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50 ${
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

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
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
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-600/50 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
