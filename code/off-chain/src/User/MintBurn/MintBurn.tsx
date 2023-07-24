import React, { useContext, useState } from "react";
import { AppStateContext } from "../../App";
import { Data, MintingPolicy, PolicyId, SpendingValidator, UTxO, Unit, fromText, getAddressDetails } from "lucid-cardano";
import { findUTxO, signAndSubmitTx } from "../../Utilities/utilities";

const MintBurn = (props: any) => {

    const name: string = props.info.name
    const icon = props.info.icon
    const buttonStyle = name === 'Mint' ? 'w-1/4 px-5 py-3 text-gray-700 font-bold bg-gradient-to-br font-medium rounded-lg text-lg text-center from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800' :
                                         'w-1/4 px-5 py-3 text-gray-700 font-bold bg-gradient-to-br font-medium rounded-lg text-lg text-center from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800'
  {/* A less dramatic Mint button style: 'w-1/4 px-5 py-3 text-gray-700 font-bold bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-lg text-center' */}
    
    const { appState, setAppState } = useContext(AppStateContext)
    const { lucid, currentWalletAddress, metadata, serializedParam } = appState

    const [ amount, setAmount ] = useState(0n)

    const MintBurnRedeemer = Data.Enum([
        Data.Literal("Mint"),
        Data.Literal("Burn")
    ]);
    type MintBurnRedeemer = Data.Static<typeof MintBurnRedeemer>;

    const getStablecoinPolicy = async (): Promise<MintingPolicy | undefined> => {
        const stablecoinPolicy: MintingPolicy = {
            type: "PlutusV2",
            script: serializedParam.stablecoinParam
        };
        
        return stablecoinPolicy
    }

    const getReserveValidator = async (): Promise<SpendingValidator | undefined> => {
        const reserveValidator: SpendingValidator = {
            type: "PlutusV2",
            script: serializedParam.reserveParam
        };
        
        return reserveValidator
    }


    const getStablecoinAssetClass = async (): Promise<string | undefined> => {
        const stablecoinPolicy: MintingPolicy = {
            type: "PlutusV2",
            script: serializedParam.stablecoinParam
        };

        const stablecoinPolicyId: PolicyId = lucid!.utils.mintingPolicyToId(stablecoinPolicy);
        const stablecoinTokenName = fromText(metadata.stablecoinTokenName); 
        
        return stablecoinPolicyId + stablecoinTokenName;
    }

    const getNFTAssetClass = async (): Promise<Unit> => {
        const nftPolicy: MintingPolicy = {
            type: "PlutusV2",
            script: serializedParam.nftParam
        };

        const nftPolicyId: PolicyId = lucid!.utils.mintingPolicyToId(nftPolicy);
        const nftTokenName = fromText(metadata.nftTokenName); 
        // const nftAssetClass: Unit = nftPolicyId + nftTokenName;   // This is the asset class of the NFT
        
        return nftPolicyId + nftTokenName
    }

    const getOracleNftUtxO = async () => {  // This function is used to get the UTxO at the oracle's address with the NFT
        const nftAssetClass = await getNFTAssetClass()

        if (!lucid) return;
        const oracUtxO = await lucid.utxosAt(metadata.oracleAddress).catch((err) => {    // get all UTxOs at oracleAddress
            console.log("Can't find Oracle UtxO");
        });

        if (!oracUtxO) return;
        const oracWithNftUTxO = oracUtxO.find((utxo: UTxO) => {
            return Object.keys(utxo.assets).some((key) => {
                return key === nftAssetClass;             // find the UTxO with the NFT's assetclass in its Value
            });
        });

        return oracWithNftUTxO
    };

    const mintStablecoin = async () => {
        const stablecoinAssetClass = await getStablecoinAssetClass()
        const oracleWithNftUTxO = await getOracleNftUtxO()
        const stablecoinPolicyRef = await findUTxO(lucid!, metadata.stablecoinRefScriptUTxO + '#0');
        const oracleNFTUTxO = await findUTxO(lucid!, metadata.oracleTxOutRef + '#0');
        const stablecoinPolicy = await getStablecoinPolicy()

        console.log('************** UTxOs: *************')
        console.log(oracleWithNftUTxO)
        console.log(oracleNFTUTxO)
        console.log(stablecoinPolicyRef)

        
        // if (!currentWalletAddress || !lucid || !stablecoinAssetClass) return;
        
        const pkh: string = getAddressDetails(currentWalletAddress!).paymentCredential?.hash || ''; // get current address's PubKeyHash

        const reserveAddress = metadata.reserveAddress

        const tx = await lucid!
            .newTx()
            .readFrom([oracleWithNftUTxO!])    // We explicitly read the UTxO containing stablecoin policy
            .payToContract(
                reserveAddress,
                {
                     inline: Data.void(),
                },
                { lovelace: amount * BigInt(metadata.rate) * 1000001n }    // We get the 'collValueToLock' from the UI and convert it to lovelace
            )
            .mintAssets(                                    // We mint the stablecoin in the same txn
                { [stablecoinAssetClass!]: amount },            // [AssetClass]: amount
                Data.to<any>("Mint", MintBurnRedeemer)     // "Value", datatype
            )
            .addSignerKey(pkh)
            .attachMintingPolicy(stablecoinPolicy!)
            .complete();

        await signAndSubmitTx(tx);
    }

    const collectReserveUTxOs = async (): Promise<UTxO[] | undefined> => {
        if (!lucid) return;
        const reserveUtxOs = await lucid.utxosAt(metadata.reserveAddress).catch((err) => {    // get all UTxOs at oracleAddress
            console.log("Can't find Oracle UtxO");
        });
        console.log('Reserve UTxOs ... ')
        console.log(reserveUtxOs)
        if (!reserveUtxOs) return;
        
        let utxos: UTxO[] = []
        const requiredAmount = amount * BigInt(metadata.rate) * 1000000n
        let totalAda = 0n
        
        for (let i=0; i < (reserveUtxOs.length); i++) {
            let utxo = reserveUtxOs[i]
            totalAda += utxo.assets.lovelace;
            utxos.push(utxo)

            console.log('TotalAda: ', Number(totalAda)/1000000)
            console.log('Required Amount: ', Number(requiredAmount)/1000000)
            console.log('Total > Required: ', totalAda > requiredAmount)

            if (totalAda > requiredAmount) break
        }

        return utxos
    }

    const burnStablecoin = async () => {
        const stablecoinAssetClass = await getStablecoinAssetClass()
        const stablecoinPolicyRef = await findUTxO(lucid!, metadata.stablecoinRefScriptUTxO + '#0');
        const reserveValidatorRef = await findUTxO(lucid!, metadata.reserveRefScriptUTxO + '#0');
        const oracleNFTUTxO = await getOracleNftUtxO() //await findUTxO(lucid!, metadata.oracleTxOutRef + '#0');
        const stablecoinPolicy = await getStablecoinPolicy()
        const reserveValidator = await getReserveValidator()
        const reserveUtxOs = await collectReserveUTxOs()
        const totalAda = reserveUtxOs!.reduce((total, utxo) => total + utxo.assets.lovelace, 0n)
        console.log('From burn1: ', reserveUtxOs)
        console.log('From burn2: ', totalAda)
      
        const reserveAddress = metadata.reserveAddress

        if (!reserveUtxOs || !currentWalletAddress || !lucid || !stablecoinAssetClass) return;
        
        const pkh: string = getAddressDetails(currentWalletAddress!).paymentCredential?.hash || ''; // get current address's PubKeyHash

        const tx = await lucid
            .newTx()
            .readFrom([ oracleNFTUTxO! ])           // We explicitly read the UTxO containing the Reference scripts and the Oracle
            .collectFrom(
                reserveUtxOs,                                        // We explicitly input the UTxOs in the reserve address
                Data.void()      // We provide the appropriate redeemer
            )
            .attachSpendingValidator(reserveValidator!)
            .payToContract(
                reserveAddress,
                {
                     inline: Data.void(),
                },
                { lovelace: (totalAda - (amount * BigInt(metadata.rate) * 1000000n)) }    // We get the 'collValueToLock' from the UI and convert it to lovelace
            )
            // .payToAddress(metadata.developerAddress, { lovelace: 2n })
            .mintAssets(                                    // We mint the stablecoin in the same txn
                { [stablecoinAssetClass]: -amount },            // [AssetClass]: amount
                Data.to<any>("Burn", MintBurnRedeemer)     // "Value", datatype
            )
            .attachMintingPolicy(stablecoinPolicy!)
            .addSignerKey(pkh)
            .complete();

        await signAndSubmitTx(tx);
    }

    return(
        <section className="py-8 px-4 m-6">

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray mb-4">
                { name } Stablecoins
            </h2>

            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-lg dark:text-gray-500">Some info text about "{ name }ing" ...</p>
                
            <form className="mt-8 space-y-6" action="#">
                <div>
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"> Enter amount to <span className="lowercase">{ name }</span> ... </label>
                    <input type="number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:placeholder-gray-700 dark:text-gray dark:focus:ring-blue-200 dark:focus:border-blue-200" placeholder="Amount" required
                           value={ Number(amount) } onChange={ (e) => setAmount( BigInt(e.target.value) ) } />
                </div>
                <button type="button" className ={buttonStyle} onClick={ (name == 'Mint') ? mintStablecoin : burnStablecoin } >
                    { name }
                </button>

                {/* <br />
                <button type="button" className ={'w-1/2 bg-gray-200' + buttonStyle} onClick={ collectReserveUTxOs } >
                    Reserve UTxOs
                </button> */}

                {/* <button type="button" className ={buttonStyle} onClick={ (name == 'Mint') ? mintStablecoin : burnStablecoin } >
                    Mint
                </button>

                <button type="button" className ={buttonStyle} onClick={ burnStablecoin } >
                    Burn
                </button> */}
            
            </form>

        </section>
    )

}

export default MintBurn;