var Gdax = require('gdax');
var gdaxconfig     = null
for ( i = 2; i < process.argv.length; i++){
        if ( process.argv[i].match(/--config/)){
                console.log(process.argv[i])
                let c = process.argv[i].split('=')[1]
                gdaxconfig = require(c);
        }
}
if ( gdaxconfig == null ) {
        console.error("--config=<file>")
        process.exit(1);
}
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key,
                                                gdaxconfig.secret,
                                                gdaxconfig.passphrase,
                                                gdaxconfig.apiURI);
//console.log(authedClient)
authedClient.getProductOrderBook(
  'LTC-USD',
  { level: 2 },
  (error, response, book) => {
    console.log(book)
  }
);
