function TwainCloud(config) {
    this.config = config;
    this.handlers = {};
}

(function() {

    var scanners = [];
    var session = null;
    var eventHub = null;

    function sendRequest(verb, url, token, data) {
        return $.ajax({
            method: verb,
            url: url,
            headers: { Authorization: token },
            data: data
        }).promise();
    }

    function getScannerById(id) {
        for(var i = 0; i < scanners.length; ++i) {
            if (scanners[i].id === id)
                return scanners[i]
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function createEventHandler(twain, event) {
        return function(topic, message) {
            log('[MQTT] Topic: ' + topic + ', Message: ' + message);
            var handler = twain.handlers[event];
            if (handler) {
                handler(JSON.parse(message));
            }
        }
    }

    TwainCloud.prototype.claim = function claim(token, scannerId, registrationToken) {
        var deferred = $.Deferred();

        if (token) {
            log('Loading...');

            var claimEndpoint = this.config.apiEndpoint + '/claim';
            sendRequest('POST', claimEndpoint, token, {
                scannerId: scannerId,
                registrationToken: registrationToken
            })
            .then(function (data) {
                log(data);
                deferred.resolve(data);
            })
            .catch(function (error) {
                log('Unauthorized: ' + JSON.stringify(error));
                deferred.reject(error);
            });
        } else {
            log('Missing authentication token');
            deferred.reject();
        }

        return deferred.promise();
    };

    TwainCloud.prototype.getScanners = function getScanners(token) {
        var deferred = $.Deferred();

        if (token) {
            log('Loading...');

            sendRequest('GET', this.config.apiEndpoint + '/scanners', token)
            .then(function (data) {
                log(data);
                // cache scanners
                scanners = data;
                deferred.resolve(data);
            })
            .catch(function (error) {
                log('Unauthorized: ' + JSON.stringify(error));
                deferred.reject(error);
            });
        } else {
            log('Missing authentication token');
            deferred.reject();
        }

        return deferred.promise();
    };

    TwainCloud.prototype.startSession = function startSession(token, scannerId) {
        var deferred = $.Deferred();
        var twain = this;

        var scanner = getScannerById(scannerId);
        if (scanner) {
            // TODO: fix endpoint retrieval
            var sessionEndpoint = this.config.apiEndpoint + scanner.api[1];
            sendRequest('POST', sessionEndpoint, token, {
                "kind": "twainlocalscanner",
                "commandId": guid(),
                "method": "createSession"
            })
            .then(function (data) {
                log(data);

                // store new session
                session = data.results.session;

                // close previous mqtt client
                if (eventHub) {
                    eventHub.end(true);
                    eventHub = null;
                }

                // open a new one
                var mqttUrl = session.eventSource.url;
                eventHub = mqtt.connect(mqttUrl);
                eventHub.on('message', createEventHandler(twain, 'message'));
                eventHub.subscribe(session.eventSource.topic);

                deferred.resolve(data);
            })
            .catch(function (error) {
                log('Unauthorized: ' + JSON.stringify(error));
                deferred.reject(error);
            });
        }

        return deferred.promise();
    };

    TwainCloud.prototype.on = function on(event, callback) {
        this.handlers[event] = callback;
    }

})();

