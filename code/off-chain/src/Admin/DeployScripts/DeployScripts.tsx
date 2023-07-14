import React, { useContext, useState } from "react";
import { AppStateContext } from "../../App";
import { SpendingValidator, Unit, PaymentKeyHash, Data, applyParamsToScript, MintingPolicy, PolicyId, fromText, getAddressDetails } from "lucid-cardano";
import { signAndSubmitTx } from "../../Utilities/utilities";
import axios from "axios";

const DeployScripts = () => {

    const { appState, setAppState } = useContext(AppStateContext)
    const { lucid, metadata, serialized, serializedParam } = appState

    const [serializedOracle, setSerializedOracle] = useState<string>(serialized.oracle)
    const [serializedReserve, setSerializedReserve] = useState<string>(serialized.reserve)
    const [stablecoinTokenName, setStablecoinTokenName] = useState<string>(metadata.stablecoinTokenName)
    const [serializedStablecoin, setSerializedStablecoin] = useState<string>(serialized.stablecoin)

    type GetNFTAssetClass = {
        nftPolicyId: Unit;
        nftTokenName: string;
    }
    
    // **************************************************************************** GET ORACLE VALIDATOR ****************************************************************************
    // Helper function to get the AssetClass of the NFT
    const getNFTAssetClass = async (): Promise<GetNFTAssetClass> => {
        const nftPolicy: MintingPolicy = {
            type: "PlutusV2",
            script: serializedParam.nftParam
        };

        const nftPolicyId: PolicyId = lucid!.utils.mintingPolicyToId(nftPolicy);
        const nftTokenName = fromText(metadata.nftTokenName); 
        // const nftAssetClass: Unit = nftPolicyId + nftTokenName;   // This is the asset class of the NFT
        
        return { nftPolicyId, nftTokenName }
    }

    const getFinalOracleValidator = async (pkh: PaymentKeyHash): Promise<SpendingValidator> => {
        
        const { nftPolicyId, nftTokenName } = await getNFTAssetClass()
        const nftAssetClass: Unit = nftPolicyId + nftTokenName;   // This is the asset class of the NFT

        const Params = Data.Tuple([Data.Bytes(), Data.Bytes(), Data.Bytes()]); // NFT PolicyId (CurSym) -> NFT TokenName -> Operator PubKeyHash
        type Params = Data.Static<typeof Params>;
        const oracleValidator: SpendingValidator = {
            type: "PlutusV2",
            script: applyParamsToScript<any>(   // <Params>
                serializedOracle,
                [nftPolicyId, nftTokenName, pkh],
                Params
            ),
        };
        return oracleValidator;    // return the oracle validator
    };
    
    // **************************************************************************** DEPLOY RESERVE VALIDATOR ****************************************************************************
    const getFinalReserveValidator = async (): Promise<SpendingValidator | undefined> => {
        if (!lucid) return;
        
        const devPKH: PaymentKeyHash = getAddressDetails(metadata.developerAddress).paymentCredential?.hash || ""; // Get the PubKeyHash of our address's paymentCredential
        const oracleValidatorHash = await lucid.utils.validatorToScriptHash(        // Hash the oracleScript
            await getFinalOracleValidator(devPKH)
        );

        const Params = Data.Tuple([Data.Bytes(), Data.Bytes()]);    // OracleValidatorHash -> CollateralValidatorHash -> CollateralMinPercent
        type Params = Data.Static<typeof Params>;
        const reserveValidator: SpendingValidator = {
            type: "PlutusV2",
            script: applyParamsToScript<any>(   // <Params>
                serializedReserve,
                [oracleValidatorHash, devPKH],
                Params
            ),
        };
        return reserveValidator;
    }

    const deployReserveValidator = async () => {
        if (!lucid) return;

        const reserveValidator = await getFinalReserveValidator();      // Get the final Stablecoin MintingPolicy

        if (!reserveValidator) return;
        const tx = await lucid  // Build the txn to deploy both scripts
            .newTx()
            .payToAddressWithData(
                metadata.developerAddress,
                { inline: Data.void(), scriptRef: reserveValidator },   // Attach the CollateralValidator script
                {}      // We explicitly provide no Value ... min ADA will be automatically provided
            )
            .complete();    // Balance the txn (provide min ADA)

        const reserveRefScriptUTxO = await signAndSubmitTx(tx);
        const reserveAddress = lucid!.utils.validatorToAddress(reserveValidator); 

        await axios.put(`/metadata/${metadata.id}`, {
            ...metadata,
            reserveAddress: reserveAddress,
            reserveRefScriptUTxO: reserveRefScriptUTxO
        })
        await axios.put(`/serialized/${serialized.id}`, {
            ...serialized,
            reserve: serializedReserve
        })
        
        await axios.put(`/serialized-param/${serializedParam.id}`, {
            ...serializedParam,
            reserveParam: reserveValidator.script
        })

        setAppState({
            ...appState,
            metadata: {
                ...metadata,
                reserveAddress: reserveAddress,
                reserveRefScriptUTxO: reserveRefScriptUTxO
            },
            serialized: {
                ...serialized,
                reserve: serializedReserve
            },
            serializedParam: {
                ...serializedParam,
                reserveParam: reserveValidator.script
            }
        })

    }

    // **************************************************************************** DEPLOY STABLECOIN MINTING POLICY ****************************************************************************
    const getFinalStablecoinPolicy = async (): Promise<MintingPolicy | undefined> => {
        if (!lucid) return;

        const devPKH: PaymentKeyHash = getAddressDetails(metadata.developerAddress).paymentCredential?.hash || ""; // Get the PubKeyHash of our address's paymentCredential
        const oracleValidatorHash = await lucid.utils.validatorToScriptHash(        // Hash the oracleScript
            await getFinalOracleValidator(devPKH)
        );

        const tokenName = fromText(stablecoinTokenName);

        const Params = Data.Tuple([Data.Bytes(), Data.Bytes()]);    // OracleValidatorHash -> CollateralValidatorHash -> CollateralMinPercent
        type Params = Data.Static<typeof Params>;
        const stablecoinPolicy: MintingPolicy = {
            type: "PlutusV2",
            script: applyParamsToScript<any>(   // <Params>
                serializedStablecoin,
                [tokenName, oracleValidatorHash],
                Params
            ),
        };

        return stablecoinPolicy;
    }

    const deployStablecoinPolicy = async () => {
        if (!lucid) return;

        const stablecoinPolicy = await getFinalStablecoinPolicy();      // Get the final Stablecoin MintingPolicy

        if (!stablecoinPolicy) return;
        const tx = await lucid  // Build the txn to deploy both scripts
            .newTx()
            .payToAddressWithData(
                metadata.developerAddress,
                { inline: Data.void(), scriptRef: stablecoinPolicy },   // Attach the CollateralValidator script
                {}      // We explicitly provide no Value ... min ADA will be automatically provided
            )
            .complete();    // Balance the txn (provide min ADA)

        const stablecoinRefScriptUTxO = await signAndSubmitTx(tx);

        await axios.put(`/metadata/${metadata.id}`, {
            ...metadata,
            stablecoinTokenName: stablecoinTokenName,
            stablecoinRefScriptUTxO: stablecoinRefScriptUTxO
        })
        await axios.put(`/serialized/${serialized.id}`, {
            ...serialized,
            stablecoin: serializedStablecoin
        })
        
        await axios.put(`/serialized-param/${serializedParam.id}`, {
            ...serializedParam,
            stablecoinParam: stablecoinPolicy.script
        })

        setAppState({
            ...appState,
            metadata: {
                ...metadata,
                stablecoinTokenName: stablecoinTokenName,
                stablecoinRefScriptUTxO: stablecoinRefScriptUTxO
            },
            serialized: {
                ...serialized,
                stablecoin: serializedStablecoin
            },
            serializedParam: {
                ...serializedParam,
                stablecoinParam: stablecoinPolicy.script
            }
        })

    }


    return (
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                Deploy Scripts
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about deploying ...</p>
                
            <form className="mt-8 space-y-6" action="#">

                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Serialized Oracle Validator ... </label>
                <textarea rows={4} className="my-5 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Serialized Oracle Validator ..." required
                          value={ serializedOracle } onChange={ (e) => setSerializedOracle(e.target.value) } ></textarea>

                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Reserve Validator ... </label>

                <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <div className="bg-white rounded-t-lg dark:bg-gray-700">
                        <textarea rows={4} className="w-full block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Serialized Reserve Validator ..." required
                                  value={ serializedReserve } onChange={ (e) => setSerializedReserve(e.target.value) } ></textarea>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1 border-t dark:border-gray-600">
                        <button type="button" className="inline-flex items-center py-2.5 px-4 text-xs text-gray-800 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg"
                                onClick={ deployReserveValidator } >
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
                           value={ stablecoinTokenName } onChange={ (e) => setStablecoinTokenName(e.target.value) }  />
                    <div className="bg-white rounded-t-lg dark:bg-gray-700">
                        <textarea rows={4} className="w-full block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Serialized Stablecoin Policy ..." required
                                  value={ serializedStablecoin } onChange={ (e) => setSerializedStablecoin(e.target.value) } ></textarea>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1 border-t dark:border-gray-600">
                        <button type="button" className="inline-flex items-center py-2.5 px-4 text-xs text-gray-800 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg"
                                onClick={ deployStablecoinPolicy } >
                            Deploy Stablecoin Policy
                        </button>
                    </div>
                </div>


            </form>

        </section>
    )
}

export default DeployScripts;