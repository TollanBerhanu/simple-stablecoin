import React, { Dispatch, SetStateAction, createContext, useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import Layout from './Layout/Layout';
import { Address, Blockfrost, Lucid } from 'lucid-cardano';


export type AppState = {
  lucid?: Lucid;
  walletAddress?: Address;
  nftTokenNameHex?: string;
  default?: string
}

const initialAppState: AppState = {
  default: 'default'
};

export const AppStateContext = createContext<{
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}>({ appState: initialAppState, setAppState: () => {} });

export default function App() {

  const [appState, setAppState] = useState<AppState>({})  // {} is the initial AppState

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
        lucid: lucid,
        walletAddress: await lucid.wallet.address()
      })

      return lucid;
  };

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
