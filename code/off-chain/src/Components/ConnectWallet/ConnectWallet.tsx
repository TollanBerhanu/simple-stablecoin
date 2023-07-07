import React from "react";

const ConnectWallet = (props: {dbState: Boolean}) => (
    
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 my-20 mx-20">
        <div className="flex flex-col items-center pb-10">
            {/* <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src="/nami2.jpeg" alt="Bonnie image"/> */}
            <img className="w-24 h-24 my-5 rounded shadow-lg" src="/nami.png" alt="Nami Wallet"/>
            <h5 className="mb-1 text-l font-medium text-gray-900 dark:text-white">Connect Wallet</h5>
            <span className="text-sm text-gray-500 dark:text-gray-400">Address:</span>
            <div className="flex mt-4 space-x-3 md:mt-6">
                <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Refresh</a>
                {/* <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">Message</a> */}
            </div>
        </div>

        { props.dbState ?
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Attribute
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Value1
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Value2
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Field
                        </th>
                        <td className="px-6 py-4">
                            Val1
                        </td>
                        <td className="px-6 py-4">
                            Val2
                        </td>
                    </tr>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Field
                        </th>
                        <td className="px-6 py-4">
                            Val1
                        </td>
                        <td className="px-6 py-4">
                            Val2
                        </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Field
                        </th>
                        <td className="px-6 py-4">
                            Val1
                        </td>
                        <td className="px-6 py-4">
                            Val2
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        : null }


    </div>

)

export default ConnectWallet;