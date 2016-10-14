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

  showHelp: function(req, res, spotifyApi){
  	var html = "<ul>";
  		html = "<li>/jukebox <strong>help</strong> <i>(See possible commands to be used in jukebox)</i></li>";
  		html = "<li>/jukebox <strong>list</strong> <i>(Get the track lists in jukebox playlist)</li>";
  		html = "<li>/jukebox <strong>add [track]</strong> <i>(Get the track lists in jukebox playlist)</li>";
  		html = "<li>/jukebox <strong>remove [track]</strong> <i>(Get the track lists in jukebox playlist)</li>";
  		html = "<li>/jukebox <strong>clear</strong> <i>(Get the track lists in jukebox playlist)</li>";
  		html += "</ul>";
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
  	
  },

  clearPlaylist: function(req, res, spotifyApi){
  	
  }
};

module.exports = jukebox;