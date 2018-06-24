var twain = new TwainCloud({ apiEndpoint: apiEndpoint });
var autoRefresh = true;

function authorizeClaim(provider) {
  var query = getQueryParams(document.location.search) || {};

  if (isAuthorized()) {
    var scannerId = query.scannerId;
    claimScanner(scannerId);
  } else {
    query.confirmed = true;
    login(provider, 'register/', query );
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
  $('#facebookLogin').on('click', function(event) {
    authorizeClaim('facebook');
  });
  $('#googleLogin').on('click', function(event) {
    authorizeClaim('google');
  });

  processQueryAuth();
  var query = getQueryParams(document.location.search);

  var confirmed = query.confirmed || '';

  if (confirmed) {
    var scannerId = query.scannerId || '';
    claimScanner(scannerId);
  }
});