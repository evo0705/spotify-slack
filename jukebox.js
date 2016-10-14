var jukebox = {
  getCommands: function(req){
  	var content = req.body.text.split(" "),
		command = "",
		track = "",
		data = {};	

	if(content.length === 1){
		command = content[0];
		if(command == ""){
			data.error = true;
			data.message = "Not a valid command use help more info";
		}else{				
			data.error = false;
			data.command = command;
		}
	}else{
		command = content[0];
		track = content[1];

		data.error = false;	
		data.command = command;
		data.track = track;
	}	
	return data;
  },

  showHelp: function(req, res){
  	var html = "/jukebox *help* _(See possible commands to be used in jukebox)_ \n";
  		html += "/jukebox *list* _(Get the track lists in jukebox playlist)_ \n";
  		html += "/jukebox *add [trackID]* _(Get the track lists in jukebox playlist)_ \n";
  		html += "/jukebox *remove [trackID]* _(Get the track lists in jukebox playlist)_ \n";
  		html += "/jukebox *clear* _(Get the track lists in jukebox playlist)_ \n";  		
  	return res.send(html);
  },

  addTrack: function(req, res, spotifyApi){
  	if(req.body.text.indexOf(' - ') === -1) {
	    var query = 'track:' + req.body.text;
	} else { 
	    var pieces = req.body.text.split(' - ');
	    var query = 'artist:' + pieces[0].trim() + ' track:' + pieces[1].trim();
	}
  	spotifyApi.searchTracks(query).then(function(data) {
      var results = data.body.tracks.items;
      if (results.length === 0) {
        return res.send('Could not find that track.');
      }
      var track = results[0];
      spotifyApi.addTracksToPlaylist(SPOTIFY_USERNAME, SPOTIFY_PLAYLIST_ID, ['spotify:track:' + track.id])
        .then(function(data) {
          return res.send('Track added: *' + track.name + '* by *' + track.artists[0].name + '*');
        }, function(err) {
          return res.send(err.message);
        });
    }, function(err) {
      return res.send(err.message);
    });
  },

  removeTrack: function(req, res, spotifyApi){
  	
  },

  listPlaylist: function(req, res, spotifyApi){
  	spotifyApi.getPlaylist('ravindranpandu','07jFGdc9tfGpzq91PqdNCh').then(function(data) {
  		var html = "";
  		var time = "";
  		var tracks = data.body.tracks.items;

  		for(var i = 0; i < tracks.length; i ++){
  			time = millisToMinutesAndSeconds(tracks[i].track.duration_ms);
  			html += (i+1) + ") *" + tracks[i].track.name + "* _| Id: " + tracks[i].track.id + " | Duration: " + time + "_ \n";
  		}

  		if(html == ""){
  			html = "Playlist is empty, try adding tracks using /jukebox add [trackID]";
  		}
	    return res.send(html);
	},function(err) {
	    console.log('Something went wrong!', err);
	});
  },

  clearPlaylist: function(req, res, spotifyApi){
  	
  }
};

module.exports = jukebox;

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}