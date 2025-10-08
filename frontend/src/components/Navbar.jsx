import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const [token, setToken] = useState(null)
  const [isDoctor, setIsDoctor] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedRole = localStorage.getItem("role")

    if (savedToken) {
      setToken(savedToken)
      setIsDoctor(savedRole === "doctor")
    } else {
      setToken(null)
      setIsDoctor(false)
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setToken(null)
    setIsDoctor(false)
    navigate("/")
  
  }

  const doctorProfilePic = "https://randomuser.me/api/portraits/men/45.jpg"
  const userProfilePic = assets.profile_pic

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt='' />

      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to='/'><li className='py-1'>Home</li></NavLink>
        <NavLink to='/doctors'><li className='py-1'>Doctors</li></NavLink>
        <NavLink to='/about'><li className='py-1'>About</li></NavLink>
        <NavLink to='/contact'><li className='py-1'>Contact</li></NavLink>
      </ul>
          <div className='flex items-center gap-4'>

            {
              token ? (
                <div className='flex items-center gap-2 cursor-pointer group relative'>
                  <img
                    className='w-8 rounded-full'
                    src={isDoctor ? doctorProfilePic : userProfilePic}
                    alt=''
                  />
                  <img className='w-2.5' src={assets.dropdown_icon} alt='' />
                  <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                    <div className='min-w-48 big-stone-100 rounded flex-col gap-4 p-4'>
                      {isDoctor ? (
                        <>
                          <p onClick={() => navigate('doctor/dashboard')} className='hover:text-black cursor-pointer'>Dashboard</p>
                          <p onClick={handleLogout} className='hover:text-black cursor-pointer'>Logout</p>
                        </>
                      ) : (
                        <>
                          <p onClick={() => navigate('myprofile')} className='hover:text-black cursor-pointer'>My profile</p>
                          <p onClick={() => navigate('myappointments')} className='hover:text-black cursor-pointer'>My appointments</p>
                          <p onClick={handleLogout} className='hover:text-black cursor-pointer'>Logout</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'
                >
                  Login
                </button>
              )
            }
            </div>
    </div>
  )
}

export default Navbar
