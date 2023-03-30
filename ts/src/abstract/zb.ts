// -------------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -------------------------------------------------------------------------------

import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';

interface Exchange {
    spotV1PublicGetMarkets (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetTicker (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetAllTicker (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetDepth (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetTrades (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetKline (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetGetGroupMarkets (params?: {}): Promise<implicitReturnType>;
    spotV1PublicGetGetFeeInfo (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetOrder (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetOrderMoreV2 (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetCancelOrder (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetCancelAllOrdersAfter (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetOrder (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetOrders (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetOrdersNew (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetOrdersIgnoreTradeType (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetUnfinishedOrdersIgnoreTradeType (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetFinishedAndPartialOrders (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetAccountInfo (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetUserAddress (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetPayinAddress (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetWithdrawAddress (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetWithdrawRecord (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetChargeRecord (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetCnyWithdrawRecord (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetCnyChargeRecord (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetWithdraw (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetAddSubUser (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetSubUserList (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetDoTransferFunds (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetCreateSubUserKey (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetLeverAssetsInfo (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetLeverBills (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetTransferInLever (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetTransferOutLever (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetLoan (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetCancelLoan (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetLoans (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetLoanRecords (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetBorrow (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetAutoBorrow (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetRepay (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetDoAllRepay (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetRepayments (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetFinanceRecords (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetChangeInvestMark (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetChangeLoop (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetCrossAssets (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetCrossBills (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetTransferInCross (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetTransferOutCross (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetDoCrossLoan (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetDoCrossRepay (params?: {}): Promise<implicitReturnType>;
    spotV1PrivateGetGetCrossRepayRecords (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetDepth (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetFundingRate (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetIndexKline (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetIndexPrice (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetKline (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetMarkKline (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetMarkPrice (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetTicker (params?: {}): Promise<implicitReturnType>;
    contractV1PublicGetTrade (params?: {}): Promise<implicitReturnType>;
    contractV2PublicGetAllForceOrders (params?: {}): Promise<implicitReturnType>;
    contractV2PublicGetConfigMarketList (params?: {}): Promise<implicitReturnType>;
    contractV2PublicGetTopLongShortAccountRatio (params?: {}): Promise<implicitReturnType>;
    contractV2PublicGetTopLongShortPositionRatio (params?: {}): Promise<implicitReturnType>;
    contractV2PublicGetFundingRate (params?: {}): Promise<implicitReturnType>;
    contractV2PublicGetPremiumIndex (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetFundBalance (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetFundGetAccount (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetFundGetBill (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetFundGetBillTypeList (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetFundMarginHistory (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetPositionsGetPositions (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetPositionsGetNominalValue (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetPositionsMarginInfo (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetSettingGet (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetTradeGetAllOrders (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetTradeGetOrder (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetTradeGetOrderAlgos (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetTradeGetTradeList (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetTradeGetUndoneOrders (params?: {}): Promise<implicitReturnType>;
    contractV2PrivateGetTradeTradeHistory (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostActivityBuyTicket (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostFundTransferFund (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostPositionsSetMarginCoins (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostPositionsUpdateAppendUSDValue (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostPositionsUpdateMargin (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostSettingSetLeverage (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostSettingSetPositionsMode (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeBatchOrder (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeBatchCancelOrder (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeCancelAlgos (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeCancelAllOrders (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeCancelOrder (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeOrder (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeOrderAlgo (params?: {}): Promise<implicitReturnType>;
    contractV2PrivatePostTradeUpdateOrderAlgo (params?: {}): Promise<implicitReturnType>;
}
abstract class Exchange extends _Exchange {}

export default Exchange