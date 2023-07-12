import React from "react";

const DeployScripts = () => {

    return (
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                Deploy Scripts
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about deploying ...</p>
                
            <form className="mt-8 space-y-6" action="#">

                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Reserve Validator ... </label>

                <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <div className="bg-white rounded-t-lg dark:bg-gray-700">
                        <textarea id="comment" rows={4} className="w-full block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Serialized Reserve Validator ..." required></textarea>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1 border-t dark:border-gray-600">
                        <button type="button" className="inline-flex items-center py-2.5 px-4 text-xs text-gray-800 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg">
                            Deploy Reserve Validator
                        </button>
                    </div>
                </div>

                {/* <textarea id="message" rows={4} className="my-5 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Reserve CBorHex ..." required></textarea>
                <button type="submit" className="w-2/4 px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mx-5"> Deploy Reserve Validator </button>
                <button type="button" className="w-2/4 px-5 py-2 mx-5 text-gray-600 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-lg text-center">Deploy Reserve Validator</button> */}

                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Stablecoin Minting Policy ... </label>

                <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    
                    <input type="text" name="" className="mt-1 mb-0.5 p-2.5 w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Stablecoin Token Name ..." required 
                            />
                    <div className="bg-white rounded-t-lg dark:bg-gray-700">
                        <textarea id="comment" rows={4} className="w-full block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Serialized Stablecoin Policy ..." required></textarea>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1 border-t dark:border-gray-600">
                        <button type="button" className="inline-flex items-center py-2.5 px-4 text-xs text-gray-800 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg">
                            Deploy Stablecoin Policy
                        </button>
                    </div>
                </div>


            </form>

        </section>
    )
}

export default DeployScripts;