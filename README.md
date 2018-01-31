<h1><img src="https://raw.githubusercontent.com/uladkasach/robinhood-node/master/.github/robinhood-node.png"/></h1>


[![npm](https://img.shields.io/npm/v/robinhood-api-node.svg?style=flat-square)](https://www.npmjs.com/package/robinhood-api-node)
[![npm](https://img.shields.io/npm/dm/robinhood-api-node.svg)](https://www.npmjs.com/package/robinhood-api-node)

## Overview
NodeJS Framework to make trades with the private [Robinhood](https://www.robinhood.com/) API. Using this API is not encouraged, since it's not officially available and it has been [reverse engineered](https://github.com/sanko/Robinhood). FYI [Robinhood's Terms and Conditions](https://brokerage-static.s3.amazonaws.com/assets/robinhood/legal/Robinhood%20Terms%20and%20Conditions.pdf)

## Origin
This repository is based off of [robinhood-rode by aurbano](https://github.com/aurbano/robinhood-node). It was generated as a new repository rather than a fork because of the massive changes that were created in order to:
- "promisify" the api
- support natural object instantiation
- make errors more understandable
- make error handling easier
- make code more readable




## Table of Contents

<!-- toc -->
  * [Installation](#installation)
  * [Authentication](#authentication)
  * [API](#api)
    * [`accounts()`](#accounts)
    * [`expire_token()`](#expire_token)
    * [`investment_profile(callback)`](#investment_profilecallback)
    * [`instruments(symbol, callback)`](#instrumentssymbol-callback)
    * [`quote_data(stock, callback) // Not authenticated`](#quote-datastock-callback-not-authenticated)
    * [`user(callback)`](#usercallback)
    * [`dividends(callback)`](#dividendscallback)
    * [`orders(options, callback)`](#ordersoptions-callback)
    * [`positions(callback)`](#positionscallback)
    * [`nonzero_positions(callback)`](#nonzero_positionscallback)
    * [`place_buy_order(options, callback)`](#place-buy-orderoptions-callback)
      * [`trigger`](#trigger)
      * [`time`](#time)
    * [`place_sell_order(options, callback)`](#place-sell-orderoptions-callback)
      * [`trigger`](#trigger)
      * [`time`](#time)
    * [`fundamentals(symbol, callback)`](#fundamentalssymbol-callback)
      * [Response](#response)
    * [`cancel_order(order, callback)`](#cancel-orderorder-callback)
    * [`watchlists(name, callback)`](#watchlistsname-callback)
    * [`create_watch_list(name, callback)`](#create-watch-listname-callback)
    * [`sp500_up(callback)`](#sp500-upcallback)
    * [`sp500_down(callback)`](#sp500-downcallback)
    * [`splits(instrument, callback)`](#splitsinstrument-callback)
    * [`historicals(symbol, intv, span, callback)`](#historicalssymbol-intv-span-callback)
    * [`url(url, callback)`](#urlurl-callback)
* [Contributors](#contributors)

<!-- toc stop -->

## Installation
```bash
$ npm install robinhood-api-node --save
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

var logger = require('winston')
var Robinhood = require('robinhood-api-node');
var robinhood = new Robinhood(credentials);
robinhood.promise_authenticated
    .then((token)=>{
        console.log("authenticated into Robinhood successfully!");
        console.log("token : " + token);
        console.log("account : " + robinhood.account);
    })
    .catch((err)=>{
        console.log("could not authenticate into Robinhood:");
        console.log(err.message);
    })

```

After authenticating, you may now interact with the Robinhood API.


## API

Note, these examples assume that the `robinhood` object has already been authenticated as demonstrated above.

### `accounts()`

```js
    robinhood.accounts()
        .then((body)=>{
            console.log(body)
        })
```

### `expire_token()`

```js
    robinhood.expire_token()
        .then(()=>{
            console.log("logged out of robinhood and expired the token")
        })
```

# Contributors

Uladzimir Kasacheuski ([@uladkasach](https://github.com/uladkasach))
------------------
From [https://github.com/aurbano/robinhood-node](github.com/aurbano/robinhood-node):
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
