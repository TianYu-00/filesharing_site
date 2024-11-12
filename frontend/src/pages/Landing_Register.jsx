import React, { useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Landing_Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { userRegister } = useUser();
  const navigate = useNavigate();

  //
  const [message, setMessage] = useState("");

  const handle_SignUp = async (event) => {
    try {
      event.preventDefault();
      setMessage("");
      console.log("Sign up button clicked!");

      if (password !== confirmPassword) {
        console.log("Password is not the same");
        setMessage("Password is not the same");
        return;
      }

      const registerResponse = await userRegister(username, email, password);

      if (registerResponse.success) {
        navigate("/home");
      } else {
        const tmpMessage = registerResponse.response.data.msg;
        setMessage(tmpMessage);
      }
    } catch (error) {
      const tmpMessage = error.response?.data?.msg || "Registration failed. Please try again.";
      setMessage(tmpMessage);
    }
  };

  return (
    <Page_BoilerPlate>
      <div className="flex justify-center">
        <form
          className="border grid gap-4 p-4 w-full max-w-[500px] rounded-2xl bg-white text-black"
          onSubmit={handle_SignUp}
        >
          <div className="flex flex-col">
            <p className="text-left font-bold text-3xl">Register</p>
            <p className="text-left ">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500">
                Log In
              </Link>
            </p>
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Username</label>
            <input
              className="border p-2 border-black rounded"
              type="text"
              placeholder="tian"
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Email</label>
            <input
              className="border p-2 border-black rounded"
              type="email"
              placeholder="123456789@dropboxer.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Password</label>
            <input
              className="border p-2 border-black rounded"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Confirm Password</label>
            <input
              className="border p-2 border-black rounded"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <p className="text-red-500">{message}</p>
          </div>

          <button className="w-full border border bg-black text-white font-semibold p-2 rounded" type="submit">
            Sign up
          </button>
        </form>
      </div>
    </Page_BoilerPlate>
  );
}

export default Landing_Register;
