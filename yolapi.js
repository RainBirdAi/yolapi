var request = require('superagent');

function isUrl (item) {
    return item && item.indexOf('://') != -1;
}

function buildParams(urlString, b, c) {
    if (b && b.start_proxy) {
        return {url: urlString, start_proxy: b.start_proxy, kmId: 'supplied-by-proxy'};
    } else {
        return {url: urlString, apiKey:b, kmId:c};
    }
}

function processParameters (a,b,c) {
    if (isUrl(a)) {
        return buildParams(a,b,c);
    } else if (isUrl(b)) {
        return buildParams(b,a,c);
    } else if (isUrl(c)) {
        return buildParams(c,a,b);
    } else {
        return null;
    }
}

function attemptProxyStart(session, callback) {
    request
        .get(session.parameters.start_proxy)
        .end(function(err, response) {
            if (!err && response && response.body) {
                session.id = response.body.id || response.body.sessionId;
            }
            callback(err);
        });
}

function attemptStart(session, allowSwap, callback) {
    request
        .get(session.parameters.url + '/start/' + session.parameters.kmId + '')
        .set('Authorization', 'Basic ' + new Buffer(session.parameters.apiKey + ':').toString('base64'))
        .end(function (err, response) {
            if (err && err.message === 'Unauthorized') {
                if (allowSwap) {
                    var temp = session.parameters.kmId;
                    session.parameters.kmId = session.parameters.apiKey;
                    session.parameters.apiKey = temp;
                    attemptStart(session, false, callback);
                } else {
                    callback(new Error('Failed to start a session'));
                }
            } else if (response && response.body && response.body.id) {
                session.id = response.body.id;
                callback();
            } else {
                callback(err);
            }
        });
}

function doQuery(session, data, callback) {
    request
        .post(session.parameters.url + '/' + session.id +  '/query')
        .send(data)
        .end(function (error,response){
            callback(error, error ? null : response.body);
        });
}

function doMetadata(session, data, callback) {
    request
        .post(session.parameters.url + '/' + session.id +  '/metadata')
        .send(data)
        .end(function (error,response){
            callback(error, error ? null : response.body);
        });
}

function doRespond(session, data, callback) {
    request
        .post(session.parameters.url + '/' + session.id +  '/response')
        .send(data)
        .end(function (error,response){
            callback(error, error ? null : response.body);
        });
}


function prepareError (error, response) {
    var result = null;
    if (error) {
        var message = error.message;
        if (response.error) {
            error = response.error;
            message += '\n' + error.message;
            if (error.text) {
                message += '\n' + error.text;
            }
        }
        result = new Error(message);
    }

    return result;
}

function doInject(session, arrayOfFacts, callback) {
    request
        .post(session.parameters.url + '/' + session.id +  '/inject')
        .send(arrayOfFacts)
        .end(function (error,response) {
            var cleanError = prepareError(error, response);
            callback(cleanError, cleanError ? null : response.body);
        });
}


function session(a, b, c) {
    this.parameters = processParameters(a, b, c);
    var p = this.parameters;

    if (!p || (!p.url || (!p.apiKey && !p.start_proxy) || !p.kmId)) {
        throw new Error('The Url, apiKey and kmId are all required.');
    }

    this.start = function (callback) {
        if (this.parameters.start_proxy) {
            attemptProxyStart(this, callback);
        } else {
            attemptStart(this, true, callback);
        }
    };

    this.inject = function(arrayOfFacts, callback) {
        doInject(this, arrayOfFacts, callback);
    }
    this.metadata = function(data, callback) {
        doMetadata(this, data, callback);
    }

    this.query = function(data, callback) {
        doQuery(this, data, callback);
    }

    this.respond = function(data, callback) {
        doRespond(this, data, callback);
    }
}

module.exports.session = session;
