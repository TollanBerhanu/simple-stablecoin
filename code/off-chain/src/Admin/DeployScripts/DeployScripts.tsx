import React from "react";

const DeployScripts = () => {

    return (
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                Deploy Scripts
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about deploying ...</p>
                
            <form className="mt-8 space-y-6" action="#">
                
                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> Deploy Oracle Validator </label>
                    <input type="text" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-white dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="NFT's UTxO" required />
                </div>
                <button type="submit" className="w-1/4 px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> Deploy Oracle </button>
            
                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> Deploy Stablecoin Minting Policy </label>
                    <input type="text" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-white dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Oracle's UTxO" required />
                    <input type="text" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-white dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Reserve Validator's UTxO" required />
                </div>
                <button type="submit" className="w-1/4 px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> Deploy Stablecoin Policy </button>

                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> Deploy Reserve Validator </label>
                    <input type="text" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-white dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Oracle's UTxO" required />
                    <input type="text" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-white dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Reserve Validator's UTxO" required />
                </div>
                <button type="submit" className="w-1/4 px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> Deploy Reserve Validator </button>
            
            </form>

        </section>
    )
}

export default DeployScripts;