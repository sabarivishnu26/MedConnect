import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Login') // 'Login' or 'Sign Up'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('user') // 'user' or 'doctor'

  const toggleRole = () => {
    setRole(prev => (prev === 'user' ? 'doctor' : 'user'))
  }

  const getDescriptionText = () => {
    if (state === 'Sign Up') {
      return role === 'user'
        ? 'Please sign up to book appointments'
        : 'Please sign up to manage your appointments'
    } else {
      return role === 'user'
        ? 'Please log in to book appointments'
        : 'Please log in to manage your appointments'
    }
  }


  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === "Login") {
        // 🔑 Login request
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
          role
        })

        // save token to localStorage
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", role);
        navigate("/") // redirect to home page
        alert("Login successful!")

      } else {
        // 🆕 Signup request
        const res = await axios.post("http://localhost:5000/api/auth/signup", {
          name,
          email,
          password,
          role
        })
        localStorage.setItem("token", true);
        localStorage.setItem("role", role);

        alert("Signup successful! Now login.")
        setState("Login")
      }
    } catch (err) {
      console.error(err.response?.data)
      alert(err.response?.data?.message || "Something went wrong")
    }
  }


  return (
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
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

        {state === 'Sign Up' && (
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
          {state === 'Sign Up' ? "Create Account" : "Login"}
        </button>

        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>

  )
}

export default Login
