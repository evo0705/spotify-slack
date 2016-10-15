var fs = require('fs');

var db = {
	init: function(){
		file.on('open', function() {
		    file.put('hello', {world:1});  // store some data 
		    file.put('hey', {world:2}, function() {
		        // 'hey' is now fully persisted 
		        console.log(file.get());
		    });
		});
	},
	select: function(){
		
	},
	insert: function(data){
				
	},
	delete: function(){
			
	}
};

module.exports = db;