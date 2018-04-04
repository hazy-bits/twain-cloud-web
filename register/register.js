var twain = new TwainCloud({ apiEndpoint: apiEndpoint });
var autoRefresh = true;

function authorizeClaim() {
  var query = getQueryParams(document.location.search);

  if (isAuthorized()) {
    var scannerId = query.scannerId;
    claimScanner(scannerId);
  } else {
    query += '&confirmed=true';
    login('register/', query );
  }
}

function claimScanner(scannerId) {
  var authorizationToken = getAuthToken();
  var registrationToken = $('#registrationToken').val();

  twain.claim(authorizationToken, scannerId, registrationToken)
    .then(function (data) {
      log('successfully registered!');

      if (data.name) {
        $('#scannerName').text(data.name);
      }

      $('#authorizeForm').hide();
      $('#congratsForm').show();
    })
    .catch(function (error) {
      if(autoRefresh) {
        refreshToken(function() { claimScanner(scannerId); });
      } else {
        log('Unauthorized: ' + JSON.stringify(error));
      }
    });
}

$(function () {
  processQueryAuth();
  var query = getQueryParams(document.location.search);

  var confirmed = query.confirmed || '';

  if (confirmed) {
    var scannerId = query.scannerId || '';
    claimScanner(scannerId);
  }

    /*
    if (isAuthorized()) {
        $('#claimForm').show();
    } else {
        $('#authorizeForm').show();
    }


    $('#claimButton').on('click', function() {
        var scannerId = query.scannerId || '';
        claimScanner(scannerId);
    });
    */
});