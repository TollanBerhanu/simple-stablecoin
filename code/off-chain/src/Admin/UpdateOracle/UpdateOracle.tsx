import React from "react";

const UpddateOracle = () => {

    return (
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                Deploy Oracle
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about the oracle ...</p>
                
            <form className="mt-8 space-y-6" action="#">
                
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Serialized Oracle Validator ... </label>
                <textarea id="message" rows={4} className="my-5 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Oracle CBorHex ..." required></textarea>

                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> USD / ADA Rate </label>
                    <input type="text" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray-800 dark:focus:ring-blue-200 dark:focus:border-blue-200 mt-5" placeholder="Rate ..." required />
                </div>


                <div className="flex items-center pl-4 border border-gray-200 rounded-lg dark:border-gray-300">
                    <input id="bordered-checkbox-1" type="checkbox" value="" name="bordered-checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-700">Minting Allowed</label>
                {/* </div>
                <div className="flex items-center pl-4 border border-gray-200 rounded-lg dark:border-gray-600"> */}
                    <input id="bordered-checkbox-2" type="checkbox" value="" name="bordered-checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-700">Burning Allowed</label>
                </div>


                {/* <div className="inline-flex justify-center"> */}
                    <button type="submit" className="w-2/5 px-5 py-2 mx-5 text-base font-medium text-center text-white rounded-lg bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 text-lg"> Deploy Oracle </button>
                    {/* <button type="button" className="w-2/4 px-5 py-3 mx-5 text-base font-medium text-center text-white rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"> Delete Oracle </button> */}
                    <button type="button" className="w-2/5 px-5 py-2 mx-5 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-lg">Delete Oracle</button>

                {/* </div> */}
            
            </form>

        </section>
    )
}

export default UpddateOracle;