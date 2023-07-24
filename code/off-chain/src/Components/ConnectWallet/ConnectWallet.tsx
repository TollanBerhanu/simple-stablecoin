import React, { useContext, useState } from "react";
import { AppStateContext } from "../../App";

const ConnectWallet = (props: {dbState: Boolean}) => {

    const { appState, setAppState } = useContext(AppStateContext)
    const { lucid, currentWalletAddress, metadata } = appState

    const [nftMinted, setNftMinted] = useState<boolean>( metadata.nftTxOutRef !== '' )
    const [oracleDeployed, setOracleDeployed] = useState<boolean>( metadata.nftTxOutRef !== '' )
    const [reserveDeployed, setReserveDeployed] = useState<boolean>( metadata.nftTxOutRef !== '' )
    const [stablecoinDeployed, setStablecoinDeployed] = useState<boolean>( metadata.nftTxOutRef !== '' )

    const refreshWallet = async () => {
        if (!lucid || !window.cardano.nami) return;
        const nami = await window.cardano.nami.enable();
        lucid.selectWallet(nami);
        setAppState({
            ...appState,
            currentWalletAddress: await lucid.wallet.address(),
        });
    };

    const tickOrCross = (val: boolean) => {
        return val ?
            'Yes'
        :
            'No'
    }
    
    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 my-20 mx-20">
            <div className="flex flex-col items-center pb-10">
                {/* <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src="/nami2.jpeg" alt="Bonnie image"/> */}
                <img className="w-24 h-24 my-5 rounded shadow-lg" src="/nami.png" alt="Nami Wallet"/>
                <h5 className="mb-1 text-l font-medium text-gray-900 dark:text-white">Connect Wallet</h5>
                <span className="text-sm text-gray-500 dark:text-gray-400">Address:</span>
                <div className="text-sm text-gray-200 dark:text-gray-200">{ currentWalletAddress ? `${currentWalletAddress.substring(0, 20)} ... ${currentWalletAddress.substring(100)}` : "No wallet found!" }</div>
                <div className="flex mt-4 space-x-3 md:mt-6">
                    <button type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={ refreshWallet } >Refresh</button>
                    {/* <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">Message</a> */}
                </div>
            </div>

            { props.dbState ?
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-8 py-3">
                                App State
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                NFT Minted
                            </th>
                            <td className="px-6 py-4">
                                { tickOrCross(nftMinted) }
                            </td>
                        </tr>
                        <tr className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                Oracle Deployed
                            </th>
                            <td className="px-6 py-4">
                                { tickOrCross(oracleDeployed) }
                            </td>
                        </tr>
                        <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                Reserve Deployed
                            </th>
                            <td className="px-6 py-4">
                                { tickOrCross(reserveDeployed) }
                            </td>
                        </tr>
                        <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                Stablecoin Deployed
                            </th>
                            <td className="px-6 py-4">
                                { tickOrCross(stablecoinDeployed) }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            : null }


        </div>
    )

}

export default ConnectWallet;