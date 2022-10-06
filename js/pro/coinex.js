'use strict';

//  ---------------------------------------------------------------------------

import Precise from '../base/Precise.js';
import coinexRest from '../coinex.js';
import {
    AuthenticationError,
    BadRequest,
    ExchangeNotAvailable,
    NotSupported,
    RequestTimeout,
    ExchangeError,
} from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from './base/Cache.js';

//  ---------------------------------------------------------------------------

export default class coinex extends coinexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false, // can query but can't subscribe
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false, // only for swap markets
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://socket.coinex.com/',
                        'swap': 'wss://perpetual.coinex.com/',
                    },
                },
            },
            'options': {
                'account': 'spot',
                'watchOrderBook': {
                    'limits': [ 5, 10, 20, 50 ],
                    'defaultLimit': 50,
                    'aggregations': [ '10', '1', '0', '0.1', '0.01' ],
                    'defaultAggregation': '0',
                },
            },
            'streaming': {
            },
            'exceptions': {
                'codes': {
                    '1': BadRequest, // Parameter error
                    '2': ExchangeError, // Internal error
                    '3': ExchangeNotAvailable, // Service unavailable
                    '4': NotSupported, // Method unavailable
                    '5': RequestTimeout, // Service timeout
                    '6': AuthenticationError, // Permission denied
                },
            },
            'timeframes': {
                '1m': 60,
                '3m': 180,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '6h': 21600,
                '12h': 43200,
                '1d': 86400,
                '3d': 259200,
                '1w': 604800,
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    handleTicker (client, message) {
        //
        //  spot
        //
        //     {
        //         method: 'state.update',
        //         params: [{
        //             BTCUSDT: {
        //                 last: '31577.89',
        //                 open: '29318.36',
        //                 close: '31577.89',
        //                 high: '32222.19',
        //                 low: '29317.21',
        //                 volume: '630.43024965',
        //                 sell_total: '13.66143951',
        //                 buy_total: '2.76410939',
        //                 period: 86400,
        //                 deal: '19457487.84611409070000000000'
        //             }
        //         }]
        //     }
        //
        //  swap
        //
        //     {
        //         method: 'state.update',
        //         params: [{
        //             BTCUSDT: {
        //                 period: 86400,
        //                 funding_time: 422,
        //                 position_amount: '285.6246',
        //                 funding_rate_last: '-0.00097933',
        //                 funding_rate_next: '0.00022519',
        //                 funding_rate_predict: '0.00075190',
        //                 insurance: '17474289.49925859030905338270',
        //                 last: '31570.08',
        //                 sign_price: '31568.09',
        //                 index_price: '31561.85000000',
        //                 open: '29296.11',
        //                 close: '31570.08',
        //                 high: '32463.40',
        //                 low: '29296.11',
        //                 volume: '8774.7318',
        //                 deal: '270675177.827928219109030017258398',
        //                 sell_total: '19.2230',
        //                 buy_total: '25.7814'
        //             }
        //         }]
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const first = this.safeValue (params, 0, {});
        const keys = Object.keys (first);
        const marketId = this.safeString (keys, 0);
        const symbol = this.safeSymbol (marketId);
        const ticker = this.safeValue (first, marketId, {});
        const market = this.safeMarket (marketId);
        const parsedTicker = this.parseWSTicker (ticker, market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    parseWSTicker (ticker, market = undefined) {
        //
        //  spot
        //
        //     {
        //         last: '31577.89',
        //         open: '29318.36',
        //         close: '31577.89',
        //         high: '32222.19',
        //         low: '29317.21',
        //         volume: '630.43024965',
        //         sell_total: '13.66143951',
        //         buy_total: '2.76410939',
        //         period: 86400,
        //         deal: '19457487.84611409070000000000'
        //     }
        //
        //  swap
        //
        //     {
        //         period: 86400,
        //         funding_time: 422,
        //         position_amount: '285.6246',
        //         funding_rate_last: '-0.00097933',
        //         funding_rate_next: '0.00022519',
        //         funding_rate_predict: '0.00075190',
        //         insurance: '17474289.49925859030905338270',
        //         last: '31570.08',
        //         sign_price: '31568.09',
        //         index_price: '31561.85000000',
        //         open: '29296.11',
        //         close: '31570.08',
        //         high: '32463.40',
        //         low: '29296.11',
        //         volume: '8774.7318',
        //         deal: '270675177.827928219109030017258398',
        //         sell_total: '19.2230',
        //         buy_total: '25.7814'
        //     }
        //
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': this.safeString (ticker, 'buy_total'),
            'ask': undefined,
            'askVolume': this.safeString (ticker, 'sell_total'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'deal'),
            'info': ticker,
        }, market);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name coinex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the coinex api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const messageHash = 'balance';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const url = this.urls['api']['ws'][type];
        const currencies = Object.keys (this.currencies_by_id);
        const subscribe = {
            'method': 'asset.subscribe',
            'params': currencies,
            'id': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleBalance (client, message) {
        //
        //     {
        //         "method": "asset.update",
        //         "params": [
        //             {
        //                 "BTC": {
        //                     "available": "250",
        //                     "frozen": "10",
        //                 }
        //             }
        //         ],
        //         "id": null
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const first = this.safeValue (params, 0, {});
        const currencies = Object.keys (first);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const code = this.safeCurrencyCode (currencyId);
            const available = this.safeString (first[currencyId], 'available');
            const frozen = this.safeString (first[currencyId], 'frozen');
            const total = Precise.stringAdd (available, frozen);
            const account = this.account ();
            account['free'] = this.parseNumber (available);
            account['used'] = this.parseNumber (frozen);
            account['total'] = this.parseNumber (total);
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    handleTrades (client, message) {
        //
        //     {
        //         "method": "deals.update",
        //         "params": [
        //             "BTCUSD",
        //             [{
        //                 "type": "sell",
        //                 "time": 1496458040.059284,
        //                 "price ": "46444.74",
        //                 "id": 29433,
        //                 "amount": "0.00120000"
        //             }]
        //         ],
        //         "id": null
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const marketId = this.safeString (params, 0);
        const trades = this.safeValue (params, 1, []);
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseWSTrade (trade, market);
            stored.append (parsed);
        }
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    parseWSTrade (trade, market = undefined) {
        //
        //     {
        //         "type": "sell",
        //         "time": 1496458040.059284,
        //         "price ": "46444.74",
        //         "id": 29433,
        //         "amount": "0.00120000"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'time');
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'type'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         method: 'kline.update',
        //         params: [
        //             [
        //                 1654019640,   // timestamp
        //                 '32061.99',   // open
        //                 '32061.28',   // close
        //                 '32061.99',   // high
        //                 '32061.28',   // low
        //                 '0.1285',     // amount base
        //                 '4119.943736' // amount quote
        //             ]
        //         ],
        //         id: null
        //     }
        //
        const candles = this.safeValue (message, 'params', []);
        const messageHash = 'ohlcv';
        const ohlcvs = this.parseOHLCVs (candles);
        if (Object.keys (this.ohlcvs).length === 0) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs = new ArrayCacheByTimestamp (limit);
        }
        for (let i = 0; i < ohlcvs.length; i++) {
            const candle = ohlcvs[i];
            this.ohlcvs.append (candle);
        }
        client.resolve (this.ohlcvs, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name coinex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the coinex api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchTicker', market, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'ticker:' + symbol;
        const subscribe = {
            'method': 'state.subscribe',
            'id': this.requestId (),
            'params': [
                market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the coinex api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchTrades', market, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'trades:' + symbol;
        const message = {
            'method': 'deals.subscribe',
            'params': [
                market['id'],
            ],
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the coinex api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrderBook', market, params);
        const url = this.urls['api']['ws'][type];
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const limits = this.safeValue (options, 'limits', []);
        if (limit === undefined) {
            limit = this.safeValue (options, 'defaultLimit', 50);
        }
        if (!this.inArray (limit, limits)) {
            throw new NotSupported (this.id + ' watchOrderBook() limit must be one of ' + limits.join (', '));
        }
        const defaultAggregation = this.safeString (options, 'defaultAggregation', '0');
        const aggregations = this.safeValue (options, 'aggregations', []);
        const aggregation = this.safeString (params, 'aggregation', defaultAggregation);
        if (!this.inArray (aggregation, aggregations)) {
            throw new NotSupported (this.id + ' watchOrderBook() aggregation must be one of ' + aggregations.join (', '));
        }
        params = this.omit (params, 'aggregation');
        const subscribe = {
            'method': 'depth.subscribe',
            'id': this.requestId (),
            'params': [
                market['id'],
                limit,
                aggregation,
                true,
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit (limit);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the coinex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ohlcv';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOHLCV', market, params);
        if (type !== 'swap') {
            throw new NotSupported (this.id + ' watchOHLCV() is only supported for swap markets');
        }
        const url = this.urls['api']['ws'][type];
        const subscribe = {
            'method': 'kline.subscribe',
            'id': this.requestId (),
            'params': [
                market['id'],
                this.safeInteger (this.timeframes, timeframe, timeframe),
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcvs = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcvs.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcvs, since, limit, 0, true);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "method": "depth.update",
        //         "params": [
        //             false,
        //             {
        //                 "asks": [
        //                     ["46350.52", "1.07871851"],
        //                     ...
        //                 ],
        //                 "bids": [
        //                     ["46349.61", "0.04000000"],
        //                     ...
        //                 ],
        //                 "last": "46349.93",
        //                 "time": 1639987469166,
        //                 "checksum": 1533284725
        //             },
        //             "BTCUSDT"
        //         ],
        //         "id": null
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const fullOrderBook = this.safeValue (params, 0);
        let orderBook = this.safeValue (params, 1);
        const marketId = this.safeString (params, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const timestamp = this.safeNumber (orderBook, 'time');
        const currentOrderBook = this.safeValue (this.orderbooks, symbol);
        if (fullOrderBook) {
            const snapshot = this.parseOrderBook (orderBook, symbol, timestamp);
            if (currentOrderBook === undefined) {
                orderBook = this.orderBook (snapshot);
                this.orderbooks[symbol] = orderBook;
            } else {
                orderBook = this.orderbooks[symbol];
                orderBook.reset (snapshot);
            }
        } else {
            const asks = this.safeValue (orderBook, 'asks', []);
            const bids = this.safeValue (orderBook, 'bids', []);
            this.handleDeltas (currentOrderBook['asks'], asks);
            this.handleDeltas (currentOrderBook['bids'], bids);
            currentOrderBook['nonce'] = timestamp;
            currentOrderBook['timestamp'] = timestamp;
            currentOrderBook['datetime'] = this.iso8601 (timestamp);
            this.orderbooks[symbol] = currentOrderBook;
        }
        // this.checkOrderBookChecksum (this.orderbooks[symbol]);
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    checkOrderBookChecksum (orderBook) {
        const asks = this.safeValue (orderBook, 'asks', []);
        const bids = this.safeValue (orderBook, 'bids', []);
        let string = '';
        const bidsLength = bids.length;
        for (let i = 0; i < bidsLength; i++) {
            const bid = bids[i];
            if (i !== 0) {
                string += ':';
            }
            string += bid[0] + ':' + bid[1];
        }
        const asksLength = asks.length;
        for (let i = 0; i < asksLength; i++) {
            const ask = asks[i];
            if (bidsLength !== 0) {
                string += ':';
            }
            string += ask[0] + ':' + ask[1];
        }
        const signedString = this.hash (string, 'cr32', 'hex');
        const checksum = this.safeString (orderBook, 'checksum');
        if (checksum !== signedString) {
            throw new ExchangeError (this.id + ' watchOrderBook () checksum failed');
        }
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate (params);
        let messageHash = 'orders';
        let market = undefined;
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const message = {
            'method': 'order.subscribe',
            'id': this.requestId (),
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            message['params'] = [ market['id'] ];
            messageHash += ':' + symbol;
        } else {
            // deprecated usage of markets_by_id...
            const markets = Object.keys (this.markets_by_id);
            message['params'] = markets;
        }
        const url = this.urls['api']['ws'][type];
        const request = this.deepExtend (message, query);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //  spot
        //
        //      {
        //          method: 'order.update',
        //          params: [
        //              1,
        //              {
        //                  id: 77782469357,
        //                  type: 1,
        //                  side: 2,
        //                  user: 1849116,
        //                  account: 0,
        //                  option: 2,
        //                  ctime: 1653961043.048967,
        //                  mtime: 1653961043.048967,
        //                  market: 'BTCUSDT',
        //                  source: 'web',
        //                  client_id: '',
        //                  price: '1.00',
        //                  amount: '1.00000000',
        //                  taker_fee: '0.0020',
        //                  maker_fee: '0.0020',
        //                  left: '1.00000000',
        //                  deal_stock: '0',
        //                  deal_money: '0',
        //                  money_fee: '0',
        //                  stock_fee: '0',
        //                  asset_fee: '0',
        //                  fee_discount: '1',
        //                  last_deal_amount: '0',
        //                  last_deal_price: '0',
        //                  last_deal_time: 0,
        //                  last_deal_id: 0,
        //                  last_role: 0,
        //                  fee_asset: null,
        //                  stop_id: 0
        //              }
        //          ],
        //          id: null
        //      }
        //
        //  swap
        //
        //      {
        //          method: 'order.update',
        //          params: [
        //              1,
        //              {
        //                  order_id: 23423462821,
        //                  position_id: 0,
        //                  stop_id: 0,
        //                  market: 'BTCUSDT',
        //                  type: 1,
        //                  side: 2,
        //                  target: 0,
        //                  effect_type: 1,
        //                  user_id: 1849116,
        //                  create_time: 1653961509.25049,
        //                  update_time: 1653961509.25049,
        //                  source: 'web',
        //                  price: '1.00',
        //                  amount: '1.0000',
        //                  taker_fee: '0.00050',
        //                  maker_fee: '0.00030',
        //                  left: '1.0000',
        //                  deal_stock: '0.00000000000000000000',
        //                  deal_fee: '0.00000000000000000000',
        //                  deal_profit: '0.00000000000000000000',
        //                  last_deal_amount: '0.00000000000000000000',
        //                  last_deal_price: '0.00000000000000000000',
        //                  last_deal_time: 0,
        //                  last_deal_id: 0,
        //                  last_deal_type: 0,
        //                  last_deal_role: 0,
        //                  client_id: '',
        //                  fee_asset: '',
        //                  fee_discount: '0.00000000000000000000',
        //                  deal_asset_fee: '0.00000000000000000000',
        //                  leverage: '3',
        //                  position_type: 2
        //              }
        //          ],
        //          id: null
        //      }
        //
        const params = this.safeValue (message, 'params', []);
        const order = this.safeValue (params, 1, {});
        const parsedOrder = this.parseWSOrder (order);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        this.orders.append (parsedOrder);
        let messageHash = 'orders';
        client.resolve (this.orders, messageHash);
        messageHash += ':' + parsedOrder['symbol'];
        client.resolve (this.orders, messageHash);
    }

    parseWSOrder (order) {
        //
        //  spot
        //
        //       {
        //           id: 77782469357,
        //           type: 1,
        //           side: 2,
        //           user: 1849116,
        //           account: 0,
        //           option: 2,
        //           ctime: 1653961043.048967,
        //           mtime: 1653961043.048967,
        //           market: 'BTCUSDT',
        //           source: 'web',
        //           client_id: '',
        //           price: '1.00',
        //           amount: '1.00000000',
        //           taker_fee: '0.0020',
        //           maker_fee: '0.0020',
        //           left: '1.00000000',
        //           deal_stock: '0',
        //           deal_money: '0',
        //           money_fee: '0',
        //           stock_fee: '0',
        //           asset_fee: '0',
        //           fee_discount: '1',
        //           last_deal_amount: '0',
        //           last_deal_price: '0',
        //           last_deal_time: 0,
        //           last_deal_id: 0,
        //           last_role: 0,
        //           fee_asset: null,
        //           stop_id: 0
        //       }
        //
        //  swap
        //
        //      {
        //          order_id: 23423462821,
        //          position_id: 0,
        //          stop_id: 0,
        //          market: 'BTCUSDT',
        //          type: 1,
        //          side: 2,
        //          target: 0,
        //          effect_type: 1,
        //          user_id: 1849116,
        //          create_time: 1653961509.25049,
        //          update_time: 1653961509.25049,
        //          source: 'web',
        //          price: '1.00',
        //          amount: '1.0000',
        //          taker_fee: '0.00050',
        //          maker_fee: '0.00030',
        //          left: '1.0000',
        //          deal_stock: '0.00000000000000000000',
        //          deal_fee: '0.00000000000000000000',
        //          deal_profit: '0.00000000000000000000',
        //          last_deal_amount: '0.00000000000000000000',
        //          last_deal_price: '0.00000000000000000000',
        //          last_deal_time: 0,
        //          last_deal_id: 0,
        //          last_deal_type: 0,
        //          last_deal_role: 0,
        //          client_id: '',
        //          fee_asset: '',
        //          fee_discount: '0.00000000000000000000',
        //          deal_asset_fee: '0.00000000000000000000',
        //          leverage: '3',
        //          position_type: 2
        //      }
        //
        //  order.update_stop
        //
        //       {
        //           id: 78006745870,
        //           type: 1,
        //           side: 2,
        //           user: 1849116,
        //           account: 1,
        //           option: 70,
        //           direction: 1,
        //           ctime: 1654171725.131976,
        //           mtime: 1654171725.131976,
        //           market: 'BTCUSDT',
        //           source: 'web',
        //           client_id: '',
        //           stop_price: '1.00',
        //           price: '1.00',
        //           amount: '1.00000000',
        //           taker_fee: '0.0020',
        //           maker_fee: '0.0020',
        //           fee_discount: '1',
        //           fee_asset: null,
        //           status: 0
        //       }
        //
        const timestamp = this.safeTimestamp2 (order, 'update_time', 'mtime');
        const marketId = this.safeString (order, 'market');
        const typeCode = this.safeString (order, 'type');
        const type = this.safeString ({
            '1': 'limit',
            '2': 'market',
        }, typeCode);
        const sideCode = this.safeString (order, 'side');
        const side = this.safeString ({
            '1': 'sell',
            '2': 'buy',
        }, sideCode);
        const remaining = this.safeString (order, 'left');
        const amount = this.safeString (order, 'amount');
        const status = this.safeString (order, 'status');
        const market = this.safeMarket (marketId);
        let cost = this.safeString (order, 'deal_money');
        let filled = this.safeString (order, 'deal_stock');
        let average = undefined;
        if (market['swap']) {
            const leverage = this.safeString (order, 'leverage');
            cost = Precise.stringDiv (filled, leverage);
            average = Precise.stringDiv (filled, amount);
            filled = undefined;
        }
        let fee = undefined;
        const feeCost = this.omitZero (this.safeString (order, 'money_fee'));
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'fee_asset', market['quote']);
            fee = {
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'cost': feeCost,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'order_id', 'id'),
            'clientOrderId': this.safeString (order, 'client_id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.safeTimestamp (order, 'last_deal_time'),
            'symbol': market['symbol'],
            'type': type === 1 ? 'limit' : 'market',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'stopPrice': this.safeString (order, 'stop_price'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': average,
            'status': this.parseWSOrderStatus (status),
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseWSOrderStatus (status) {
        const statuses = {
            '0': 'pending',
            '1': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    handleMessage (client, message) {
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (error));
        }
        const method = this.safeString (message, 'method');
        const handlers = {
            'state.update': this.handleTicker,
            'asset.update': this.handleBalance,
            'deals.update': this.handleTrades,
            'depth.update': this.handleOrderBook,
            'order.update': this.handleOrders,
            'kline.update': this.handleOHLCV,
            'order.update_stop': this.handleOrders,
        };
        const handler = this.safeValue (handlers, method);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        return this.handleSubscriptionStatus (client, message);
    }

    handleAuthenticationMessage (client, message) {
        //
        //     {
        //         error: null,
        //         result: {
        //             status: 'success'
        //         },
        //         id: 1
        //     }
        //
        const future = this.safeValue (client.futures, 'authenticated');
        if (future !== undefined) {
            future.resolve (true);
        }
        return message;
    }

    handleSubscriptionStatus (client, message) {
        const id = this.safeString (message, 'id');
        const subscription = this.safeValue (client.subscriptions, id);
        if (subscription !== undefined) {
            const futureIndex = this.safeString (subscription, 'future');
            const future = this.safeValue (client.futures, futureIndex);
            if (future !== undefined) {
                future.resolve (true);
            }
            delete client.subscriptions[id];
        }
    }

    authenticate (params = {}) {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('authenticate', undefined, params);
        const url = this.urls['api']['ws'][type];
        const client = this.client (url);
        const time = this.milliseconds ();
        if (type === 'spot') {
            const messageHash = 'authenticated:spot';
            const authenticated = this.safeValue (client.futures, messageHash);
            if (authenticated !== undefined) {
                return;
            }
            const future = client.future (messageHash);
            const requestId = this.requestId ();
            const subscribe = {
                'id': requestId,
                'future': 'authenticated:spot',
            };
            const signData = 'access_id=' + this.apiKey + '&tonce=' + this.numberToString (time) + '&secret_key=' + this.secret;
            const hash = this.hash (this.encode (signData), 'md5');
            const request = {
                'method': 'server.sign',
                'params': [
                    this.apiKey,
                    hash.toUpperCase (),
                    time,
                ],
                'id': requestId,
            };
            this.spawn (this.watch, url, messageHash, request, requestId, subscribe);
            return future;
        } else {
            const messageHash = 'authenticated:swap';
            const authenticated = this.safeValue (client.futures, messageHash);
            if (authenticated !== undefined) {
                return;
            }
            const future = client.future ('authenticated:swap');
            const requestId = this.requestId ();
            const subscribe = {
                'id': requestId,
                'future': 'authenticated:swap',
            };
            const signData = 'access_id=' + this.apiKey + '&timestamp=' + this.numberToString (time) + '&secret_key=' + this.secret;
            const hash = this.hash (this.encode (signData), 'sha256', 'hex');
            const request = {
                'method': 'server.sign',
                'params': [
                    this.apiKey,
                    hash.toLowerCase (),
                    time,
                ],
                'id': requestId,
            };
            this.spawn (this.watch, url, messageHash, request, requestId, subscribe);
            return future;
        }
    }
}
