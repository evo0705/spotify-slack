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

  showHelp: function(){
  	var html = "/jukebox *help* _(See possible commands to be used in jukebox)_ \n";
  		html += "/jukebox *list* _(Get the track lists in jukebox playlist)_ \n";
  		html += "/jukebox *add [track]* _(Get the track lists in jukebox playlist)_ \n";
  		html += "/jukebox *remove [track]* _(Get the track lists in jukebox playlist)_ \n";
  		html += "/jukebox *clear* _(Get the track lists in jukebox playlist)_ \n";  		
  	return html;
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
  	
  },

  clearPlaylist: function(req, res, spotifyApi){
  	
  }
};

module.exports = jukebox;