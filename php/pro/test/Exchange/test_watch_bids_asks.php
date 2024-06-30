<?php
namespace ccxt;

// ----------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -----------------------------------------------------------------------------
use React\Async;
use React\Promise;
include_once PATH_TO_CCXT . '/test/exchange/base/test_ticker.php';
include_once PATH_TO_CCXT . '/test/exchange/base/test_shared_methods.php';

function test_watch_bids_asks($exchange, $skipped_properties, $symbol) {
    return Async\async(function () use ($exchange, $skipped_properties, $symbol) {
        $without_symbol = test_watch_bids_asks_helper($exchange, $skipped_properties, null);
        $with_symbol = test_watch_bids_asks_helper($exchange, $skipped_properties, [$symbol]);
        Async\await(Promise\all([$with_symbol, $without_symbol]));
    }) ();
}


function test_watch_bids_asks_helper($exchange, $skipped_properties, $arg_symbols, $arg_params = array()) {
    return Async\async(function () use ($exchange, $skipped_properties, $arg_symbols, $arg_params) {
        $method = 'watchBidsAsks';
        $now = $exchange->milliseconds();
        $ends = $now + 15000;
        while ($now < $ends) {
            $response = null;
            try {
                $response = Async\await($exchange->watch_bids_asks($arg_symbols, $arg_params));
            } catch(\Throwable $e) {
                // for some exchanges, multi symbol methods might require symbols array to be present, so
                // so, if method throws "arguments-required" exception, we don't fail test, but just skip silently,
                // because tests will make a second call of this method with symbols array
                if (($e instanceof ArgumentsRequired) && ($arg_symbols === null || count($arg_symbols) === 0)) {
                    // todo: provide random symbols to try
                    return;
                } elseif (!is_temporary_failure($e)) {
                    throw $e;
                }
                $now = $exchange->milliseconds();
                continue;
            }
            assert(is_array($response), $exchange->id . ' ' . $method . ' ' . $exchange->json($arg_symbols) . ' must return an object. ' . $exchange->json($response));
            $values = is_array($response) ? array_values($response) : array();
            $checked_symbol = null;
            if ($arg_symbols !== null && count($arg_symbols) === 1) {
                $checked_symbol = $arg_symbols[0];
            }
            assert_non_emtpy_array($exchange, $skipped_properties, $method, $values, $checked_symbol);
            for ($i = 0; $i < count($values); $i++) {
                $ticker = $values[$i];
                test_ticker($exchange, $skipped_properties, $method, $ticker, $checked_symbol);
            }
            $now = $exchange->milliseconds();
        }
    }) ();
}
