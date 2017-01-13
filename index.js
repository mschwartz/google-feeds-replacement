/**
 * Created by mschwartz on 1/12/17.
 */

const Feed = require('./lib/Feed'),
    express = require('express'),
    serveStatic = require('serve-static'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(serveStatic('public/ext-6.2.1'))

app.get('/jsapi', async function(req, res) {
    res.send(`
        var google = {
            load: function(name, version, options) {
                console.dir(arguments);
                if (options.callback) {
                    options.callback();
                }
            },
            feeds: {
                Feed: function(url) {
                    console.log('Feed: ' + url)
                    return {
                        url: url,
                        setNumEntries: function(n) {
                            console.log('setNumEntries: ' + n);
                        },
                        setResultFormat: function(format) {
                            console.log('setResultFormat: ' + format);
                        },
                        includeHistoricalEntries: function() {
                        },
                        load: function(callback) {
                            console.log('load: ' + url);
                            Ext.Ajax.request({
                                url: '//pd.ddns.us:8080/feed',
                                params: {
                                    url: url
                                },
                                success: function(response, opts) {
                                    callback(response);
                                }
                            });
                        }
                    }
                }
            }
        };
    `)
})

app.post('/feed', async function(req, res) {
    console.dir(req.body)
    const url = req.body.url
    try {
        const data = await new Feed(url).fetch()
        res.send({
            total: data.length,
            feed:  {
                entries: data.map((r) => {
                    return {
                        title: r.title,
                        author: r.author,
                        link: r.link,
                        categories: r.categories,
                        url: r.link,
                        publishedDate: r.pubDate,
                        content: r.description,
                        contentSnippet: r.summary
                    }
                })
            }
        })
    }
    catch (e) {
        console.dir(e)
    }
})

app.listen(8080, () => {
    console.log('google-feed-replacement listening on port 8080')
})

