"use strict";
var request = require('superagent');
var AccessToken = require('twilio').AccessToken;
var IpMessagingGrant = AccessToken.IpMessagingGrant;


var Auth = {

  getGoogleToken(req, res) {
    var id_token = req.body.idtoken;
    if(id_token) {
      request
      .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`)
      .then((googleRes)=> {
        res.send(googleRes.body);
      })
    } else {
      res.send(401, 'Please include \'idtoken\' property')
    }

  },

  // This function is mostly twilio stuff for now
  getIMToken(req, res) {
    var appName = 'TwilioChatDemo';
    var identity = Math.random().toString();
    var deviceId = req.query.device;

    // Create a unique ID for the client on their current device
    var endpointId = appName + ':' + identity + ':' + deviceId;

    // Create a "grant" which enables a client to use IPM as a given user,
    // on a given device
    var ipmGrant = new IpMessagingGrant({
        serviceSid: process.env.TWILIO_IPM_SERVICE_SID,
        endpointId: endpointId
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    token.addGrant(ipmGrant);
    token.identity = identity;
    // Serialize the token to a JWT string and include it in a JSON response
    res.send({
        identity: identity,
        token: token.toJwt()
    });
  }
};


module.exports = Auth;