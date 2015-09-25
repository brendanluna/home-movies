// Get all packages needed
var express = require('express');
var router = express.Router();
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var fma = require('free-music-archive');
var port = process.env.PORT || 8080;

// handle redis for deployment (heroku) vs. dev
if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
} else {
    var redis = require("redis").createClient();
}

// redis error handling
redis.on('error', function(err) {
    console.log('Error ' + err);
});

// tell node where to look for site resources
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// set the view engine to ejs
app.set('view engine', 'ejs');

// log all requests to console
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});


router.get('/', function(req, res) {
    res.render('pages/index');
});

router.get('/search/:movie', function(req, res) {
    var val = req.params.movie;
    var url = "https://archive.org/advancedsearch.php?q=" + val +
        "+AND+mediatype:movies+AND+collection:(home_movies+OR+prelingerhomemovies)" +
        "&fl[]=identifier,title,mediatype,collection,downloads,description,date,avg_rating,year&rows=15&output=json";

    // make request and return response to client side
    request(url, function(err, resp, body){
        if(!err && resp.statusCode == 200){
            body = JSON.parse(body);
            res.send(body.response);
        } else{
            res.send("error is" + resp.statusCode);
        }
    });
    // // check if search query already exists
    // redis.exists(val, function(err, reply) {
    //     if (reply === 1) {
    //         // return cached query results
    //         console.log('exists in redis');
    //         redis.get(val, function(error, result) {
    //             if (error !== null) {
    //                 // handle error
    //             } else {
    //                 // send result as JSON
    //                 result = JSON.parse(result);
    //                 res.send(result.response);
    //             }
    //         });
    //     } else {
    //         console.log('doesn\'t exist in redis');
    //         request(url, function(err, resp, body) {
    //             body = JSON.parse(body);

    //             // logic used to compare search results with the input from user
    //             if (err) {
    //                 console.log("error");
    //             } else if (body.response.numFound === 0) {
    //                 // no results found
    //                 res.send('undefined');
    //             } else {
    //                 // set value and key in redis (set JSON to string)
    //                 redis.set(val, JSON.stringify(body));
    //                 console.log('added ' + val + ' to redis!');
    //                 // pass back the results to client side
    //                 res.send(body.response);
    //             }
    //         });
    //     }
    // });

});

router.get('/music', function(req, res) {
    var val = encodeURIComponent(req.query.search);
    fma.tracks({
        genre_handle: 'Ambient',
        limit: 100
    }, function(err, results) {
        if (err) {
            console.error(err);
        }
        console.log(JSON.stringify(results, null, 2));
        console.log(results.total);
        res.send(results);
    });
});

router.get('/song', function(req, res) {
    var val = encodeURIComponent(req.query.search);
    var url = 'http://freemusicarchive.org/services/track/single/' + val + '.json?api_key=BAB8WGEA2X7LQNJ6';
    console.log(url);
    request(url, function(err, resp, body) {
        console.log("song result is: " + body);
        // logic used to compare search results with the input from user
        if (err) {
            console.log("error");
        } else {
            // pass back the results to client side
            res.send(JSON.parse(body));
        }
    });
});

// 404 handling
router.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.use('/', router);

// start server
app.listen(port);
console.log("Server started!");