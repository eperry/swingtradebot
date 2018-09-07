# Just the begining of the bot.

I plan to have it do simple trade stratgies, like buy if drops $100 sell if goes up $200

I have created a new "Profitbot" which does this, I need some time to document it and extract some of my hardcoded values out of the code.


real quick install/test

DO NOT USE THIS TO MAKE MONEY - USE AT YOUR OWN RISK
cd profitbot
npm install
cp config/profit.js-v5.sample sample config/profit.js-v5.conf 
# Edit the gdax.conf with your API Key
BUY SELL BOT -- DO NOT USE AGAINST REAL MONEY/COINS
node ./profit-v5.js

DO NOT USE THIS TO MAKE MONEY - While the concept is sound of buy high sell low there are many conditions which it can loose money. Especially during Huge swings of prices


other-bots/MarketWatch.js  = monitoring of the market. Still in development there is no "BUYING or SELLING" so should be safe but use at your own risk

![MarketWatch](/images/MarketWatch.png)


profit-bot/profit.js      - The next evolution 

![Profit-Bot-V1](/images/Profit-Bot-V1.png)


profit-bot-v1/profit.js   - View the README.md  this bot works pretty well but again there are many conditions where is may not perform well. USE AT YOUR OWN RISK
