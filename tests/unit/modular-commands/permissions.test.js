jest.mock('../../../src/bot', () => ({
    config: {
        isOwner: jest.fn()
    },
    db: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn()
    }
}));

const bot = require('../../../src/bot');
const permissions = require('../../../src/modular-commands/permissions');

describe('modular-commands - permissions unit tests', () => {
    describe('checkDebug', () => {
        let user, command;

        beforeAll(() => {
            user = {};
            command = {
                mod: {
                    config: {
                        debug: false
                    }
                },
                config: {
                    debug: false
                }
            };
        });

        test('returns false if command is debug and user is not owner', () => {
            command.config.debug = true;
            bot.config.isOwner.mockReturnValue(false);

            const result = permissions.checkDebug(user, command);

            expect(result).toBeFalsy();

            command.config.debug = false;
        });

        test('returns false if mod is debug and user is not owner', () => {
            command.mod.config.debug = true;
            bot.config.isOwner.mockReturnValue(false);

            const result = permissions.checkDebug(user, command);

            expect(result).toBeFalsy();

            command.mod.config.debug = false;
        });

        test('returns true if command is debug and user is owner', () => {
            command.config.debug = true;
            bot.config.isOwner.mockReturnValue(true);

            const result = permissions.checkDebug(user, command);

            expect(result).toBeTruthy();

            command.config.debug = false;
        });

        test('returns true if mod is debug and user is owner', () => {
            command.mod.config.debug = true;
            bot.config.isOwner.mockReturnValue(true);

            const result = permissions.checkDebug(user, command);

            expect(result).toBeTruthy();

            command.mod.config.debug = false;
        });

        test('returns true if mod and command are not debug', () => {
            command.config.debug = false;
            command.mod.config.debug = false;

            const result = permissions.checkDebug(user, command);

            expect(result).toBeTruthy();
        });
    });

    describe('hasDefaultPermission', () => {
        let member, command;
        beforeAll(() => {
            member = {
                hasPermission: jest.fn()
            };

            command = {
                config: {
                    defaultPermissions: []
                }
            };
        });

        test('returns false if defaultPermissions has NOONE', () => {
            command.config.defaultPermissions = ['NOONE'];
            member.hasPermission.mockReturnValue(true);

            const result = permissions.hasDefaultPermission(member, command);

            expect(result).toBeFalsy();
        });

        test('returns false if member does not have permission', () => {
            command.config.defaultPermissions = [];
            member.hasPermission.mockReturnValue(false);

            const result = permissions.hasDefaultPermission(member, command);

            expect(result).toBeFalsy();
        });

        test('returns true if member has permission', () => {
            command.config.defaultPermissions = [];
            member.hasPermission.mockReturnValue(true);

            const result = permissions.hasDefaultPermission(member, command);

            expect(result).toBeTruthy();
        });
    });

    describe('moduleEnabled', () => {
        let guild, mod;
        beforeAll(() => {
            guild = {
                id: '1'
            };

            mod = {
                config: {
                    enabled: true
                }
            };
        });

        test('returns false when mod is undefined', async () => {
            const result = await permissions.moduleEnabled(guild, undefined);

            expect(result).toBeFalsy();
        });

        test('returns true if guild exists and module is enabled in database', async () => {
            bot.db.get.mockResolvedValue(true);
            mod.config.enabled = false;

            const result = await permissions.moduleEnabled(guild, mod);

            expect(result).toBeTruthy();
        });

        test('returns false if guild exists and module is disabled in database', async () => {
            bot.db.get.mockResolvedValue(false);
            mod.config.enabled = true;

            const result = await permissions.moduleEnabled(guild, mod);

            expect(result).toBeFalsy();
        });

        test('returns true if mod is enabled, guild exists, and module status is not defined in database', async () => {
            bot.db.get.mockResolvedValue(undefined);
            mod.config.enabled = true;

            const result = await permissions.moduleEnabled(guild, mod);

            expect(result).toBeTruthy();
        });

        test('returns false if mod is not enabled, guild exists, and module status is not defined in database', async () => {
            bot.db.get.mockResolvedValue(undefined);
            mod.config.enabled = false;

            const result = await permissions.moduleEnabled(guild, mod);

            expect(result).toBeFalsy();
        });

        test('returns true if mod is enabled and guild does not exist', async () => {
            mod.config.enabled = true;

            const result = await permissions.moduleEnabled(undefined, mod);

            expect(result).toBeTruthy();
        });

        test('returns false if mod is not enabled and guild does not exist', async () => {
            mod.config.enabled = false;

            const result = await permissions.moduleEnabled(undefined, mod);

            expect(result).toBeFalsy();
        });
    });

    describe('validLocation', () => {
        let command;

        beforeAll(() => {
            command = {
                config: {
                    location: 'ALL'
                }
            };
        });

        test('returns true if location is ALL', () => {
            const type = 'should-not-matter';
            command.config.location = 'ALL';

            const result = permissions.validLocation(type, command);

            expect(result).toBeTruthy();
        });

        test('returns true if location is GUILD_ONLY and type is text', () => {
            const type = 'text';
            command.config.location = 'GUILD_ONLY';

            const result = permissions.validLocation(type, command);

            expect(result).toBeTruthy();
        });

        test('returns true if location is DM_ONLY and type is dm', () => {
            const type = 'dm';
            command.config.location = 'DM_ONLY';

            const result = permissions.validLocation(type, command);

            expect(result).toBeTruthy();
        });

        test('returns false if location is GUILD_ONLY and type is dm', () => {
            const type = 'dm';
            command.config.location = 'GUILD_ONLY';

            const result = permissions.validLocation(type, command);

            expect(result).toBeFalsy();
        });

        test('returns false if location is DM_ONLY and type is text', () => {
            const type = 'text';
            command.config.location = 'DM_ONLY';

            const result = permissions.validLocation(type, command);

            expect(result).toBeFalsy();
        });

        test('returns false if location is NONE', () => {
            const type = 'text';
            command.config.location = 'NONE';

            const result = permissions.validLocation(type, command);

            expect(result).toBeFalsy();
        });
    });
});