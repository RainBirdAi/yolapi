var request = require("superagent");

function isUrl(item) {
    return item && item.indexOf("://") != -1;
}

function buildParams(urlString, b, c, engine) {
    if (b && b.start_proxy) {
        return {
            url: urlString,
            start_proxy: b.start_proxy,
            kmId: "supplied-by-proxy",
            engine,
        };
    } else {
        return { url: urlString, apiKey: b, kmId: c, engine };
    }
}

function processParameters(a, b, c, engine) {
    if (isUrl(a)) {
        return buildParams(a, b, c, engine);
    } else if (isUrl(b)) {
        return buildParams(b, a, c, engine);
    } else if (isUrl(c)) {
        return buildParams(c, a, b, engine);
    } else {
        return null;
    }
}

function attemptProxyStart(session, callback) {
    request.get(session.parameters.start_proxy).end(function(err, response) {
        if (!err && response && response.body) {
            session.id = response.body.id || response.body.sessionId;
        }
        callback(err);
    });
}

function attemptStart(session, allowSwap, callback) {
    request
        .get(session.parameters.url + "/start/" + session.parameters.kmId + "")
        .query(session.queryComponents)
        .set(
            "Authorization",
            "Basic " +
                Buffer.from(session.parameters.apiKey + ":").toString("base64")
        )
        .set("x-rainbird-engine", session.parameters.engine)
        .end(function(err, response) {
            if (err && err.message === "Unauthorized") {
                if (allowSwap) {
                    var temp = session.parameters.kmId;
                    session.parameters.kmId = session.parameters.apiKey;
                    session.parameters.apiKey = temp;
                    attemptStart(session, false, callback);
                } else {
                    callback(new Error("Failed to start a session"));
                }
            } else if (response && response.body && response.body.id) {
                session.id = response.body.id;
                callback(null, response.body);
            } else {
                callback(err);
            }
        });
}

function doQuery(session, data, callback) {
    request
        .post(session.parameters.url + "/" + session.id + "/query")
        .set("x-rainbird-engine", session.parameters.engine)
        .send(data)
        .end(function(error, response) {
            callback(error, error ? null : response.body);
        });
}

function doMetadata(session, data, callback) {
    request
        .post(session.parameters.url + "/" + session.id + "/metadata")
        .set("x-rainbird-engine", session.parameters.engine)
        .send(data)
        .end(function(error, response) {
            callback(error, error ? null : response.body);
        });
}

function doRespond(session, data, callback) {
    request
        .post(session.parameters.url + "/" + session.id + "/response")
        .set("x-rainbird-engine", session.parameters.engine)
        .send(data)
        .end(function(error, response) {
            callback(error, error ? null : response.body);
        });
}

function doUndo(session, callback) {
    request
        .post(session.parameters.url + "/" + session.id + "/undo")
        .set("x-rainbird-engine", session.parameters.engine)
        .send({})
        .end(function(error, response) {
            callback(error, error ? null : response.body);
        });
}

function prepareError(error, response) {
    var result = null;
    if (error) {
        var message = error.message;
        if (response.error) {
            error = response.error;
            message += "\n" + error.message;
            if (error.text) {
                message += "\n" + error.text;
            }
        }
        result = new Error(message);
    }

    return result;
}

function doInject(session, arrayOfFacts, callback) {
    request
        .post(session.parameters.url + "/" + session.id + "/inject")
        .set("x-rainbird-engine", session.parameters.engine)
        .send(arrayOfFacts)
        .end(function(error, response) {
            var cleanError = prepareError(error, response);
            callback(cleanError, cleanError ? null : response.body);
        });
}

function session(a, b, c, d, engine = "Core") {
    this.parameters = processParameters(a, b, c, engine);
    var p = this.parameters;

    if (!p || !p.url || (!p.apiKey && !p.start_proxy) || !p.kmId) {
        throw new Error("The Url, apiKey and kmId are all required.");
    }

    this.queryComponents = d || {};

    this.start = function(callback) {
        if (this.parameters.start_proxy) {
            attemptProxyStart(this, callback);
        } else {
            attemptStart(this, true, callback);
        }
    };

    this.inject = function(arrayOfFacts, callback) {
        doInject(this, arrayOfFacts, callback);
    };

    this.metadata = function(data, callback) {
        doMetadata(this, data, callback);
    };

    this.query = function(data, callback) {
        doQuery(this, data, callback);
    };

    this.respond = function(data, callback) {
        doRespond(this, data, callback);
    };

    this.undo = function(callback) {
        doUndo(this, callback);
    };
}

module.exports.session = session;
