import React from "react";
import './Layout.css';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

import Admin from "../Admin/Admin";
import User from "../User/User";

const Layout = () => (
    <div>

        <nav className="bg-white border-gray-200 dark:bg-gray-900 layout-nav">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <span className="flex items-center">
                    <img src="./stablecoin2.png" className="h-8 mr-3" alt="USDC Stablecoin Logo" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Simple Stablecoin</span>
                </span>
                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
                    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <NavLink to="/admin" className={({ isActive }) => [
                                    isActive ? 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                                             : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                                    ].filter(Boolean).join(' ')}>
                                Admin
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/user" className={({ isActive }) => [
                                    isActive ? 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                                             : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                                    ].filter(Boolean).join(' ')}>
                                User
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div className="bg-gray-50 h-screen">
            <Routes>
                <Route path="/admin/*" element={ <Admin /> } />
                <Route path="/user/*" element={ <User /> } />

                <Route path="*" element={ <Navigate to="/user" /> } />

            </Routes>
        </div>

    </div>
)

export default Layout;