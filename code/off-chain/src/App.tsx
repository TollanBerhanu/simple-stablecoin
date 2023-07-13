import React, { Dispatch, SetStateAction, createContext, useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import Layout from './Layout/Layout';
import { Address, Blockfrost, Lucid, MintingPolicy } from 'lucid-cardano';
import axios from 'axios';

// ***************************************** Global App State **********************************************
export type AppState = {
  lucid?: Lucid;
  currentWalletAddress?: Address;
  
  nftTokenName?: string;
  stablecoinTokenName?: string;

  mintAllowed?: boolean;
  burnAllowed?: boolean;
  rate?: any;

  developerAddress?: string;
  oracleAddress?: string;
  reserveAddress?: string;

  metadata?: any;
  serialized?: any;
  serializedParam?: any;
  
}
// *********************************************************************************************************

const initialAppState: AppState = {
  metadata: {
    id: 0,
    mintAllowed: true,
    burnAllowed: true,
    rate: 0n,
    
    developerAddress: '',
    oracleAddress: '',
    reserveAddress: '',

    nftTokenName: '',
    stablecoinTokenName: '',

    nftTxOutRef: '',
    oracleTxOutRef: '',
    
    reserveRefScriptUTxO: '',
    stablecoinRefScriptUTxO: ''
  },

  serialized: {
    id: '',
    nft: '',
    oracle: '',
    reserve: '',
    stablecoin: '',
  },

  serializedParam: {
    id: '',
    nftParam: '',
    oracleParam: '',
    reserveParam: '',
    stablecoinParam: '',
  }
}

export const AppStateContext = createContext<{
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}>({ appState: initialAppState, setAppState: () => {} });

export default function App() {

  const [appState, setAppState] = useState<AppState>(initialAppState)  // {} is the initial AppState

  const getLucidInstance = async (): Promise<Lucid> => {
    const lucid = await Lucid.new(
          new Blockfrost(
              "https://cardano-preview.blockfrost.io/api/v0",
              'previewTboSqp1nB894P6wgrGA1PBv8rgUvIS5v'
          ),
          "Preview"
      );
      if (!window.cardano.nami) {
          window.alert("Please install Nami Wallet");
          // return;
      }
      const nami = await window.cardano.nami.enable();
      lucid.selectWallet(nami);

      setAppState({
        ...appState,
        lucid: lucid,
        currentWalletAddress: await lucid.wallet.address()
      })

      return lucid;
  };

  useEffect(() => {
  
    axios.get('/metadata/-1')
        .then(res => {

          axios.get('/serialized/-1')
          .then((res2) => {

            axios.get('/serialized-param/-1')
            .then((res3) => {

              setAppState({
                ...appState,
                metadata: {
                  id: res.data.id,
                  mintAllowed: res.data.mintAllowed,
                  burnAllowed: res.data.burnAllowed,
                  rate: res.data.rate,
                  
                  developerAddress: res.data.developerAddress,
                  oracleAddress: res.data.oracleAddress,
                  reserveAddress: res.data.reserveAddress,

                  stablecoinTokenName: res.data.stablecoinTokenName,
                  nftTokenName: res.data.nftTokenName,


                  nftTxOutRef: res.data.nftTxOutRef,
                  oracleTxOutRef: res.data.oracleTxOutRef,
                  
                  reserveRefScriptUTxO: res.data.reserveRefScriptUTxO,
                  stablecoinRefScriptUTxO: res.data.stablecoinRefScriptUTxO
                },
                serialized: {
                  id: res2.data.id,
                  nft: res2.data.nft,
                  oracle: res2.data.oracle,
                  reserve: res2.data.res2erve,
                  stablecoin: res2.data.stablecoin,
                },
                serializedParam: {
                  id: res3.data.id,
                  nftParam: res3.data.nftParam,
                  oracleParam: res3.data.oracleParam,
                  reserveParam: res3.data.res2erveParam,
                  stablecoinParam: res3.data.stablecoinParam,

                }
              })

            })
            
          })
        })

    // if (appState.lucid) return;
    // getLucidInstance();

  }, [])

  useEffect(() => {

    if (appState.lucid) return;
    getLucidInstance();

  }, [appState]);
  
  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <AppStateContext.Provider value={ { appState, setAppState } }>
            <Layout />
          </AppStateContext.Provider>
        }/>
      </Routes>
    </Router>
  );
}
