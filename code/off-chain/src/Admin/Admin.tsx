import React from "react";
import TabbedNav from "../Components/TabbedNav/TabbedNav";
import { Navigate, Route, Routes } from "react-router-dom";
import MintNFT from "./MintNFT/MintNFT";
import UpddateOracle from "./UpdateOracle/UpdateOracle";
import DeployOracle from "./DeployScripts/DeployScripts";
import ConnectWallet from "../Components/ConnectWallet/ConnectWallet";

const Admin = () => {
    const actions = [
        {
            name: 'Mint NFT',
            route: 'mint-nft',
            icon: <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.5 8V4.5a3.5 3.5 0 1 0-7 0V8M8 12v3M2 8h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>
                  </svg>
        },

        {
            name: 'Deploy Oracle',
            route: 'update-oracle',
            icon: <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 14 3-3m-3 3 3 3m-3-3h16v-3m2-7-3 3m3-3-3-3m3 3H3v3"/>
                  </svg>
        },
        {
            name: 'Deploy Scripts',
            route: 'deploy-scripts',
            icon: <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
        }
    ]
    
    return(
        <>
            <TabbedNav actions={actions} />

            <div className="flex">
                <div className="flex-1">
                    <Routes>
                        <Route path="/mint-nft" element={ <MintNFT /> } />
                        <Route path="/deploy-scripts" element={ <DeployOracle /> } />
                        <Route path="/update-oracle" element={ <UpddateOracle /> } />
                        
                        <Route path="*" element={ <Navigate to="/admin/update-oracle" /> } />

                    </Routes>
                </div>

                <div className="flex-1 items-center">
                    <ConnectWallet dbState={ true } />
                </div>
            </div>
            
        </>
    )
}

export default Admin;