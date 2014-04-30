// Module dependencies

var express    = require('express'),
    mysql      = require('mysql'),
    http       = require('http'),
    path       = require('path');

// Application initialization

var connection = mysql.createConnection({
        host     : 'cwolf.cs.sonoma.edu',
        user     : 'abrownlie',
        password : '3820042'
    });
    
var app = express();
var server = http.createServer(app);

// Database setup
//connection.query('DROP DATABASE IF EXISTS test', function(err) {
	//if (err) throw err;
	connection.query('CREATE DATABASE IF NOT EXISTS test', function (err) {
	    if (err) throw err;
	    connection.query('USE test', function (err) {
	        if (err) throw err;
        	connection.query('CREATE TABLE IF NOT EXISTS users('
	            + 'id INT NOT NULL AUTO_INCREMENT,'
	            + 'PRIMARY KEY(id),'
        	    + 'username VARCHAR(30),'
		    + 'password VARCHAR(30)'
	            +  ')', function (err) {
        	        if (err) throw err;
	            });
	    });
	});
//});

// Configuration

//app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
// Main route sends our HTML file

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});


app.get('/static.html', function(req, res) {
  res.sendfile(__dirname + '/static.html');
});

app.get('/dynamic.html', function(req, res) {
  res.sendfile(__dirname + '/dynamic.html');
});

app.get('/user/create', function(req, res) {
  res.sendfile(__dirname + '/createuser.html');
});

// Update MySQL database

// get user via POST
app.post('/user', function (req, res) {
    console.log(req.body);
    
    // get user by id
    if(typeof req.body.id != 'undefined') {
        connection.query('select * from users where id = ?', req.body.id, 
            function (err, result) {
                console.log(result);
                if(result.length > 0) {
                    var responseHTML = '<table class="users"><tr><th>ID</th><th>Username</th><th>Password</th></tr>';
                    responseHTML += '<tr><td>' + result[0].id + '</td>' + 
                                    '<td>' + result[0].username + '</td>' +
                                    '<td>' + result[0].password + '</td>' +
                                    '</tr></table>';
                    res.send(responseHTML);
                }
                else
                  res.send('User does not exist.');
            }
        );     
    }
    //get user by username    
    else if( typeof req.body.username != 'undefined') {
        connection.query('select username, password from users where username = ?', req.body.username, 
            function (err, result) {
                console.log(result);
                if(result.length > 0) {
  	              res.send('Username: ' + result[0].username + '<br />' +
		  	       'Password: ' + result[0].password
                );
            }
            else
                res.send('User does not exist.');
		});
    }
});

// get user via GET (same code as app.post('/user') above)
app.get('/user', function (req, res) {
    
    // get user by id
    if(typeof req.query.id != 'undefined') {
        connection.query('select * from users where id = ?', req.query.id, 
            function (err, result) {
                console.log(result);
                if(result.length > 0) {
                    var responseHTML = '<html><head><title>All Users</title><link a href="/style.css" rel="stylesheet"></head><body>';
                    responseHTML += '<div class="title">Node.js Table of Data Example</div>';
                    responseHTML += '<table class="users"><tr><th>ID</th><th>Username</th><th>Password</th></tr>';
                    responseHTML += '<tr><td>' + result[0].id + '</td>' + 
                                    '<td>' + result[0].username + '</td>' +
                                    '<td>' + result[0].password + '</td>' +
                                    '</tr></table>';
                    responseHTML += '</body></html>';
                    res.send(responseHTML);
                }
                else
                  res.send('User does not exist.');
            }
        );     
    }
    //get user by username    
    else if( typeof req.query.username != 'undefined') {
        connection.query('select username, password from users where username = ?', req.query.username, 
            function (err, result) {
                console.log(result);
                if(result.length > 0) {
  	              res.send('Username: ' + result[0].username + '<br />' +
		  	       'Password: ' + result[0].password
                );
            }
            else
                res.send('User does not exist.');
		});
    }
    else {
        res.send('no data for user in request');
    }
});

// return all users
app.get('/users', function (req, res) {
    connection.query('select * from users',
		function (err, result) {
            return result;
		}
	);        
});


// get all users in a <table>
app.get('/users/table', function (req, res) {
    connection.query('select * from users',
		function (err, result) {
            if(result.length > 0) {
                var responseHTML = '<html><head><title>All Users</title><link a href="/style.css" rel="stylesheet"></head><body>';
                responseHTML += '<div class="title">Node.js Table of Data Example</div>';
                responseHTML += '<table class="users"><tr><th class="rightalign">ID</th><th>Username</th><th>Password</th></tr>';
                for (var i=0; result.length > i; i++) {
                    responseHTML += '<tr>' +
                                    '<td><a href="/user/?id=' + result[i].id + '">' + result[i].username + '</a></td>' +
                                    '</tr>';
                }
                responseHTML += '</table>';
                responseHTML += '</body></html>';
                res.send(responseHTML);	
			}
			else
			  res.send('No users exist.');
		}
	);        
});


// get all users in a <select>
app.post('/users/select', function (req, res) {
    console.log(req.body);
	connection.query('select * from users', 
		function (err, result) {
			console.log(result);
			var responseHTML = '<select id="user-list">';
			for (var i=0; result.length > i; i++) {
				var option = '<option value="' + result[i].id + '">' + result[i].username + '</option>';
				console.log(option);
				responseHTML += option;
			}
            responseHTML += '</select>';
			res.send(responseHTML);			
		});
});

// Create a user
app.post('/user/create', function (req, res) {
    connection.query('INSERT INTO users SET ?', req.body, 
        function (err, result) {
            if (err) throw err;
            connection.query('select username, password from users where username = ?', req.body.username, 
				function (err, result) {
                    if(result.length > 0) {
						res.send('Username: ' + result[0].username + '<br />' +
								 'Password: ' + result[0].password
						);
                    }
                    else
                      res.send('User was not inserted.');
				}
			);
		}
    );
});


// Static Content Directory

app.use(express.static(path.join(__dirname, 'public')));


// Begin listening
server.listen(8001);
console.log("Express server listening on port %s", server.address().port);
