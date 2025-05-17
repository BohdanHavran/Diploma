import React from 'react'
import { NavLink } from 'react-router-dom'; 

const NavBrand = () => {
    return (
        <NavLink exact to={'/'}>
            <div className="flex items-center space-x-4">
                <img className="w-12 select-none" src="../../assets/favicon.png" alt="logo" />
                <h1 className="text-3xl font-semibold text-blue-600 brand-font select-none">Pharmacy</h1>
            </div>
        </NavLink>
    )
}

export default NavBrand
