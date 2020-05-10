const bot = require('../bot');

const checkDebug = (user, command) => {
    const debug = command.config.debug || command.mod.config.debug;
    if (debug && !bot.config.isOwner(user)) return false;
    return true;
};

const hasDefaultPermission = (member, command) => {
    const commandDefaultPermissions = command.config.defaultPermissions;

    if (commandDefaultPermissions.includes('NOONE')) {
        return false;
    }

    return member.hasPermission(commandDefaultPermissions);
};

const hasPermission = async (guild, member, command) => {
    let position = -1;
    let state = '';

    const commandPermission = await bot.db.get(guild, `permissions['${command.id}'].groups`);

    if (typeof commandPermission !== 'object')
        return hasDefaultPermission(member, command);

    for (const [id, role] of member.roles) {
        // highest position gets priority, in all non-undefined cases
        if (role.calculatedPosition > position) {
            let newState = commandPermission[id];
            if (newState) {
                position = role.calculatedPosition;
                state = newState;
            }
        }
    }

    if (state === 'allow') return true;
    if (state === 'deny') return false;

    // None of the above? Fall back to Default
    return hasDefaultPermission(member, command);
};

const setPermission = async (guild, command, role, state = 'default') => {
    // state can be 'allow' 'deny' or 'default'
    const dbKey = `permissions['${command.id}'].groups.${role.id}`;

    let previousState = await bot.db.get(guild, dbKey);
    if (!previousState) previousState = 'default';

    if (state === 'allow' || state === 'deny') {
        await bot.db.set(guild, dbKey, state);
        return previousState;
    } else {
        await bot.db.delete(guild, dbKey);
        return previousState;
    }
};

const validLocation = (type, command) => {
    const loc = command.config.location;

    if (loc === 'ALL') return true;
    if (type === 'text' && loc === 'GUILD_ONLY') return true;
    if (type === 'dm' && loc === 'DM_ONLY') return true;
    return false;
};

module.exports = {
    checkDebug,
    hasPermission,
    hasDefaultPermission,
    setPermission,
    validLocation
};
