{-# LANGUAGE DataKinds         #-}
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE TemplateHaskell   #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DeriveAnyClass #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings  #-}
{-# OPTIONS_GHC -Wno-unused-imports #-}
{-# LANGUAGE NumericUnderscores #-}

module ReserveValidator where

import Plutus.V2.Ledger.Api
    ( ScriptContext(scriptContextTxInfo),
      PubKeyHash,
      Datum(Datum),
      TxInfo (txInfoOutputs, TxInfo, txInfoMint, txInfoReferenceInputs, txInfoInputs, txInfoFee),
      OutputDatum(OutputDatumHash, NoOutputDatum, OutputDatum),
      TxOut(txOutDatum, txOutValue, txOutAddress, TxOut), BuiltinData, Validator, mkValidatorScript, UnsafeFromData (unsafeFromBuiltinData), ValidatorHash, adaToken, TxInInfo (txInInfoResolved, TxInInfo), Address (Address), BuiltinByteString )
import Plutus.V2.Ledger.Contexts
    ( findDatum, txSignedBy, getContinuingOutputs, valueProduced, scriptOutputsAt, valueLockedBy, ownHash, findOwnInput )
import PlutusTx
    ( unstableMakeIsData,
      FromData(fromBuiltinData),
      makeLift, compile, applyCode, liftCode, CompiledCode )
import PlutusTx.Prelude
    ( Bool (..),
      Integer,
      Maybe(..), traceIfFalse, ($), (&&), head, Eq ((==)), (.), not, negate, traceError, (*), filter, divide, foldl, (+), (-), (||), Ord ((>=), (<)), consByteString, emptyByteString, otherwise, quotient, Semigroup ((<>)), remainder, decodeUtf8, appendString
      )
import           Prelude                    (Show (show), undefined, IO, lookup)
import Plutus.V1.Ledger.Value
    ( AssetClass(AssetClass), assetClassValueOf, adaSymbol, valueOf, assetClass )
import Data.Aeson (Value(Bool))
import Utilities (wrapValidator, writeCodeToFile)
import OracleValidator (OracleDatum (rate, stablecoinPolicyId, stablecoinTokenName), getOracleDatumFromRef, lovelaceValueOf)
import Plutus.V1.Ledger.Address (scriptHashAddress)


data ReserveParams = ReserveParams {
    -- stablecoinMintingPolicy :: AssetClass ,
    oracleValidator :: ValidatorHash ,
    developerPKH :: PubKeyHash
}
makeLift ''ReserveParams

{-# INLINABLE  mkReserveValidator #-}
mkReserveValidator :: ReserveParams -> () -> () -> ScriptContext -> Bool
mkReserveValidator rParams _ _ ctx =    traceIfFalse "ReserveValidator: You must burn your tokens to access the reserve unless you are an admin!" developerSigned  ||
                                        -- traceIfFalse "The net value of ADA consumed from the Reserve exceeds the required amount!" checkRightAmountConsumed
                                        traceIfFalse ( appendString
                                                    (appendString ("ReqAda: " `appendString` decodeUtf8 (integerToBS requiredAdaForTokens)) (" *** NetAda: " `appendString` decodeUtf8 (integerToBS netAdaConsumed)))
                                                    (appendString ("\nTotalIp: " `appendString` decodeUtf8 (integerToBS totalInputFromReserve)) (" *** TotalOp: " `appendString` decodeUtf8 (integerToBS totalOutputToReserve)))
                                                    )
                                                        checkRightAmountConsumed
    where
        -- Convert from an integer to its text representation. Example: 123 => "123"
        integerToBS :: Integer -> BuiltinByteString
        integerToBS x
            -- 45 is ASCII code for '-'
            | x < 0 = consByteString 45 $ integerToBS (negate x)
            -- x is single-digit
            | x `quotient` 10 == 0 = digitToBS x
            | otherwise = integerToBS (x `quotient` 10) <> digitToBS (x `remainder` 10)
            where
                    digitToBS :: Integer -> BuiltinByteString
                    -- 48 is ASCII code for '0'
                    digitToBS d = consByteString (d + 48) emptyByteString

        info :: TxInfo
        info = scriptContextTxInfo ctx

        oracleDatum :: OracleDatum
        oracleDatum = case getOracleDatumFromRef info (oracleValidator rParams) of
                            Just dtm -> dtm
                            Nothing  -> traceError "ReserveValidator: Invalid input Oracle Datum!"

        -- ========= Check if the developer has signed ===========
        developerSigned :: Bool
        developerSigned = txSignedBy info $ developerPKH rParams


        -- =========== Calculate the net Ada consumed by the user when burning Stablecoins =========
            
        totalInputFromReserve :: Integer            -- This should be the total amount of Ada UTxOs we consume from the ReserveValidator while burning
        totalInputFromReserve = foldl (\acc x -> acc + filterByAddress (txInInfoResolved x)) 0 allInputs
            where 
                    allInputs = txInfoInputs info             -- This is the list of all the input UTxOs of the txn (the ones we consume from the Reserve)

                    ownAddress :: Address
                    ownAddress = case findOwnInput ctx of
                                    Just txin -> txOutAddress $ txInInfoResolved txin
                                    Nothing -> traceError "ReserveValidator: You are not spending any UTxO from the Reserve!"

                    filterByAddress :: TxOut -> Integer
                    filterByAddress txout = if txOutAddress txout == ownAddress
                                                then lovelaceValueOf (txOutValue txout)
                                                else 0
        -- totalOutputAda :: Integer 
        -- totalOutputAda = foldl (\acc x -> acc + lovelaceValueOf (txOutValue x)) 0 allOutputs
        --     where allOutputs = getContinuingOutputs ctx     -- This is the list of all the output UTxOs we pay to the Reserve (the change we give back) 

        totalOutputToReserve :: Integer          -- This should be the change we are giving back to the ReserveValidator while burning
        totalOutputToReserve = lovelaceValueOf (valueLockedBy info (ownHash ctx))

        netAdaConsumed :: Integer               -- Net ADA = (the total ada values of UTxOs coumed from the reserve) - (the change we give back to the reserve)
        netAdaConsumed = totalInputFromReserve - totalOutputToReserve


        -- ========= Check if there are sufficient tokens burnt for the amount of ADA unlocked ===========
        requiredAdaForTokens :: Integer    -- Bool
        requiredAdaForTokens = (totalTokensBurnt * 1_000_000) * rate oracleDatum    -- < totalAdaProduced
            where
                    totalTokensBurnt :: Integer
                    totalTokensBurnt = negate $ assetClassValueOf (txInfoMint info) (assetClass (stablecoinPolicyId oracleDatum) (stablecoinTokenName oracleDatum))


        -- ========= Check if the right amount of funds are consumed from the reserve when burning Tokens =========
        checkRightAmountConsumed :: Bool
        checkRightAmountConsumed = requiredAdaForTokens >= netAdaConsumed   -- You can consume at most the required amount from the reserve


-- ======================================================== Boilerplate: Wrap, compile and serialize =============================================================
{-# INLINABLE wrappedReserveCode #-}
wrappedReserveCode :: BuiltinData -> BuiltinData -> BuiltinData -> BuiltinData -> BuiltinData -> ()
wrappedReserveCode oracle_val dev_PKH = wrapValidator $ mkReserveValidator params
    where
            params = ReserveParams {
                -- stablecoinMintingPolicy = unsafeFromBuiltinData tkn_mint_pol ,
                oracleValidator = unsafeFromBuiltinData oracle_val ,
                developerPKH = unsafeFromBuiltinData dev_PKH
            }

compiledReserveCode :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> BuiltinData -> BuiltinData -> ())
compiledReserveCode = $$( compile [|| wrappedReserveCode ||] )

saveReserveCode :: IO()
saveReserveCode = writeCodeToFile "./assets/reserve.plutus" compiledReserveCode