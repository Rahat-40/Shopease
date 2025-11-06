import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if(!name || !email || !password){
      setError("All fields are required");
      return;
    }
    try {
      await API.post("/auth/register", { name, email, password, role });
      navigate("/login",{state:{ message: "Registered Successfully!Please Login."}});
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          className="input input-bordered w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="select select-bordered w-full mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button className="btn btn-primary w-full mb-3" onClick={handleRegister}>
          Register
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
