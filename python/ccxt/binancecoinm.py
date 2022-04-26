# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.binance import binance


class binancecoinm(binance):

    def describe(self):
        return self.deep_extend(super(binancecoinm, self).describe(), {
            'id': 'binancecoinm',
            'name': 'Binance COIN-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
                'doc': [
                    'https://binance-docs.github.io/apidocs/delivery/en/',
                    'https://binance-docs.github.io/apidocs/spot/en',
                ],
            },
            'has': {
                'CORS': None,
                'spot': True,
                'margin': None,
                'swap': None,
                'future': None,
                'option': None,
                'createStopMarketOrder': True,
            },
            'options': {
                'defaultType': 'delivery',
                'leverageBrackets': None,
            },
        })

    def transfer_in(self, code, amount, params={}):
        # transfer from spot wallet to coinm futures wallet
        return self.futuresTransfer(code, amount, 3, params)

    def transfer_out(self, code, amount, params={}):
        # transfer from coinm futures wallet to spot wallet
        return self.futuresTransfer(code, amount, 4, params)
