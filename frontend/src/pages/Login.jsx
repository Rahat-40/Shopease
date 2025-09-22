import { useState ,useEffect} from "react";
import { useNavigate, Link ,useLocation} from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg,setSuccessMsg] = useState("")

  const navigate = useNavigate();
  const location = useLocation();
  
  //it show success msg after successful registation
  useEffect(() => {
    if(location.state?.message){
        setSuccessMsg(location.state.message);
        navigate(location.pathname,{replace:true})
    }
  },[location.state,location.pathname,navigate]);

  const handleLogin = async () => {
    try {
      setError("");
      setSuccessMsg("")
      
      const res = await API.post("/auth/login", { email, password });
      const role = res.data.role;

      // store data for checking
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);

      // Redirect based on role
      if (role === "ADMIN") navigate("/admin");
      else if (role === "SELLER") navigate("/seller");
      else navigate("/buyer");          // default buyer
    } catch (err) {
      setError("Invalid Email or Password. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {successMsg && <p className="text-green-500 mb-2 text-center">{successMsg}</p>}
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

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
          className="input input-bordered w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-full mb-3" onClick={handleLogin}>
          Login
        </button>

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
