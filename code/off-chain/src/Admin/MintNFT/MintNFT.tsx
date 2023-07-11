import React, { useEffect, useState, useContext } from "react";
import {
    applyParamsToScript,
    Data,
    MintingPolicy,
    fromText,
    PolicyId, UTxO, Unit, 
    Lucid, Blockfrost, TxComplete, TxHash, Address 
} from "lucid-cardano";
import { AppStateContext } from "../../App";
import axios from "axios";


const MintNFT = () => {

    const { appState, setAppState } = useContext(AppStateContext)
    const { lucid, currentWalletAddress, metadata, serialized } = appState

    const [tokenName, setTokenName] = useState<string>(metadata.nftTokenName)
    const [devAddress, setDevAddress] = useState<Address>(metadata.developerAddress)  // useEffect(() => { setDevAddress(metadata.developerAddress) }, [metadata.developerAddress])

    const [serializedNFT, setSerializedNFT] = useState<string>(serialized.nft)

    // **************************************************** Off-Chain Code *************************************************
    const getUtxo = async (address: string): Promise<UTxO> => {
        const utxos = await lucid!.utxosAt(address);    // Get all UTxOs from an address
        const utxo = utxos[0];  // Take the first UTxO
        return utxo;
    };

    type GetFinalPolicy = {
        nftPolicy: MintingPolicy;
        unit: Unit;
    };

    const getFinalPolicy = async (utxo: UTxO): Promise<GetFinalPolicy> => {     // apply params to the serialized minting policy
        const tn = fromText(tokenName);    // Get the HEX value of the string
        const Params = Data.Tuple([Data.Bytes(), Data.Integer()]);    // TxId -> TxIdx -> TokenName
        type Params = Data.Static<typeof Params>;
        const nftPolicy: MintingPolicy = {
            type: "PlutusV2",
            script: applyParamsToScript<any>(
                serializedNFT,
                [utxo.txHash, BigInt(utxo.outputIndex)],
                Params
            ),
        };
        const policyId: PolicyId = lucid!.utils.mintingPolicyToId(nftPolicy);
        const unit: Unit = policyId + tn;   // This is the asset class of the NFT

        return { nftPolicy, unit };
    }

    const signAndSubmitTx = async (tx: TxComplete): Promise<TxHash> => {
        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log(`Transaction submitted: ${txHash}`);
        alert(`Transaction submitted: ${txHash}`);
        return txHash;
    };

    const mintNFT = async () => {
        console.log(appState)
        const wAddr: Address = devAddress
        console.log("minting NFT for " + wAddr);
        if (wAddr) {    // Check if we have an address (a connected wallet)
            const utxo = await getUtxo(wAddr);     // get the first UTxO from the address
            const { nftPolicy, unit } = await getFinalPolicy(utxo);     // serialize the NFT minting policy using the UTxO as a parameter

            const tx = await lucid!     // Create a txn that mints the NFT
                .newTx()
                .mintAssets({ [unit]: 1n }, Data.void())    // (AssetClass, Redeemer)
                .attachMintingPolicy(nftPolicy)
                .collectFrom([utxo])    // make sure we consume the UTxO
                .complete();

            // await signAndSubmitTx(tx);
            
            // Update the database with new values in the form fields
            await axios.put(`/metadata/${metadata.id}`, {
                ...metadata,
                nftTokenName: tokenName,
                developerAddress: devAddress
            })
            await axios.put(`/serialized/${serialized.id}`, {
                ...serialized,
                nft: serializedNFT
            })
        }
    };

    return (

        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                Mint Oracle's NFT
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about minting the Oracle's NFT ...</p>

            <form>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Serialized NFT Minting Policy </label>
                <textarea id="message" rows={4} className="mt-5 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="NFT CBorHex ..." required
                          value={ serializedNFT } onChange={ (e) => setSerializedNFT(e.target.value) }></textarea>
                
                <div>
                    <label  className="block mb-2 mt-5 text-sm font-medium text-gray-900 dark:text-gray"> Name of NFT </label>
                    <input type="text" name="" className="mt-4 p-2.5 w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Token Name ..." required 
                           value={ tokenName } onChange={ (e) => setTokenName(e.target.value) } />
                </div>

                <div>
                    <label  className="block mb-2 mt-5 text-sm font-medium text-gray-900 dark:text-gray"> Developer's Payment Address </label>
                    <input type="text" name="" className="mt-4 p-2.5 w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Developer Address ..." required 
                           value={ devAddress } onChange={ (e) => setDevAddress(e.target.value) } />
                </div>
                
                {/* <div className="flex justify-center"> */}
                <button type="button" className="w-2/4 px-5 py-3 m-5 font-medium text-base text-center rounded-lg inline-flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                        onClick={ mintNFT }>

                    <svg className="w-4 h-4 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="bitcoin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.1-111 248-248 248S8 392.1 8 256 119 8 256 8s248 111 248 248zm-141.7-35.33c4.937-32.1-20.19-50.74-54.55-62.57l11.15-44.7-27.21-6.781-10.85 43.52c-7.154-1.783-14.5-3.464-21.8-5.13l10.93-43.81-27.2-6.781-11.15 44.69c-5.922-1.349-11.73-2.682-17.38-4.084l.031-.14-37.53-9.37-7.239 29.06s20.19 4.627 19.76 4.913c11.02 2.751 13.01 10.04 12.68 15.82l-12.7 50.92c.76 .194 1.744 .473 2.829 .907-.907-.225-1.876-.473-2.876-.713l-17.8 71.34c-1.349 3.348-4.767 8.37-12.47 6.464 .271 .395-19.78-4.937-19.78-4.937l-13.51 31.15 35.41 8.827c6.588 1.651 13.05 3.379 19.4 5.006l-11.26 45.21 27.18 6.781 11.15-44.73a1038 1038 0 0 0 21.69 5.627l-11.11 44.52 27.21 6.781 11.26-45.13c46.4 8.781 81.3 5.239 95.99-36.73 11.84-33.79-.589-53.28-25-65.99 17.78-4.098 31.17-15.79 34.75-39.95zm-62.18 87.18c-8.41 33.79-65.31 15.52-83.75 10.94l14.94-59.9c18.45 4.603 77.6 13.72 68.81 48.96zm8.417-87.67c-7.673 30.74-55.03 15.12-70.39 11.29l13.55-54.33c15.36 3.828 64.84 10.97 56.85 43.03z"></path></svg>

                    Mint NFT

                </button>
            </form>
            {/* </div> */}

            {/* <button type="button" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">
                Cyan to Blue
            </button> */}


        </section>

    )
}

export default MintNFT;