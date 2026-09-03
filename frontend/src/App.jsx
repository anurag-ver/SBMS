import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import {ToastContainer} from 'react-toastify'

// import Home from './pages/Home'
// import Services from './pages/Services'
// import About from './pages/About'
import Login from './app/auth/Login/page'
import Register from './app/auth/Register/page'
import 'react-toastify/ReactToastify.css'

const App = () => {
  return (
    <div className="w-full min-h-screen">
      <ToastContainer/>

      <Navbar />

      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

      </Routes>

    </div>
  )
}

export default App