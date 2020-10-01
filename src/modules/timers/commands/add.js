const bot = require('../../../bot');
const { send } = require('../../../utils/chat');

exports.run = async (msg, args) => {
    if (args.length < 2) {
        await send(msg.channel, 'Unknown options.');
        return false;
    } else if (args.length > 2) {
        await send(msg.channel, 'Timer name needs to be a single word, no spaces. Length should be a number, in minutes.');
        return false;
    }

    const name = args[0];

    const exists =await bot.db.get('global', `timers[${name}]`);
    if (exists) {
        await send(msg.channel, `Timer ${name} already exists.`);
        return true;
    }

    let attemptedLength = args[1];
    if (attemptedLength.substr(-1) === 'm') { // if last char is 'm', remove it
        attemptedLength = attemptedLength.slice(0, attemptedLength - 1);
    }

    const length = parseInt(attemptedLength, 10);

    if (isNaN(length)) {
        await send(msg.channel, 'Timer name needs to be a single word, no spaces. Length should be a number, in minutes.');
        return false;
    }

    bot.db.set('global', `timers[${name}]`, {
        length: length,
        current: 0
    });

    await send(msg.channel, `Timer ${name} has been created with a length of ${length} minutes.`);

    return true;
};

const usage = new Map();
usage.set('<name> <length>', 'Creates a timer named <name> with <length> in minutes');
exports.usage = usage;

exports.config = {
    name: 'Add Timer',
    cmd: 'add',
    alias: ['addtimer', 'timeradd'],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Creates timers',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
