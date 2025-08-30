
import React, { useState } from 'react'

const Login = () => {
  const [state, setState] = useState('Sign Up')
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

    /*const payload = {
      email,
      password,
      role,
      ...(state === 'Sign Up' && { name })
    }

    const endpoint = state === 'Sign Up' ? '/api/auth/signup' : '/api/auth/login'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log(data) // Handle success/failure here
    } catch (error) {
      console.error(error)
    } */
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
              onChange={(e)=>setName(e.target.value)}
              value={name}
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="email"
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="password"
            onChange={(e)=>setPassword(e.target.value)}
            value={password}
          />
        </div>

        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>
          {state === 'Sign Up' ? "Create Account" : "Login"}
        </button>

        {state === 'Sign Up' 
          ? <p>Already have an account? <span onClick={()=>setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create a new account? <span onClick={()=>setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>

  )
}

export default Login
