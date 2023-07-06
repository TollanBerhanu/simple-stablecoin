import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import MintBurn from "../../User/MintBurn/MintBurn";
import MintNFT from "../../Admin/MintNFT/MintNFT";
import DeployOracle from "../../Admin/DeployScripts/DeployScripts";
import UpddateOracle from "../../Admin/UpdateOracle/UpdateOracle";

const TabbedNav = (props: any) => {

    console.log(props.actions)

    return (
        <nav className="border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-700 dark:text-gray-700">
                {
                    props.actions.map((action: any) => (
                        <li className="mr-2 mx-9">
                            <NavLink to={action.route} className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-800 hover:border-gray-800 dark:hover:text-gray-800 group">
                                {/* <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                </svg> */}
                                { action.icon }
                                { action.name }
                            </NavLink>
                        </li>
                    ))
                }
                
                <li className="mr-2">
                    <a href="#" className="inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" aria-current="page">
                        ...
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default TabbedNav;