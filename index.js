const Discord = require('discord.js');

const Token = require('./token.json');

const request = require('request');

const bot = new Discord.Client({disableEveryone: false})

bot.on('ready', function(){

    console.log(`Bot is ready, Username: ${bot.user.username}#${bot.user.discriminator}`);

    bot.user.setActivity("Loading...");

    let maxclients = null;

    let ip = "ip";

    let port = "port";

    setInterval(function()
    {
        request(`http://${ip}:${port}/info.json`, function(error, data, body)
        {
            if(!error && data && data.statusCode == 200)
            {
                let mp = JSON.parse(body);
                if(mp && mp.vars && mp.vars.sv_maxClients){ // https://ip:port/info.json -- sv_maxClients
                    maxclients = mp.vars.sv_maxClients;
                }
            }
            else
            {
                bot.guilds.forEach(guild => {
                    let playerOFF = "Players [0]";
                    let statusOFF = "Status [OFF]";

                    if(guild.channels.find(c => c.id === "playersCountChannelID") !== playerOFF)
                        bot.channels.get('playersCountChannelID').setName(playerOFF);

                    if(guild.channels.find(c => c.id === "statusChannelID") !== statusOFF)
                        bot.channels.get('statusChannelID').setName(statusOFF);

                    bot.user.setActivity("🐌(Offline)" + guild.memberCount + ".");
                })
            }
        });
        if(maxclients != null)
        {
            request(`http://${ip}:${port}/players.json`, function(error, data, body)
            {
                if(!error && data && data.statusCode == 200 )
                {
                    bot.guilds.forEach(guild => {
                        let pcn = "Players ["+JSON.parse(body).length + "/" + maxclients + "]";
                        let sc = "Status [ON]";

                        if(guild.channels.find(c => c.id === "playersCountChannelID") !== pcn)
                            bot.channels.get('playersCountChannelID').setName(pcn);

                        if(guild.channels.find(c => c.id === "statusChannelID") !== sc)
                            bot.channels.get('statusChannelID').setName(sc);
                    })
                }
                bot.guilds.forEach(guild => {
                    if(!error && data && data.statusCode == 200 )
                        bot.user.setActivity("🐌("+JSON.parse(body).length + "/" + maxclients + ")" + guild.memberCount + ".");
                })
                console.info("Updating: " + JSON.parse(body).length + "/" + maxclients );
            })
        }
    }, 7000);
})

bot.login(Token.token);