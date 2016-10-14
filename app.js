var express       = require('express');
var bodyParser    = require('body-parser');
var request       = require('request');
var jukeBox       = require('./jukebox');
var SpotifyWebApi = require('spotify-web-api-node');
// var dotenv        = require('dotenv');
var SLACK_TOKEN = "hOrmrTCws4dXwjmypcBP1nav";
var SPOTIFY_USERNAME = "ravindranpandu";
var SPOTIFY_PLAYLIST_ID = "07jFGdc9tfGpzq91PqdNCh";

// dotenv.load();

var spotifyApi = new SpotifyWebApi({
  clientId     : "0d1f41d27aa84b1db9c77cd982c4699d",
  clientSecret : "6b791ffc071149cc9b6eb0ed5b43efa9",
  redirectUri  : "https://lit-plains-85178.herokuapp.com/callback"
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  if (spotifyApi.getAccessToken()) {
    return res.send('You are logged in.');
  }
  return res.send('<a href="/authorise">Authorise</a>');
});

app.get('/authorise', function(req, res) {
  var scopes = ['playlist-modify-public', 'playlist-modify-private'];
  var state  = new Date().getTime();
  var authoriseURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authoriseURL);
});

app.get('/callback', function(req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code)
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      return res.redirect('/');
    }, function(err) {
      return res.send(err);
    });
});

app.use('/store', function(req, res, next) {
  if (req.body.token !== SLACK_TOKEN) {
    return res.status(500).send('Cross site request forgerizzle!');
  }
  next();
});

app.post('/store', function(req, res) {
  spotifyApi.refreshAccessToken()
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      if (data.body['refresh_token']) { 
        spotifyApi.setRefreshToken(data.body['refresh_token']);
      }
      
      var data = jukeBox.getCommands(req),
          response = "";
      
      if(!data.error){
        switch(data.command){
          case "help":
            // response = jukebox.showHelp();
            var html = "/jukebox *help* _(See possible commands to be used in jukebox)_ \n";
                html += "/jukebox *list* _(Get the track lists in jukebox playlist)_ \n";
                html += "/jukebox *add [track]* _(Get the track lists in jukebox playlist)_ \n";
                html += "/jukebox *remove [track]* _(Get the track lists in jukebox playlist)_ \n";
                html += "/jukebox *clear* _(Get the track lists in jukebox playlist)_ \n"; 
            return res.send(html);
          break;

          case "add":
            jukebox.addTrack(req, res, spotifyApi);
          break;

          case "remove":
            jukebox.removeTrack(req, res, spotifyApi);
          break;

          case "list":
            jukebox.listPlaylist(req, res, spotifyApi);
          break;

          case "clear":
            jukebox.clearPlaylist(req, res, spotifyApi);
          break;

          default:
            return res.send('Invalid command please use /jukebox help for more info');
          break;
        }
      }else{
        return res.send(data.message);
      }
      
    }, function(err) {
      return res.send('Could not refresh access token. You probably need to re-authorise yourself from your app\'s homepage.');
    });
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));