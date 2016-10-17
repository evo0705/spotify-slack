var request = require("request");
var db = require('node-localdb');
var user = db('db.json');
var SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

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
  	 		var html = "-----------*SEARCH RESULTS*--------\n";
  			var time = "";
	    	var tracks = data.body.tracks.items;
	    	
	  		for(var i = 0; i < tracks.length; i ++){
	  			time = millisToMinutesAndSeconds(tracks[i].duration_ms);
	  			html += (i+1) + ") *" + tracks[i].name + " => " + tracks[i].album.name + "* _[" + tracks[i].id + "]_ `" + time + "` <" + tracks[i].preview_url + "|Preview>\n";
	  		}

	  		if(html == ""){
	  			html = "No results found, try searching with some other query";
	  		}
	  		return res.send(html);		    
	  	}, function(err) {
	    	return res.send(err);
	  	});
  }, 

  addTrack: function(data, res, spotifyApi){  
  	var url = "https://api.spotify.com/v1/tracks/" + data.track;  	
  	request(url, function (error, response, body) {  		
	  if (!error && response.statusCode == 200) {	    
	  	var result = JSON.parse(body);	  		  	
	    var time = millisToMinutesAndSeconds(result.duration_ms);
    	var html = "--------------NEW TRACK ADDED TO JUKEBOX-------------\n";	      	
	    html += "*Song* : " + result.name + "\n";
	    html += "*Album* : " + result.album.name + "\n";
	    html += "*Track ID* : " + result.id + "\n";
	    html += "*Duration* : " + time + "\n";	    
	    html += "*Preview* : <" + result.preview_url + "|Preview>\n";
	    html += "*Added By* : " + data.name;	    

	    spotifyApi.addTracksToPlaylist(data.username, data.playlistId, [result.uri])
	    .then(function(response) {	    	
	    	var options = {
			  uri: SLACK_WEBHOOK_URL,
			  form: '{"text": "<http://void(0)|@' + data.name + '> requested `' + result.name + '` from `' + result.album.name + '`"}'
			};
		  	request.post(options, function (error, response, body) {  		  		
		  		if (!error && response.statusCode == 200) {
		  			return res.send(html);	    		    	
		  		}
		  		return res.send(error);
		  	});
	    }, function(err) {
	      return res.send(err.message);
	    }); 
	  }
	});	  		   
  },

  removeTrack: function(req, res, spotifyApi){
  	res.send("Opps!, you don't have access to command *REMOVE*");
  },

  listPlaylist: function(req, res, spotifyApi){
  	spotifyApi.getPlaylist(req.username, req.playlist).then(function(data) {
  		var html = "-----------*JUKEBOX PLAYLIST*--------\n";
  		var time = "";
  		var tracks = data.body.tracks.items;

  		for(var i = 0; i < tracks.length; i ++){
  			time = millisToMinutesAndSeconds(tracks[i].track.duration_ms);
  			html += (i+1) + ") *" + tracks[i].track.name + " => " + tracks[i].track.album.name + "* _[" + tracks[i].track.id + "]_ `" + time + "` <" + tracks[i].track.preview_url + "|Preview>\n";
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
  	res.send("Opps!, you don't have access to command *CLEAR*");
  },

  setUser: function(data, res){  	
  	var result = data.track.split(" ");

  	if(result.length === 2){ 
  		user.remove({type: 'user'}).then(function(deletedUser){
		    if(deletedUser.length > 0){
		    	user.insert({type: 'user',username: result[0], playlist: result[1]}).then(function(u){		    
				    return res.send("User changed successfully as *" + result[0] + "* and playlist *" + result[1] + "*");		    
				});	
		    }
		}); 	
  	}else{
  		return res.send("Bad way to setUser, follow the command /jukebox *setUser* _username_ _playlist_");
  		
  	}  	
  },

  getUser: function(data, res){
  	user.findOne({type: 'user'}).then(function(user){
	    return {username: user.username, playlist: user.playlist};	    
	});
  },

  notify: function(res){  	
  var name="ravin",song="one love",album="Blue";  	
  	var options = {
	  uri: SLACK_WEBHOOK_URL,
	  form: '{"text": "<http://void(0)|@' + name + '> requested `' + song + '` from `' + album + '`"}'
	};
  	request.post(options, function (error, response, body) {  
  		console.log(error);
  		console.log(body);
  		if (!error && response.statusCode == 200) {
  			return res.send(body);
  		}
  		return res.send(error);
  	});
  }
};

module.exports = jukebox;

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}