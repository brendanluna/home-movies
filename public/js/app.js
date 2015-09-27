angular.module('homeMovies', []);

// factory for consuming web services and returnin data to controller
angular.module('homeMovies').factory('mainService', function($http) {
    return {
        getMovies: function(query) {
            // return promise to data
            return $http.get('/search/' + query).then(function(response) {
                // resolve the promise as the data
                return response.data;
            });
        }
    };
});

angular.module('homeMovies').factory('songService', function($http) {
    return {
        getSongs: function() {
            // return promise to data
            return $http.get('/music').then(function(response) {
                // resolve the promise as the data
                return response.data;
            });
        },
        getRandomSong: function(query) {
            // return promise to data
            return $http.get('/song/' + query).then(function(response) {
                // resolve the promise as the data
                console.log("getRandomSong" + response.data);
                return response.data;
            });
        }
    };
});