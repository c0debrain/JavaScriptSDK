import CB from './CB'
/*
 CloudApp
 */
class CloudApp {
    constructor() {
        this._isConnected = false;

    }
    init(serverUrl, applicationId, applicationKey, opts) { //static function for initialisation of the app
        if (!applicationKey) {
            applicationKey = applicationId;
            applicationId = serverUrl;
        } else {
            CB.apiUrl = stripTrailingSlash(serverUrl);
        }

        if (typeof applicationKey === "object") {
            opts = applicationKey;
            applicationKey = applicationId;
            applicationId = serverUrl;
        }

        CB.appId = applicationId;
        CB.appKey = applicationKey;

        if (opts && opts.disableRealtime === true) {
            CB._isRealtimeDisabled = true;
        } else {
            var socketRelativeUrl = getUrlFromUri(CB.apiUrl)
            if (CB._isNode) {
                CB.io = require('IO')
                CB.Socket = CB.io(CB.apiUrl,{
                    jsonp: false,
                    transports: ['websocket'],
                    path: socketRelativeUrl
                })
            } else {
                CB.io = require('./CloudSocketClientLib.js')
                CB.Socket = CB.io(CB.apiUrl,{
                    path: socketRelativeUrl
                });
            }
        }
        CB.CloudApp._isConnected = true;
        _confirmConnection();
        this.onConnect(function() {
            CB.CloudApp._isConnected = true;
            CB.CloudObject.sync();
        });
        this.onDisconnect(function() {
            CB.CloudApp._isConnected = false;
        });
    }

    onConnect(functionToFire) { //static function for initialisation of the app
        CB._validate();
        if (!CB.Socket) {
            throw "Socket couldn't be found. Init app first.";
        }
        CB.Socket.on('connect', functionToFire);
    }

    onDisconnect(functionToFire) { //static function for initialisation of the app
        CB._validate();

        if (!CB.Socket) {
            throw "Socket couldn't be found. Init app first.";
        }
        CB.Socket.on('disconnect', functionToFire);

    }

    connect() { //static function for initialisation of the app
        CB._validate();

        if (!CB.Socket) {
            throw "Socket couldn't be found. Init app first.";
        }

        CB.Socket.connect();
        this._isConnected = true;
    }

    disconnect() { //static function for initialisation of the app
        CB._validate();

        if (!CB.Socket) {
            throw "Socket couldn't be found. Init app first.";
        }

        CB.Socket.emit('socket-disconnect', CB.appId);
        this._isConnected = false;
    }
}

function _confirmConnection(callback) {
    var URL = CB.apiUrl + '/status';
    CB._request('GET', URL).then(function(res) {
        CB.CloudApp._isConnected = true;
    }, function(err) {
        CB.CloudApp._isConnected = false;
    });
}

function stripTrailingSlash(url){
    if(url[url.length-1] == '/'){
        url = url.split('');
        url.splice(-1,1);
        url = url.join('');
    }
    return url;
}

function getUrlFromUri(url){
    var socketRelativeUrl = url;
    socketRelativeUrl = socketRelativeUrl.replace('://','');
    socketRelativeUrl = socketRelativeUrl.split('/');
    // remove null value
    socketRelativeUrl = socketRelativeUrl.filter(function(x){ return x });
    if(socketRelativeUrl.length > 1){
        socketRelativeUrl.splice(0,1,'');
        socketRelativeUrl.push('socket.io');
        url = socketRelativeUrl.join('/');
    } else{
        url = "/socket.io";
    } 
    return url;
}

CB.CloudApp = new CloudApp()

export default CloudApp
