const bot = require('../../../bot');
const { send } = require('../../../utils/chat');

exports.run = async (msg, args) => {
    if (args.length < 1) {
        await send(msg.channel, 'Unknown options.');
        return false;
    } else if (args.length > 1) {
        await send(msg.channel, 'Unknown options.');
        return false;
    }

    const name = args[0];

    const exists = bot.db.get('global', `timers[${name}]`);
    if (!exists) {
        await send(msg.channel, `Timer ${name} doesn't exist.`);
        return true;
    }


    bot.db.delete('global', `timers[${name}]`);

    await send(msg.channel, `Timer ${name} has been deleted.`);

    return true;
};

const usage = new Map();
usage.set('<name>', 'Removes timer <name>');
exports.usage = usage;

exports.config = {
    name: 'Remove Timer',
    cmd: 'remove',
    alias: ['delete', 'del', 'deltimer', 'remtimer'],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Removes timers',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
