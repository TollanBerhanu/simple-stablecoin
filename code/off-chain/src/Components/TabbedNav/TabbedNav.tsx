import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import MintBurn from "../../User/MintBurn/MintBurn";
import MintNFT from "../../Admin/MintNFT/MintNFT";
import DeployOracle from "../../Admin/DeployScripts/DeployScripts";
import UpddateOracle from "../../Admin/UpdateOracle/UpdateOracle";

const TabbedNav = (props: any) => {

    return (
        <nav className="border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-700 dark:text-gray-700">
                {
                    props.actions.map((action: any) => (
                        <li key={action.name} className="mr-2 mx-9">
                            <NavLink to={action.route} className={({ isActive }) => [
                                    'inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group' ,
                                    isActive ? 'text-blue-600  border-blue-600 active dark:text-blue-500 dark:border-blue-500'
                                             : 'border-transparent  hover:text-gray-800 hover:border-gray-800 dark:hover:text-gray-800'    
                                ].filter(Boolean).join(' ')}>
                                {/* <span className="text-gray-400 dark:text-gray-400">{ action.icon }</span> */}
                                { action.icon }
                                { action.name }
                            </NavLink>
                        </li>
                    ))
                }
            </ul>
        </nav>
    )
}

export default TabbedNav;