import React from "react";
import TabbedNav from "../Components/TabbedNav/TabbedNav";
import { Navigate, Route, Routes } from "react-router-dom";
import MintBurn from "./MintBurn/MintBurn";
import ConnectWallet from "../Components/ConnectWallet/ConnectWallet";

const User = () => {
    const actions = [
        {
            name: 'Mint',
            route: 'mint',
            icon: <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.905 1.316 15.633 6M18 10h-5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h5m0-5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1m0-5V7a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-3m-6.367-9L7.905 1.316 2.352 6h9.281Z"/>
                  </svg>
        },
        {
            name: 'Burn',
            route: 'burn',
            icon: <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z"/>
                  </svg>
        }
    ]

    return (
        <>
            <TabbedNav actions={actions}>
                <h1>User</h1>
            </TabbedNav>

            <div className="flex">

                <div className="flex-1">
                    <Routes>
                            <Route path="/mint" element={ <MintBurn info={actions[0]} /> } />
                            <Route path="/burn" element={ <MintBurn info={actions[1]} /> } />

                            <Route path="*" element={ <Navigate to="/user/mint" /> } />

                    </Routes>
                </div>

                <div className="flex-1">
                    <ConnectWallet dbState={ false } />
                </div>

            </div>

        </>
    )
}

export default User;