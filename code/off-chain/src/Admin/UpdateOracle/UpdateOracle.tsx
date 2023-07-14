import React, { useState, useContext, useEffect } from "react";
import { AppStateContext } from "../../App";
import { Data, MintingPolicy, PaymentKeyHash, PolicyId, SpendingValidator, UTxO, Unit, applyParamsToScript, fromText, getAddressDetails } from "lucid-cardano";
import axios from "axios";
import { signAndSubmitTx } from "../../Utilities/utilities";

const UpddateOracle = (props: any) => {

    const { appState, setAppState } = useContext(AppStateContext)
    const { lucid, currentWalletAddress, metadata, serialized, serializedParam } = appState

    const [rate, setRate] = useState<any>(0n)
    const [rateDisp, setRateDisp] = useState<string>(metadata.rate)
    const [mintAllowed, setMintAllowed] = useState<boolean>(metadata.mintAllowed)
    const [burnAllowed, setBurnAllowed] = useState<boolean>(metadata.burnAllowed)
    const [serializedOracle, setSerializedOracle] = useState<string>(serialized.oracle)

    useEffect(() => {
        parseRate(rateDisp)
    }, [])
    useEffect(() => {
        props.setOracleDeployed( metadata.oracleAddress && serialized.oracle && serializedParam.oracleParam )
    }, [appState])


    type GetNFTAssetClass = {
        nftPolicyId: Unit;
        nftTokenName: string;
    }
    
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

    type GetFinalScript = {
        oracleValidator: SpendingValidator;
        nftAssetClass: Unit;
    };

    const getFinalScript = async (pkh: PaymentKeyHash): Promise<GetFinalScript> => {
        
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
        return {oracleValidator, nftAssetClass};    // return the oracle validator
    };

    // ======= Helper function to cast the rate type to bigint
    const OracleDatum = Data.Object({   // Define the datatype of the collateral datum
        mintAllowed: Data.Boolean(),
        burnAllowed: Data.Boolean(),
        rate: Data.Integer(),
    });
    type OracleDatum = Data.Static<typeof OracleDatum>;

    const parseRate = (r: string) => {      // Convert rate from string to a bigint number
        const rate = BigInt(Number(r));
        if (Number.isNaN(rate)) alert('Invalid rate!');
        setRate(rate);          // Update rate state
    };

    // Deploy the Oracle for the first time
    const deployOracle = async () => {
        if (!lucid || currentWalletAddress !== metadata.developerAddress) { // check if lucid is connected and that we have an address (our wallet is connected)
            alert("Please connect to the developer's wallet!");
            return;
        }
        const pkh: string = getAddressDetails(metadata.developerAddress).paymentCredential?.hash || ""; // Get the PubKeyHash of our address's paymentCredential
        const { oracleValidator, nftAssetClass } = await getFinalScript(pkh);   // Use our pubkeyHash as a parameter to the script

        if (!oracleValidator || !serializedParam.nftParam) {
            alert("Please mint NFT first!");
            return;
        }
        const oracleAddress = lucid!.utils.validatorToAddress(oracleValidator);  // Get the address of the final oracle script to send the UTxO (NFT + Datum) to

        const oracleDatum: OracleDatum = { mintAllowed, burnAllowed, rate }

        const tx = await lucid! //  build the txn that deploys the oracle
            .newTx()
            .payToContract(
                oracleAddress,
                { inline: Data.to<any>(oracleDatum, OracleDatum) },  // Set the inline datum to the USD/ADA rate ... rate probably has type errors. It should be of type: TUnsafe<bigint>
                { [nftAssetClass]: 1n }                  // We 'pay' 1 NFT to the oracleAddress
            )
            .addSignerKey(pkh)
            .complete();
        // const oracleRefUTxO = await signAndSubmitTx(tx);
        const oracleRefUTxO = 'not yet dawg'

        await axios.put(`/metadata/${metadata.id}`, {
            ...metadata,
            rate: Number(rate),
            mintAllowed: mintAllowed,
            burnAllowed: burnAllowed,
            oracleAddress: oracleAddress,
            oracleTxOutRef: oracleRefUTxO
        })

        await axios.put(`/serialized/${serialized.id}`, {
            ...serialized,
            oracle: serializedOracle
        })
        
        await axios.put(`/serialized-param/${serializedParam.id}`, {
            ...serializedParam,
            oracleParam: oracleValidator.script
        })

        setAppState({
            ...appState,
            metadata: {
                ...metadata,
                rate: Number(rate),
                mintAllowed: mintAllowed,
                burnAllowed: burnAllowed,
                oracleAddress: oracleAddress,
                oracleTxOutRef: oracleRefUTxO
            },
            serialized: {
                ...serialized,
                oracle: serializedOracle
            },
            serializedParam: {
                ...serializedParam,
                oracleParam: oracleValidator.script
            }
        })

    };

    // Helper function to get the UTxO with the NFT at the Oracle's adress
    const getOracleNftUtxO = async (): Promise<UTxO | undefined> => {  // This function is used to get the UTxO at the oracle's address with the NFT

        const { nftPolicyId, nftTokenName } = await getNFTAssetClass()
        const nftAssetClass: Unit = nftPolicyId + nftTokenName;   // This is the asset class of the NFT

        if (lucid) {
            const oracUtxO: void | UTxO[] = await lucid.utxosAt(metadata.oracleAddress).catch((err) => {    // get all UTxOs at oracleAddress
                console.log("Can't find Oracle UtxO");
            });
            if (!oracUtxO) return;
            const oracWithNftUTxO = oracUtxO.find((utxo: UTxO) => {
                return Object.keys(utxo.assets).some((key) => {
                    return key === nftAssetClass;             // find the UTxO with the NFT's assetclass in its Value
                });
            });

            return oracWithNftUTxO
        }
    };

    // Define a type for the redeemer
    const OracleRedeemer = Data.Enum([  
        Data.Literal("Update"),
        Data.Literal("Delete"),
    ]);
    type OracleRedeemer = Data.Static<typeof OracleRedeemer>;

    // Update the Oracle
    const updateOrDeleteOracle = async (action: string) => {
        console.log(metadata.developerAddress)
        const pkh: string = getAddressDetails(metadata.developerAddress).paymentCredential?.hash || ""; // Get PubKeyHash of current wallet

        const { nftPolicyId, nftTokenName } = await getNFTAssetClass()
        const nftAssetClass: Unit = nftPolicyId + nftTokenName;   // This is the asset class of the NFT

        const oracleWithNftUTxO = await getOracleNftUtxO()

        const oracleValidator: SpendingValidator = {
            type: "PlutusV2",
            script: serializedParam.oracleParam
        };

        const oracleDatum: OracleDatum = { mintAllowed, burnAllowed, rate }

        let oracleRefUTxO = 'you should have waited'
        
        if(!oracleWithNftUTxO) return;

        if(action === 'Update'){
            const tx = await lucid! // Build a txn that updates the oracle
                .newTx()
                .collectFrom(
                    [oracleWithNftUTxO],                                // UTXO to spend (the current UTxO with the NFT at the oracleAddress)
                    Data.to<any>("Update", OracleRedeemer)   // Redeemer for the Oracle validator (because we are consuming a UTxO from the oracleAddress)
                )
                .payToContract(
                    metadata.oracleAddress,
                    { inline: Data.to<any>(oracleDatum, OracleDatum) },  // Set the inline datum to the USD/ADA rate ... rate probably has type errors. It should be of type: TUnsafe<bigint>
                    { [nftAssetClass]: 1n }                  // We 'pay' 1 NFT to the oracleAddress
                )
                .attachSpendingValidator(oracleValidator)
                .addSignerKey(pkh)
                .complete();

            // oracleRefUTxO = await signAndSubmitTx(tx);
            oracleRefUTxO = 'updating...'

            await axios.put(`/metadata/${metadata.id}`, {
                ...metadata,
                rate: Number(rate),
                mintAllowed: mintAllowed,
                burnAllowed: burnAllowed,
                oracleTxOutRef: oracleRefUTxO
            })

            setAppState({
                ...appState,
                metadata: {
                    ...metadata,
                    rate: Number(rate),
                    mintAllowed: mintAllowed,
                    burnAllowed: burnAllowed,
                    oracleTxOutRef: oracleRefUTxO
                }
            })
        }
        
        else if(action === 'Delete'){
            const tx = await lucid!
                .newTx()
                .collectFrom(
                    [oracleWithNftUTxO], // UTXO to spend
                    Data.to<any>("Delete", OracleRedeemer) // Redeemer 
                )
                .payToAddress(metadata.developerAddress, { [nftAssetClass]: 1n })    // We send the NFT to our own address
                .attachSpendingValidator(oracleValidator)
                .addSignerKey(pkh)
                .complete();

            // oracleRefUTxO = await signAndSubmitTx(tx);
            oracleRefUTxO = 'Deleting...'

            await axios.put(`/metadata/${metadata.id}`, {
                ...metadata,
                rate: 0,
                mintAllowed: false,
                burnAllowed: false,
                oracleAddress: null,
                oracleTxOutRef: oracleRefUTxO
            })
            await axios.put(`/serialized/${serialized.id}`, {
                ...serialized,
                oracle: null
            })
            
            await axios.put(`/serialized-param/${serializedParam.id}`, {
                ...serializedParam,
                oracleParam: null
            })

            setAppState({
                ...appState,
                metadata: {
                    ...metadata,
                    rate: 0,
                    mintAllowed: false,
                    burnAllowed: false,
                    oracleAddress: '',
                    oracleTxOutRef: oracleRefUTxO
                },
                serialized: {
                    ...serialized,
                    oracle: ''
                },
                serializedParam: {
                    ...serializedParam,
                    oracleParam: ''
                }
            })
        }
    };

    return (
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                { !props.oracleDeployed ? 'Deploy' : 'Update' } Oracle
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about the oracle ...</p>
                
            <form className="mt-8 space-y-6" action="#">
                
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray">Serialized Oracle Validator ... </label>
                <textarea rows={4} className="my-5 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Oracle CBorHex ..." required
                          value={ serializedOracle } onChange={ (e) => setSerializedOracle(e.target.value) } ></textarea>

                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> USD (cents) / ADA Rate ... </label>
                    <input type="number" name="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray-800 dark:focus:ring-blue-200 dark:focus:border-blue-200 mt-5" placeholder="Rate ..." required
                           value={ rateDisp } onChange={ (e) => { parseRate( e.target.value ); setRateDisp( e.target.value ) } } />
                </div>


                <div className="flex items-center pl-4 border border-gray-200 rounded-lg dark:border-gray-300">
                    <input id="bordered-checkbox-1" type="checkbox" value="" name="bordered-checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                           checked={ mintAllowed } onChange={ (e) => setMintAllowed(e.target.checked) } />
                    <label htmlFor="bordered-checkbox-1" className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-700">Minting Allowed</label>
                {/* </div>
                <div className="flex items-center pl-4 border border-gray-200 rounded-lg dark:border-gray-600"> */}
                    <input id="bordered-checkbox-2" type="checkbox" value="" name="bordered-checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                           checked={ burnAllowed } onChange={ (e) => setBurnAllowed(e.target.checked) } />
                    <label htmlFor="bordered-checkbox-2" className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-700">Burning Allowed</label>
                </div>


                {/* <div className="inline-flex justify-center"> */}
                {/* <button type="button" className="w-2/4 px-5 py-3 mx-5 text-base font-medium text-center text-white rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"> Delete Oracle </button> */}
                {
                    !props.oracleDeployed ? 
                        <button type="button" className="w-2/5 px-5 py-2 mx-5 text-base font-medium text-center text-white rounded-lg bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 text-lg"
                                onClick={ deployOracle } > Deploy Oracle </button>
                    :
                    <>
                        <button type="button" className="w-2/5 px-5 py-2 mx-5 text-gray-700 bg-gradient-to-r from-teal-500 to-lime-300 hover:bg-gradient-to-l hover:from-teal-400 hover:to-lime-300 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-lg"
                                onClick={ () => updateOrDeleteOracle('Update') } >Update Oracle</button>
    
                        <button type="button" className="w-2/5 px-5 py-2 mx-5 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-lg"
                                onClick={ () => updateOrDeleteOracle('Delete') } >Delete Oracle</button>
                    </>
                }
                {/* </div> */}
            
            </form>

        </section>
    )
}

export default UpddateOracle;