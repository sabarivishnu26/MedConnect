import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Routes>
        <Route path='/login' element={<Login />}></Route>
      </Routes>
    </div>
  )
}

export default App
