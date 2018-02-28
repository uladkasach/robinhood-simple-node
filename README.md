<h1><img src="https://raw.githubusercontent.com/uladkasach/robinhood-simple-node/master/.github/robinhood-node.png"/></h1>


# A Simple NodeJS Robinhood Api


[![npm](https://img.shields.io/npm/v/robinhood-simple.svg?style=flat-square)](https://www.npmjs.com/package/robinhood-simple)
[![npm](https://img.shields.io/npm/dm/robinhood-simple.svg)](https://www.npmjs.com/package/robinhood-simple)

## Overview
A simple nodejs module to interact with the private [Robinhood](https://www.robinhood.com/) API. The API has been [reverse engineered](https://github.com/sanko/Robinhood); **no official nodejs api for robinhood exists**. FYI: [Robinhood's Terms and Conditions](https://brokerage-static.s3.amazonaws.com/assets/robinhood/legal/Robinhood%20Terms%20and%20Conditions.pdf).

## Origin
This repository is based off of [robinhood-node by aurbano](https://github.com/aurbano/robinhood-node). It was generated as a new repository rather than a fork because of the massive, backwards-incompatible, changes that were created in order to:
- "promisify" the api
- support natural object instantiation
- make errors more understandable
- make error handling easier
- make code more readable

and most importantly
- keep it simple



## Installation
```bash
$ npm install robinhood-simple --save
```

## Authentication

To access most functionality one must use either the `username` and `password` of an active Robinhood account or a `token` from a previously authenticated Robinhood session. For example:


```js

var credentials = {
    username: STRING,
    password: STRING
}
// -- or --
var credentials = {
    token: STRING
}

var Robinhood = require('robinhood-simple');
var robinhood = new Robinhood(credentials);
// robinhood is now ready to use!

```

After authenticating, you may now interact with the Robinhood API.




## Table of Contents

<!-- toc -->
  * [Installation](#installation)
  * [Authentication](#authentication)
  * [API](#api)
    * [`accounts()`](#accounts)
    * [`expire_token()`](#expire_token)
    * [`investment_profile()`](#investment_profile)
    * [`instruments(symbol)`](#instrumentssymbol)
    * [`user()`](#user)
    * [`dividends()`](#dividends)
    * [`orders(options)`](#ordersoptions)
    * [`positions()`](#positions)
    * [`nonzero_positions()`](#nonzero_positions)
    * [`place_buy_order(options)`](#place-buy-orderoptions)
      * [`trigger`](#trigger)
      * [`time`](#time)
    * [`place_sell_order(options)`](#place-sell-orderoptions)
      * [`trigger`](#trigger)
      * [`time`](#time)
    * [`fundamentals(symbol)`](#fundamentalssymbol)
      * [Response](#response)
    * [`cancel_order(order)`](#cancel-orderorder)
    * [`watchlists(name)`](#watchlistsname)
    * [`create_watch_list(name)`](#create-watch-listname)
    * [`sp500_up()`](#sp500-up)
    * [`sp500_down()`](#sp500-down)
    * [`splits(instrument)`](#splitsinstrument)
    * [`historicals(symbol, intv, span)`](#historicalssymbol-intv-span)
    * [`url(url)`](#urlurl)
* [Contributors](#contributors)

<!-- toc stop -->


## API

These examples assume that the `robinhood` object has already been initialized as demonstrated above. Note, the robinhood module will automatically wait until authorization has completed before running any subsequent requests are made. In other words the following usage is supported:

```
var robinhood = new Robinhood(credentials);
robinhood.instruments("AAPL")
    .then((body)=>{/* magic */})
```


### `token()`

This resolves with the token after the `robinhood` instance is authenticated.

```js
    robinhood.token()
        .then((token)=>{
            console.log(token) // don't share this! whoever has this can access your account.
        })
```

### `accounts()`

```js
    robinhood.accounts()
        .then((body)=>{
            console.log(body)
        })
```

### `expire_token()`
`expire_token()` enables a user to log out and terminate the robinhood session, de-authorizing a specific token.

```js
    robinhood.expire_token()
        .then(()=>{
            console.log("logged out of robinhood and expired the token")
        })
```

### `historicals()`

```js
    var ticker = "AAPL";
    var interval = "10minute"; // either `10minute` or `5minute`
    var period = "day"; // either "day" or "week"
    robinhood.historicals(ticker, interval, period)
        .then((body)=>{
            var historicals = body.historicals;
            console.log(historicals);
            /*
            [
              { begins_at: '2018-01-16T14:30:00Z',
                open_price: '245.3500',
                close_price: '245.5400',
                high_price: '246.0800',
                low_price: '245.2100',
                volume: 12701,
                session: 'reg',
                interpolated: false },
              { begins_at: '2018-01-16T14:40:00Z',
                open_price: '245.6096',
                close_price: '245.8100',
                high_price: '245.8400',
                low_price: '245.2400',
                volume: 8133,
                session: 'reg',
                interpolated: false },
              { begins_at: '2018-01-16T14:50:00Z',
                open_price: '245.7502',
                close_price: '245.9100',
                high_price: '246.0548',
                low_price: '245.5861',
                volume: 4569,
                session: 'reg',
                interpolated: false },
                ...
            ]
            */
        })
```

### `instruments(symbol)`

`instruments(...)` is used to retreive detailed information about specific instruments (e.g., companies).

```js
    var ticker_symbol = "AAPL"; // use apple symbol for demo
    robinhood.instruments(ticker_symbol)
        .then((body)=>{
            console.log(body);
            //    { previous: null,
            //      results:
            //       [ { min_tick_size: null,
            //           splits: 'https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/splits/',
            //           margin_initial_ratio: '0.5000',
            //           url: 'https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/',
            //           quote: 'https://api.robinhood.com/quotes/AAPL/',
            //           symbol: 'AAPL',
            //           bloomberg_unique: 'EQ0010169500001000',
            //           list_date: '1990-01-02',
            //           fundamentals: 'https://api.robinhood.com/fundamentals/AAPL/',
            //           state: 'active',
            //           day_trade_ratio: '0.2500',
            //           tradeable: true,
            //           maintenance_ratio: '0.2500',
            //           id: '450dfc6d-5510-4d40-abfb-f633b7d9be3e',
            //           market: 'https://api.robinhood.com/markets/XNAS/',
            //           name: 'Apple Inc. - Common Stock' } ],
            //      next: null }
        })
```

# Contributors


* Uladzimir Kasacheuski ([@uladkasach](https://github.com/uladkasach))

From [github.com/aurbano/robinhood-node](https://github.com/aurbano/robinhood-node):
* Alejandro U. Alvarez ([@aurbano](https://github.com/aurbano))
* Jesse Spencer ([@Jspenc72](https://github.com/jspenc72))
* Justin Keller ([@nodesocket](https://github.com/nodesocket))
* Wei-Sheng Su ([@ted7726](https://github.com/ted7726))
* Dustin Moore ([@dustinmoorenet](https://github.com/dustinmoorenet))
* Alex Ryan ([@ialexryan](https://github.com/ialexryan))
* Ben Van Treese ([@vantreeseba](https://github.com/vantreeseba))
* Zaheen ([@z123](https://github.com/z123))
* Chris Busse ([@busse](https://github.com/busse))
* Jason Truluck ([@jasontruluck](https://github.com/jasontruluck))
* Matthew Herron ([@swimclan](https://github.com/swimclan))

------------------

>Even though this should be obvious: I am not affiliated in any way with Robinhood Financial LLC. I don't mean any harm or disruption in their service by providing this. Furthermore, I believe they are working on an amazing product, and hope that by publishing this NodeJS framework their users can benefit in even more ways from working with them.
