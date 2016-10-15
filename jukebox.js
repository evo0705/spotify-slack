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
		content.shift();
		track = content.join(" ");

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
  
  searchTracks: function(data, res, spotifyApi){
  	spotifyApi.searchTracks(data.track)
  	 	.then(function(data) {
  	 		return res.send(data);
  	 		var html = "";
  			var time = "";
	    	var tracks = data.body.tracks.items;
	  		for(var i = 0; i < tracks.length; i ++){
	  			time = millisToMinutesAndSeconds(tracks[i].track.duration_ms);
	  			html += (i+1) + ") *" + tracks[i].track.name + "* _(Id: " + tracks[i].track.id + ")_ `" + time + "` \n";
	  		}

	  		if(html == ""){
	  			html = "No results found, try searching with some other query";
	  		}		    
	  	}, function(err) {
	    	return res.send(err);
	  	});
  }, 

  addTrack: function(data, res, spotifyApi){  	  	
	spotifyApi.addTracksToPlaylist(data.username, data.playlistId, [data.track])
	    .then(function(data) {
	      return res.send(data);
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
  			html += (i+1) + ") *" + tracks[i].track.name + "* _(Id: " + tracks[i].track.id + ") `" + time + "` \n";
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