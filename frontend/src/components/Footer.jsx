import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* ----left---- */}
        <div>
            <img className='mb-5 w-40' src={assets.logo} alt="" />
            <p className='w-full md:w-2/3 text-gray-600 leading-6'>At MedConnect, we believe healthcare should be simple, accessible, and trustworthy. Our platform helps patients connect with trusted doctors, book appointments online, and manage their healthcare with ease. With speciality-based search, verified professionals, and a smooth booking process, MedConnect brings doctors and patients closer—saving time and building trust.</p>
        </div>
        {/* -----center----- */}
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>HOME</li>
                <li>ABOUT US</li>
                <li>CONTACT US</li>
                <li>PRIVACY POLICY</li>
            </ul>
        </div>
        {/* ------right----- */}
        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>+044 2234-6789</li>
                <li>medconnectsupport@gmail.com</li>
            </ul>
        </div>
      </div>
      {/* ---copywright text---- */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copywright 2025@ MedConnect - All Rights Reserved</p>
      </div>
    </div>
  )
}

export default Footer
