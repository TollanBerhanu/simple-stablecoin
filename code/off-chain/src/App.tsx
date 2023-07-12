import React, { Dispatch, SetStateAction, createContext, useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import Layout from './Layout/Layout';
import { Address, Blockfrost, Lucid } from 'lucid-cardano';
import axios from 'axios';

// ***************************************** Global App State **********************************************
export type AppState = {
  lucid?: Lucid;
  currentWalletAddress?: Address;
  nftTokenNameHex?: string;

  stablecoinTokenName?: string;

  mintAllowed?: boolean;
  burnAllowed?: boolean;
  rate?: number;

  developerAddress?: string;

  default?: string;

  metadata?: any;
  serialized?: any;
  // metadata?: {
  //   id: number;
  //   mintAllowed: boolean;
  //   burnAllowed: boolean;
  //   rate: number;
    
  //   developerAddress: string;
  //   stablecoinTokenName: string;
  //   nftTokenName: string;

  //   nftPolicyId: string;
  //   oraclePolicyId: string;
  //   reservePolicyId: string;
  //   stablecoinPolicyId: string;
  // }
}
// *********************************************************************************************************

const initialAppState: AppState = {
  metadata: {
    id: 0,
    mintAllowed: true,
    burnAllowed: true,
    rate: 0,
    
    developerAddress: '',
    stablecoinTokenName: '',
    nftTokenName: '',

    nftPolicyId: '',
    oraclePolicyId: '',
    reservePolicyId: '',
    stablecoinPolicyId: '',
  },

  serialized: {
    id: '',
    nft: '',
    oracle: '',
    reserve: '',
    stablecoin: '',
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

            setAppState({
              ...appState,
              metadata: {
                id: res.data.id,
                mintAllowed: res.data.mintAllowed,
                burnAllowed: res.data.burnAllowed,
                rate: res.data.rate,
                
                developerAddress: res.data.developerAddress,
                stablecoinTokenName: res.data.stablecoinTokenName,
                nftTokenName: res.data.nftTokenName,

                nftPolicyId: res.data.nftPolicyId,
                oraclePolicyId: res.data.oraclePolicyId,
                reservePolicyId: res.data.reservePolicyId,
                stablecoinPolicyId: res.data.stablecoinPolicyId
              },
              serialized: {
                id: res2.data.id,
                nft: res2.data.nft,
                oracle: res2.data.oracle,
                reserve: res2.data.res2erve,
                stablecoin: res2.data.stablecoin,
              }
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
