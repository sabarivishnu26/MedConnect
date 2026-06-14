import React, { useMemo, useState } from 'react'
import { api } from "../lib/api";
import { useNavigate, useLocation } from 'react-router-dom'


const Login = () => {
  const location = useLocation();

  const isSignup = useMemo(() => location.pathname === "/signup", [location.pathname])

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('user') // 'user' or 'doctor'

  const toggleRole = () => {
    setRole(prev => (prev === 'user' ? 'doctor' : 'user'))
  }

  const getDescriptionText = () => {
    if (isSignup) {
      return role === 'user'
        ? 'Please sign up to book appointments'
        : 'Please sign up to manage your appointments'
    } else {
      return role === 'user'
        ? 'Please log in to book appointments'
        : 'Please log in to manage your appointments'
    }
  }

  const persistAuth = ({ token, role: persistedRole }) => {
    localStorage.setItem("token", token)
    localStorage.setItem("role", persistedRole)
  }


  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (!email || !password || (isSignup && !name)) {
        alert("Please fill all required fields")
        return
      }

      if (isSignup) {
        // 🆕 Signup request (backend currently returns only a message)
        await api.post("/api/auth/signup", { name, email, password, role })

        // Auto-login immediately so we always store a real JWT
        const loginRes = await api.post("/api/auth/login", { email, password, role })
        if (!loginRes.data?.token) throw new Error("Login did not return a token")

        persistAuth({ token: loginRes.data.token, role })
        alert("Signup successful!")
        navigate("/")
        return
      }

      // 🔑 Login request
      const res = await api.post("/api/auth/login", { email, password, role })
      if (!res.data?.token) throw new Error("Login did not return a token")

      persistAuth({ token: res.data.token, role })
      alert("Login successful!")

      if (role === "doctor") {
        const isProfileComplete = Boolean(res.data?.account?.isProfileComplete)
        navigate(isProfileComplete ? "/doctor/dashboard" : "/doctor/onboarding")
      } else {
        navigate("/") // redirect to home page
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      alert(err?.response?.data?.message || err?.message || "Something went wrong")
    }
  }


  return (
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{isSignup ? "Create Accountsss" : "Login"}</p>
        <p>{getDescriptionText()}</p>

        {/* Role Toggle */}
        <div className='flex items-center gap-3'>
          <span className={`cursor-pointer px-3 py-1 rounded-full ${role === 'user' ? 'bg-primary text-white' : 'bg-gray-200'}`} onClick={toggleRole}>
            {role === 'user' ? 'User' : 'Doctor'}
          </span>
          <p className='text-sm text-gray-600'>
            {role === 'user' ? 'Switch to Doctor' : 'Switch to User'}
          </p>
        </div>

        {isSignup && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>
          {isSignup ? "Create Account" : "Login"}
        </button>

        {isSignup ? (
          <p>
            Already have an account?{" "}
            <span onClick={() => navigate('/login')} className='text-primary underline cursor-pointer'>
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span onClick={() => navigate('/signup')} className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}
      </div>
    </form>

  )
}

export default Login
