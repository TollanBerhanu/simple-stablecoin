import React from "react";

const MintBurn = (props: any) => {

    const name = props.info.name
    const icon = props.info.icon
    const buttonStyle = name == 'Mint' ? 'w-1/4 px-5 py-3 text-gray-700 font-bold bg-gradient-to-br font-medium rounded-lg text-lg text-center from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800' :
                                         'w-1/4 px-5 py-3 text-gray-700 font-bold bg-gradient-to-br font-medium rounded-lg text-lg text-center from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800'
  {/* A less dramatic Mint button style: 'w-1/4 px-5 py-3 text-gray-700 font-bold bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-lg text-center' */}

    return(
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                { name } Stablecoins
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about "{ name }ing" ...</p>
                
            <form className="mt-8 space-y-6" action="#">
                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> Enter amount to <span className="lowercase">{ name }</span> ... </label>
                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-white dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Amount" required />
                </div>
                <button type="button" className ={buttonStyle} >
                    { name }
                </button>
            
            </form>

        </section>
    )

}

export default MintBurn;