'use strict';

var twain = new TwainCloud({ apiEndpoint: apiEndpoint });

var scanners = [];
var autoRefresh = true;

function loadScanners() {
    var authorizationToken = localStorage.getItem('authorization_token');

    twain.getScanners(authorizationToken)
        .then(function (data) {
            // cache scanners
            scanners = data;

            // fill scanners table
            var rows = '';
            data.forEach(function(scanner) {
                rows +=
                    '<tr id="' + scanner.id + '">' +
                    '<td>' + scanner.name + '</td>' +
                    '<td>' + scanner.manufacturer + '</td>' +
                    '<td>' + scanner.model + '</td>' +
                    '<td>' + scanner.connection_state + '</td>' +
                    '</tr>';
            });
            $("#scannersTable tbody").html(rows);

            // resubscribe new rows
            $('#scannersTable > tbody > tr').click(function(event) {
                $('#scannersTable > tbody > tr').removeClass('table-success');
                $(event.currentTarget).addClass('table-success')
            });
        })
        .catch(function (error) {
            if(autoRefresh) {
                refreshToken(loadScanners);
            } else {
                log('Unauthorized: ' + JSON.stringify(error));
            }
        });
}

function startSession() {
    var scannerId = $('#scannersTable tbody .table-success').attr('id');
    var authorizationToken = localStorage.getItem('authorization_token');

    twain.startSession(authorizationToken, scannerId)
        .then(function(session) {
            twain.on('message', function(message) {
                log(message);
            })
        })
        .catch(function(error) {
            if(autoRefresh) {
                refreshToken(startSession);
            } else {
                log('Unauthorized: ' + JSON.stringify(error));
            }
        });
}

$(function () {
    $('#login').on('click', function(event) {
        login();
    });
    $('#logout').on('click', function(event) {
        logout();
    });
    $('#refreshScanners').on('click', loadScanners);
    $('#startSession').on('click', startSession);

    processQueryAuth(loadScanners);
});