require("dotenv").config();

const express = require('express');
const hbs = require('hbs');
const app = express();

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const clientId = process.env.SPOTIFY_CLIENT_ID;
      clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirect_uri: 'https://example.com/callback'
});


// Fetch access token
spotifyApi.clientCredentialsGrant()
    .then(data => {
        spotifyApi.setAccessToken(data.body.access_token);
        // spotifyApi.setRefreshToken(data.body.refresh_token);
        console.log(`Success, access token found:`, data.body.access_token);
    })
    .catch(err => {
        console.log("Something went wrong when retrieving an access token", err);
    });

// the routes go here:

app.get("/", function(req, res, next) {

    Promise.resolve(req)
        .then(() => {
            console.log(`Success, loading 'index' page`);

            res.render("index");
        })
        .catch(err => console.log(`ERROR: 'index' page could not be loaded.`, err));
});

app.get("/artists", (req, res, next) => {

    Promise.resolve()
        .then(() => {
            // Spotify Search
            // https://developer.spotify.com/documentation/web-api/reference/search/search/

            const artistQuery = req.query.q;

            spotifyApi.searchArtists(artistQuery)
                .then((data) => {
                    // console.log('Success!', artists);
                    const artists = data.body.artists.items;

                    // @DEBUG res.send(artists)

                    res.render("artists", { artists });
                })
                .catch(err => console.log("The error while searching artists occurred: ", err));

        })
        .catch(err => console.log(`ERROR: 'artists' page could not be loaded.`, err));

});

app.get("/albums/:artistId", (req, res, next) => {
    const albumQuery = req.params.artistId;

        spotifyApi.getArtistAlbums(albumQuery)
            .then(data => {
                // console.log('Artist Album Information', data.body.items);

                const albums = data.body.items;

                // @DEBUG res.send(albums);

                res.render("albums", { albums });
            })
            .catch(err => console.error(`Error occured while querying for albums`, err));

});

app.get("/tracks/:albumId", (req, res, next) => {
    const tracksQuery = req.params.albumId;

    spotifyApi.getAlbumTracks(tracksQuery, { limit: 10, offset: 5 })
        .then((data) => {

            // console.log(data.body.items);

            const tracks = data.body.items;

            res.render("tracks", { tracks });
        })
        .catch(err => console.log(`Error occured while querying for tracks`, err));
})

app.listen(3000, () => console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊"));
