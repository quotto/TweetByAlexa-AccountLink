const http = require('http')
const express = require('express')
const session = require('express-session')
const OAuth = require('oauth').OAuth
const fs = require('fs')
const url = require('url')
const path = require('path')
const Logger = require('./logger.js')
const logger = new Logger()

const app = express()
app.use(session({secret: process.env.TWEETLOG_SESSION}))
app.set('view engine','ejs')

var mime = {
    '.html':'text/html',
    '.css':'text/css',
    '.js':'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico':'image/x-icon'
}

const port = process.argv[2] ? process.argv[2] : 2001
const server = http.createServer(app).listen(port, ()=>{
    logger.write( "server is starting on " + server.address().port + " ..." )
});

const oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.CONSUMER_KEY,
    process.env.CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
)

app.get(/.+\..+/,(req,res,next)=>{
    let requestPath = url.parse(req.url).pathname;
    logger.write(`->${req.method} ${requestPath}`,"REQ")

    let sendResource = path.join('./public',requestPath)
    res.set({"Content-Type":mime[path.extname(sendResource)]}) //ヘッダーはデータ送信前に設定
    let sendFile = fs.createReadStream(sendResource)
    let responseData = ''

    sendFile.on("data",(data)=>{
        res.write(data)
    })

    sendFile.on("close",()=> {
        res.status(200).end()
        res.end()
        logger.write(`<- OK:${req.method} ${sendResource}`,"RES")
    })

    sendFile.on("error",(err)=>{
        logger.write(`<- Error:${req.method} ${requestPath}`,"ERROR")
    })
})

app.get('/oauth/request_token',(req,res)=>{
    req.session.state = req.query.state
    req.session.client_id = req.query.client_id
    req.session.vendor_id = req.query.vendor_id
    req.session.redirect_uri = req.query.redirect_uri
    oauth.getOAuthRequestToken((error,oauth_token,oauth_token_secret,results)=> {
        req.session.request_token = oauth_token
        req.session.request_token_secret = oauth_token_secret
        res.render('accountlink',{authorize_url:`https://twitter.com/oauth/authenticate?oauth_token=${oauth_token}`})
    })
})

app.get('/oauth/callback',(req,res)=>{
    let redirecturl = ""
    if(req.query.denied) {
        redirecturl = req.session.redirect_uri
        res.redirect(redirecturl)
    } else {
        oauth.getOAuthAccessToken(
            req.session.request_token,req.session.request_token_secret,req.query.oauth_verifier,
            (error,oauth_access_token,oauth_access_token_secret,results)=>{
                redirecturl = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${oauth_access_token},${oauth_access_token_secret}&client_id=${req.session.client_id}&token_type=Bearer`
                res.redirect(redirecturl)
        })
    }
})
