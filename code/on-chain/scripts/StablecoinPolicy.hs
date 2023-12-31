{-# LANGUAGE DataKinds              #-}
{-# LANGUAGE NoImplicitPrelude      #-}
{-# LANGUAGE TemplateHaskell        #-}
{-# LANGUAGE DeriveGeneric          #-}
{-# LANGUAGE DeriveAnyClass         #-}
{-# LANGUAGE ScopedTypeVariables    #-}
{-# LANGUAGE MultiParamTypeClasses  #-}
{-# LANGUAGE OverloadedStrings      #-}
{-# LANGUAGE NumericUnderscores     #-}
{-# OPTIONS_GHC -Wno-unused-imports #-}

module StablecoinPolicy where

import Plutus.V2.Ledger.Api
    ( ScriptContext(scriptContextTxInfo),
      PubKeyHash,
      Datum(Datum),
      TxInfo (txInfoOutputs, TxInfo, txInfoReferenceInputs, txInfoMint, txInfoInputs),
      OutputDatum(OutputDatumHash, NoOutputDatum, OutputDatum),
      TxOut(txOutDatum, txOutValue, txOutAddress), BuiltinData, Validator, mkValidatorScript, UnsafeFromData (unsafeFromBuiltinData), ValidatorHash, TxInInfo (txInInfoResolved), adaSymbol, adaToken, TokenName )
import Plutus.V2.Ledger.Contexts
    ( findDatum, txSignedBy, getContinuingOutputs, scriptOutputsAt, ownCurrencySymbol, valueLockedBy, valuePaidTo, valueSpent )
import PlutusTx
    ( unstableMakeIsData,makeLift, compile, CompiledCode )
import PlutusTx.Prelude
    ( Bool (..),
      Integer,
      Maybe(..), traceIfFalse, ($), (&&), not, traceError, fst, snd, Ord ((>), (<), (>=)), (||), (*), divide, (-)
      )
import           Prelude                    (Show, undefined, IO)
import Plutus.V1.Ledger.Value
    ( AssetClass(AssetClass), assetClassValueOf, valueOf )
import Utilities (wrapPolicy, writeCodeToFile)
import OracleValidator (OracleDatum (mintAllowed, burnAllowed, rate, reserveValidatorHash), getOracleDatumFromRef, parseOracleDatum)

data StablecoinMintParams = StablecoinMintParams {
    tokenName :: TokenName ,
    oracleValidator :: ValidatorHash
    -- reserveValidator :: ValidatorHash
} deriving Show
makeLift ''StablecoinMintParams

data StablecoinRedeemer = Mint | Burn
unstableMakeIsData ''StablecoinRedeemer

{-# INLINABLE mkStablecoinMintingpolicy #-}
mkStablecoinMintingpolicy :: StablecoinMintParams -> StablecoinRedeemer -> ScriptContext -> Bool
mkStablecoinMintingpolicy scParams tRedeemer ctx = case tRedeemer of 
                                                        Mint ->  traceIfFalse "Minting is not allowed!" canMint && -- This is false when minting is'nt allowed, but we are minting
                                                                traceIfFalse "You can't mint a negative value!" minting &&
                                                                traceIfFalse "Insufficient amount paid to reserve while minting!" checkEnoughPaidToReserve
                                                                
                                                        Burn ->  traceIfFalse "Burning is not allowed!" canBurn  && -- This is false when minting is'nt allowed, but we are minting
                                                                traceIfFalse "You can't burn a positive value!" (not minting) 
                                                                -- traceIfFalse "You can't take that much ADA for those amount of stablecoins!" checkReceivedAmountOnBurn 
                                                                -- check if we are consuming UTxOs from the reserve
    where
        info :: TxInfo
        info = scriptContextTxInfo ctx

        -- ======= Some Helper functions ========
        mintedAmount :: Integer
        mintedAmount = assetClassValueOf (txInfoMint info) $ AssetClass (ownCurrencySymbol ctx, tokenName scParams)
        
        minting :: Bool
        minting = mintedAmount > 0
        
        currentAdaRequiredForStablecoin :: Integer  -- This is the number of ADA required for the amount of Stablecoins we Mint/Burn.
        currentAdaRequiredForStablecoin = (mintedAmount * 1_000_000) * usd_ada_rate

        -- ======== Extract datum data from the Oracle UTxO referenced in this txn ==========
        oracleDatum :: OracleDatum
        oracleDatum = case getOracleDatumFromRef info (oracleValidator scParams) of
                        Just d  -> d
                        Nothing -> traceError "StablecoinMintingPolicy: Invalid Oracle input datum!"

        canMint :: Bool
        canMint = mintAllowed oracleDatum

        canBurn :: Bool
        canBurn = burnAllowed oracleDatum

        usd_ada_rate :: Integer
        usd_ada_rate = rate oracleDatum
        
        -- ========= Check if sufficient funds are sent to the reserve when minting Stablecoins =========
        checkEnoughPaidToReserve :: Bool
        checkEnoughPaidToReserve = if minting 
                                    then amountPaidToReserve >= currentAdaRequiredForStablecoin                   -- We don't mind if you send more ADA ;)
                                    else True        -- This check is irrelevant while burning
            where
                amountPaidToReserve :: Integer
                amountPaidToReserve = case scriptOutputsAt (reserveValidatorHash oracleDatum) info of
                                        [(_ , v)] -> valueOf v adaSymbol adaToken
                                        _         -> traceError "Expected exactly one UTxO to be sent to the Reserve!"

        -- ========= Check if the right amount of funds are consumed from the reserve when burning Stablecoins =========

        -- checkReceivedAmountOnBurn :: Bool
        -- checkReceivedAmountOnBurn = if not minting
        --                             then (paidToUser - changeToReserve) < currentAdaRequiredForStablecoin    -- The ADA you get might be lower than expected due to txn fees 
        --                             else True       -- This check is irrelevant while minting
        --     where
        --         -- paidToUser = valueOf (valuePaidTo info (developerPKH scParams)) adaSymbol adaToken
        --         changeToReserve = valueOf (valueLockedBy info (reserveValidator scParams)) adaSymbol adaToken
        --         paidToUserPKH = assetClassValueOf (valuePaidTo info (... userPKH ...)) $ AssetClass (adaSymbol, adaToken)

        -- totalInputAda = foldl foldOnInputs 0 (txInfoInputs info)
        --     where 
        --         foldOnInputs acc x = acc + valueOf (txOutValue $ txInInfoResolved x) adaSymbol adaToken

-- ======================================================== Boilerplate: Wrap, compile and serialize =============================================================
{-# INLINABLE wrappedStablecoinMintingCode #-}
wrappedStablecoinMintingCode :: BuiltinData -> BuiltinData -> BuiltinData -> BuiltinData -> ()
wrappedStablecoinMintingCode tknName oracle = wrapPolicy $ mkStablecoinMintingpolicy params
    where
        params = StablecoinMintParams {
            tokenName = unsafeFromBuiltinData tknName,
            oracleValidator = unsafeFromBuiltinData oracle
            -- reserveValidator = unsafeFromBuiltinData reserve
        }

compiledStablecoinMintingCode :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> BuiltinData -> ())
compiledStablecoinMintingCode = $$( compile [|| wrappedStablecoinMintingCode ||] )

saveStablecoinMintingCode :: IO()
saveStablecoinMintingCode = writeCodeToFile "./assets/stablecoin_minting.plutus" compiledStablecoinMintingCode