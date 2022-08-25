const Discord = require("discord.js")
const { EmbedBuilder } = require('discord.js');
const { SpotifyPlugin } = require('@distube/spotify')
const client = new Discord.Client({ 
    intents: [
        "Guilds",
        "GuildMessages",             
        "GuildVoiceStates",
        "MessageContent",
    ]
});


//require things from config
const token = require("./config.json").token


//DisTube Stuffs
const { DisTube, Queue } = require("distube");

client.DisTube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
          emitEventsAfterFetching: true
        })]
})



//know when bot is on
client.on("ready", () =>{
    console.log("Bot is ready to play music!!")
})



//message -> event -> event happen
client.on("messageCreate", message => {
    if (message.author.bot || !message.guild) return;
    const prefix = "::"//prefix to use

    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift();





    //help
    if (message.content === `${prefix}help`) {
        const helpEmbed = new EmbedBuilder()
            .setColor('DarkGold')
            .setTitle('Help')
            .setDescription('The default prefix is **::**\n\n')
            .addFields(
                { name: 'play <song name>', value: 'Bot joins vc and plays listed song, can add more than 1' },
                { name: 'stop', value: 'stops player' },
                { name: 'pause', value: 'pauses the player can be unpaused' },
                { name: 'resume / unpause', value: 'unpauses the player' },
                { name: 'loop', value: 'loops the current song until stopped' },
                { name: 'skip', value: 'skips current song to next song in player' },
                { name: 'queue', value: 'shows the entire queue' },
                { name: 'leave', value: 'disconnects bot from vc' }
                )
        message.reply({ embeds: [helpEmbed] })
    }


    //customization




    //MAIN COMMANDS

    if (!message.content.toLowerCase().startsWith("::")) return;

    //play
    if (command === "play" ) {
        client.DisTube.play(message.member.voice.channel, args.join(" "), {
            member: message.member,
            textChannel: message.channel,
            message
        })
        console.log("Song playing")
        message.react("✅")
    }  
    
    
    //stop
    if (command === "stop") {
        client.DisTube.stop(message);
        message.channel.send("Stopped the queue!")
        console.log("Stopping player")
        message.react("✅")
    }

    //loop / repeat
    if (command === "loop") {
		client.DisTube.setRepeatMode(message)
        message.channel.send("Looping current song!")
        message.react("✅")
        console.log("Looping Currnt Song")
	}

    //pause
    if (command === "pause") {
        client.DisTube.pause(message)
        message.channel.send("Pausing the player")
        message.react("✅")
        console.log("Paused")
    }

    //resume
    if (command === "resume") {
        client.DisTube.resume(message)
        message.channel.send("Resuming the player")
        message.react("✅")
        console.log("Resuming")
    }

    //skip
    if (command === "skip") {
        client.DisTube.skip(message)
        message.channel.send("Skipping current song")
        message.react("✅")
        console.log("Skipping")
    }

    //show queue
    if (command === "queue") {
        const queue = client.DisTube.getQueue(message);
        if (!queue) {
            message.channel.send("Nothing in queue at the moment!")
        } else {
            message.channel.send(`Current queue:\n${queue.songs
                .map(
                    (song, id) =>
                        `**${id ? id : 'Playing'}**. ${
                            song.name
                        } - \`${song.formattedDuration}\``,
                )
                .slice(0, 10)
                .join('\n')}`,
            );
        }
        
    }

    //leave
    if (command === "leave") {
        client.DisTube.disconnect(message)
        message.channel.send("Leaving VC")
        message.react("✅")
        console.log("Leaving VC")
    }

    
    //DONT WORK, WILL CRASH BOT

    //filter
    if (
		[
			'3d',
			'bassboost',
			'echo',
			'karaoke',
			'nightcore',
			'vaporwave',
		].includes(command)
	) {
		const filter = client.DisTube.setFilter(message, command);
		message.channel.send(
			`Current queue filter: ${filter.join(', ') || 'Off'}`,
		);
	}


})


//does song stuff
client.DisTube
.on("playSong", (queue, song) => {
    const Playing = new EmbedBuilder()
        .setColor('DarkGold')
        .setTitle('Now playing:')
        .setDescription(song.name)
    
    queue.textChannel.send({ embeds: [Playing] })

})
.on('addSong', (queue, song) =>
queue.textChannel?.send(
    `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
))
.on('finish', queue => queue.textChannel?.send('Finish queue!'))
.on('disconnect', queue =>
	queue.textChannel?.send('Disconnected!'))
.on('searchNoResult', message =>
	message.channel.send('No result found!'),
)
.on('addList', (queue, playlist) =>
    queue.textChannel.send(
      `${client.emotes.success} | Added \`${playlist.name}\` playlist (${
        playlist.songs.length
      } songs) to queue\n${status(queue)}`
    )
)



client.login(token)
