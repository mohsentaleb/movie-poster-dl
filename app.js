const fs = require('fs')
const { join } = require('path')
const got = require('got');
const http = require('http');
const https = require('https');
const Stream = require('stream').Transform;

const workingDirectory = process.argv[2];
const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(join(p, f)).isDirectory());


(async () => {
    const movies = dirs(workingDirectory);

    await Promise.all(movies.map(async (movie) => {
        var regex = /(.*)\((\d+)\)/g; // (first group): movie name, (second group): year
        var matches = regex.exec(movie);
        var title = matches[1].trim();
        var year = matches[2];
        try {
            var movieInfo = await got('http://www.omdbapi.com/?apikey=133939a8&t=' + title + '&y=' + year, { json: true });
            var moviePoster  = movieInfo.body.Poster;
            console.log(`${title} - ${year} -  ${moviePoster}`);

            downloadImageToUrl(moviePoster, `${workingDirectory}/${movie}/poster.jpg`);
        } catch (err) {
            console.log(`*** Cannot get poster of movie "${movie}"...`);
            
        }

    }));
})();

var downloadImageToUrl = (url, filename, callback) => {
    var client = http;
    if (url.toString().indexOf("https") === 0) {
        client = https;
    }

    client.request(url, function (response) {
        var data = new Stream();

        response.on('data', function (chunk) {
            data.push(chunk);
        });

        response.on('end', function () {
            fs.writeFileSync(filename, data.read());
        });
    }).end();
};