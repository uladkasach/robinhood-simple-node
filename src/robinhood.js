/**
 * @author UladKasach
 */

'use strict';
const AUTH_ERROR = {type : "auth", details : "robinhood api must be authenticated before this request can be made"}; // error message for authorization not avail


// Dependencies
var promise_request = require('request-promise');

function RobinhoodApi(options){ // instance based object properties and methods
    this.promise_authorized = null; // defined by this.promise_to_auth();
    this.account = null;
    this.headers = { // default headers
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en;q=1, fr;q=0.9, de;q=0.8, ja;q=0.7, nl;q=0.6, it;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Connection': 'keep-alive',
        'X-Robinhood-API-Version': '1.152.0',                                                       // define a robinhood api version
        'User-Agent': 'Robinhood/5.32.0 (com.robinhood.release.Robinhood; build:3814; iOS 10.3.3)', // define a random user agent
    };
    if(typeof options !== "undefined") this.promise_to_auth(options); // authorizes robinhood account if credentials are defined. defines this.promise_authorized
}

RobinhoodApi.prototype = { // static object properties and methods

    ////////////////////////////////////////////////////////////
    // Initialization
    ////////////////////////////////////////////////////////////
    /*
        begin authorization of this instance
            - only requests authorization once and caches the promise
    */
    promise_to_auth : function(options){ // this ensures that regardless of how many calls to promise_to_auth() are made, we only queue one authorization.
        if(this.promise_authorized == null || typeof this.promise_authorized == "undefined"){ // if not promise_authorized is not defined, define it
            this.promise_authorized = this._promise_to_conduct_authentication(options)
        }
        return this.promise_authorized;
    },
    /*
        "private" method - should not be used directly.
        functionality required to authorize this instance
        returns token
    */
    _promise_to_conduct_authentication : function(options){
        // promise to retreive the token for this account - supports both initialization with a token and initialization with username+pass
        if(typeof options.token == "undefined"){
            if(typeof options.username == "undefined" || typeof options.password == "undefined") throw "either options.username and options.password or options.token must be defined"
            var promise_token = this.login(options.username, options.password)
                .then((response)=>{
                    return response.token;
                })
        } else {
            if(typeof options.token == "undefined") throw "either options.username and options.password or options.token must be defined"
            var promise_token = Promise.resolve(options.token);
        }

        // promise to define the header with this token
        var promise_header = promise_token
            .then((token)=>{
                this.headers['Authorization'] = 'Token ' + token;
            })
        this.promise_header_is_authorized = promise_header; // used to wait untill a request is authorized

        // promise to set the `account` object for this account
        var promise_to_set_account = promise_header
            .then(()=>{
                return this.accounts()
                    .then((body)=>{
                        if (body.results && body.results instanceof Array && body.results.length > 0) { // Being defensive when user credentials are valid but RH has not approved an account yet
                            var account_url = body.results[0].url;
                            return (account_url);
                        } else {
                            throw ("account_pending");
                        }
                    })
                    .then((account_url)=>{
                        this.account = account_url;
                    })
            })

        // return a promise
        return promise_to_set_account
            .then(()=>{
                return promise_token; // successfuly authorized. return token.
            });
    },

    ////////////////////////////////////////////////////////////
    // helper functions
    ////////////////////////////////////////////////////////////
    /*
        ensures that authorization has completed before making requests
    */
    promise_to_request : function(options, bool_skip_waiting_for_auth){ // appends header and requires json and gzip
        if(bool_skip_waiting_for_auth === true){
            var promise_can_run = Promise.resolve();
        } else {
            if(typeof this.promise_header_is_authorized == "undefined") return Promise.reject(AUTH_ERROR);
            var promise_can_run = this.promise_header_is_authorized;
        }
        return promise_can_run  // ensure that calls that need to be authorized before firing are authorized first.
            .then(()=>{
                options.json = true;
                options.gzip = true;
                options.headers = this.headers;
                return promise_request(options);
            })
    },


    ////////////////////////////////////////////////////////////
    // api
    ////////////////////////////////////////////////////////////
    api_paths : {
        host : 'https://api.robinhood.com/',
        endpoints : {
            login:  'api-token-auth/',
            logout: 'api-token-logout/',
            investment_profile: 'user/investment_profile/',
            accounts: 'accounts/',
            ach_iav_auth: 'ach/iav/auth/',
            ach_relationships:  'ach/relationships/',
            ach_transfers:'ach/transfers/',
            ach_deposit_schedules: "ach/deposit_schedules/",
            applications: 'applications/',
            dividends:  'dividends/',
            edocuments: 'documents/',
            instruments:  'instruments/',
            splits:  'instruments/{{instrument}}/splits/',
            margin_upgrade:  'margin/upgrades/',
            markets:  'markets/',
            notifications:  'notifications/',
            notifications_devices: "notifications/devices/",
            orders: 'orders/',
            cancel_order: 'orders/{{order_id}}/cancel/',
            password_reset: 'password_reset/request/',
            quotes: 'quotes/',
            historicals : 'quotes/historicals/{{symbol}}/?interval={{interval}}&span={{span}}',
            document_requests:  'upload/document_requests/',
            user: 'user/',

            user_additional_info: "user/additional_info/",
            user_basic_info: "user/basic_info/",
            user_employment: "user/employment/",
            user_investment_profile: "user/investment_profile/",

            watchlists: 'watchlists/',
            positions: 'positions/',
            fundamentals: 'fundamentals/',
            sp500_up: 'midlands/movers/sp500/?direction=up',
            sp500_down: 'midlands/movers/sp500/?direction=down',
            news: 'midlands/news/{{symbol}}/'
        },
    },


    /* authentication and account related */
    login : function(username, password){
        return this.promise_to_request({
                method : "POST",
                uri : this.api_paths.host + this.api_paths.endpoints.login,
                form : { password: password, username: username },
            }, true)
            .then((body)=>{
                return {token: body.token};
            })
    },
    expire_token : function(){
        return this.promise_to_request({
                method : "POST",
                uri: this.api_paths.host + this.api_paths.endpoints.logout,
            })
    },
    accounts : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.accounts,
            })
    },
    token : function(){
        if(typeof this.promise_authorized == "undefined" || this.promise_authorized == null) return Promise.reject(AUTH_ERROR);
        return this.promise_authorized;
    },

    /* orders managment */
    order : function(order_id){ // retreive one order by id
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.orders,
                qs : {id : order_id},
            })
    },
    orders : function(options){ // retreive more than one order
        if(typeof options["updated_at"] !== "undefined"){ // convinience transformation
            options['updated_at[gte]'] = options.updated_at;
            delete options["updated_at"];
        }
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.orders,
                qs : options,
            })
    },
    cancel_order : function(order_id){ // cancel one order by id
        return this.promise_to_request({
                method : "POST",
                uri : this.api_paths.host + this.api_paths.endpoints.cancel_order.replace("{{order_id}}", order_id),
            })
    },
    place_order : function(options){
        return this.promise_to_request({
                method : "POST",
                uri : this.api_paths.host + this.api_paths.endpoints.orders,
                form : {
                      account: this.account,
                      instrument: options.instrument.url,
                      price: options.bid_price,
                      stop_price: options.stop_price,
                      quantity: options.quantity,
                      side: options.transaction, // "buy" or "sell"
                      symbol: options.instrument.symbol,
                      time_in_force: options.time || 'gfd',
                      trigger: options.trigger || 'immediate',
                      type: options.type || 'market'
                }
            })
    },

    /* important data retreival */
    historicals : function(symbol, intv, span){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.historicals
                    .replace("{{symbol}}", symbol)
                    .replace("{{interval}}", intv)
                    .replace("{{span}}", span) ,
            })
    },

    /* misc data retreival */
    investment_profile : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.investment_profile,
            })
    },
    investment_profile : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.investment_profile,
            })
    },
    fundamentals : function(symbol){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.fundamentals,
                qs: { 'symbols': symbol },
            })
    },
    instruments : function(symbol){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.instruments,
                qs: { 'symbol': symbol },
            })
    },
    quote_data : function(symbol){
        if(Array.isArray(symbol)) symbol = symbol.join(','); // if symbol is an array, convert it to comma delimited string
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.quotes,
                qs: { 'symbols': symbol },
            })
    },
    user : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.user,
            })
    },
    dividends : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.dividends,
            })
    },
    positions : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.positions,
            })
    },
    nonzero_positions : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.positions,
                qs: {nonzero: true}
            })
    },
    news : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.news.replace("{{symbol}}", symbol),
            })
    },
    markets : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.markets,
            })
    },
    sp500_up : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.sp500_up,
            })
    },
    sp500_down : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.sp500_down,
            })
    },
    create_watch_list : function(name){
        return this.promise_to_request({
                method : "POST",
                uri : this.api_paths.host + this.api_paths.endpoints.watchlists,
                form: {
                  name: name
                }
            })
    },
    watchlists : function(){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.watchlists,
            })
    },
    splits : function(instrument){
        return this.promise_to_request({
                method : "GET",
                uri : this.api_paths.host + this.api_paths.endpoints.splits.replce("{{instrument}}", instrument),
            })
    },
    url : function(url){
        return this.promise_to_request({
                method : "GET",
                uri : url,
            })
    }

}

module.exports = RobinhoodApi;
