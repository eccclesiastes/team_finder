const router = require('express').Router();
const crypto = require('crypto');
const passwordGenerator = require('generate-password');
const { readFile } = require('fs').promises;
const { 
    getStatement,
    getPossibleUsers,
    createUser,
    getUpdateStatement,
    updateUser,
    getCorrectPassword,
    getCreateStatementLogging,
    logAction,
    insertCredentials,
    sendPasswordEmail
} = require('../src/builder/builder.js');

router.get('/', async (req, res, next) => {
    res.send(await readFile('./home.html', 'utf-8'));
});

router.get('/search', async (req, res, next) => {
    res.send(await readFile('./index.html', 'utf-8'));
});

router.get('/login', async (req, res, next) => {
    res.send(await readFile('./login.html', 'utf-8'));
});

router.get('/shortlist', async (req, res, next) => {
    res.send(await readFile('./shortlist.html', 'utf-8'));
});

router.get('/create', async (req, res, next) => {
    res.send(await readFile('./create.html', 'utf-8'));
});

router.get('/master', async (req, res, next) => {
    const html = await readFile('./master.html', 'utf-8');
    
    const salt = require('../config.json').masterSalt;

    const hashItem = (item) => {
        const hash = crypto.pbkdf2Sync(item, salt, 1000, 64, 'sha512').toString('hex');
        return hash;
    };

    const saltReplaced = html.replace('salt-placeholder', require('../config.json').masterSalt);
    const correctHashUserReplaced = saltReplaced.replace('correctUserHash-placeholder', hashItem(require('../config.json').masterUsername));
    const correctHashPassReplaced = correctHashUserReplaced.replace('correctPassHash-placeholder', hashItem(require('../config.json').masterPassword));
    res.send(correctHashPassReplaced);
});

router.post('/search', async (req, res, next) => {
    const sqlStatement = getStatement(req.body);

    getPossibleUsers(sqlStatement, async (result) => {
        const html = await readFile('./result.html', 'utf-8');
        let script = '';

        if (result) {
        
        script += `const data = ${JSON.stringify(result)}`;

        const replacedHtml = html.replace('script-placeholder', script);
        
        res.send(replacedHtml);
        } else {
            res.status(404).send(`<style>body {margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;}</style><h1 style="margin: 0 !important; text-align: center; background-color: rgb(51,51,51); color: white; padding-top: 25px; padding-bottom: 25px; margin-block-end: 0px !important; margin-block-start: 0px !important;">No results found</h1><h4 style="text-align: center;"><a href="/">Back to home</a></h4>`);
        };
    });
});

router.post('/login', async (req, res, next) => {
    const inputtedUsername = req.body.usernameLogin;
    const inputtedPassword = req.body.passwordLogin;

    const masterUsername = require('../config.json').masterUsername;
    const masterPassword = require('../config.json').masterPassword;

    if (inputtedUsername && inputtedPassword) {
        if (inputtedUsername !== masterUsername && inputtedPassword !== masterPassword) {
            getCorrectPassword(inputtedUsername, async (result) => {

                if (!result || !result[0]) {
                    return res.status(401).json({ message: 'Invalid Credentials' });
                };

                const resultPassword = result[0].password;
                const resultSalt = result[0].salt;

                const hashPassword = (password) => {
                    const hash = crypto.pbkdf2Sync(password, resultSalt, 1000, 64, 'sha512').toString('hex');
                    return hash === resultPassword;
                };
    
                const hashedPassword = hashPassword(inputtedPassword);

                if (hashedPassword) {
                    return res.status(200).json({ location: 'http://localhost:8080/create' });
                } else {
                    return res.status(401).json({ message: 'Invalid Credentials' });
                };
            });
        } else if (inputtedUsername === masterUsername && inputtedPassword === masterPassword) {
            return res.status(200).json({ location: 'http://localhost:8080/master'});
        } else {
            return res.status(401).json({ message: 'Invalid Credentials' });
        };
    };
});

router.post('/create', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return res.status(401).json({ message: 'Error, missing/invalid credentials' });
    };

    getCorrectPassword(req.body.username, async (result) => {

        if (!result || !result[0]) {
            return res.status(401).json({ message: 'Error, missing/invalid credentials' });
        };

        const resultPassword = result[0].password;
        const resultSalt = result[0].salt;

        const hashPassword = (password) => {
            const hash = crypto.pbkdf2Sync(password, resultSalt, 1000, 64, 'sha512').toString('hex');
            return hash === resultPassword;
        };

        const hashedPassword = hashPassword(req.body.password);

        if (hashedPassword) {
            logAction(req.body.username, getCreateStatementLogging(req.body), async (result) => {
                if (result) {
                    createUser(req.body, async (result) => {
                        if (result) {
                            return res.status(201).json({ message: 'Success' });
                        } else {
                            return res.status(409).json({ message: 'Error, please check if person (already) exists in database' });
                        };
                    });
                } else {
                    return res.status(500).json({ message: 'Error, action unable to be logged' });
                };
            });
        } else {
            return res.status(401).json({ message: 'Error, missing/invalid credentials' });
        };
    });
});

router.put('/create', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return res.status(401).json({ message: 'Error, missing/invalid credentials' });
    };

    getCorrectPassword(req.body.username, async (result) => {

        if (!result || !result[0]) {
            return res.status(401).json({ message: 'Error, missing/invalid credentials' });
        };

        const resultPassword = result[0].password;
        const resultSalt = result[0].salt;

        const hashPassword = (password) => {
            const hash = crypto.pbkdf2Sync(password, resultSalt, 1000, 64, 'sha512').toString('hex');
            return hash === resultPassword;
        };

        const hashedPassword = hashPassword(req.body.password);

        if (hashedPassword) {
            const sqlStatement = getUpdateStatement(req.body);

            if (sqlStatement === 1) {
                return res.status(401).json({ message: 'Error, please check if person (already) exists in database' });
            } else {
                logAction(req.body.username, sqlStatement, async (result) => {
                    if (result) {
                        updateUser(sqlStatement, async (result) => {
                            if (!result) {
                                return res.status(409).json({ message: 'Error, please check if person (already) exists in database' });
                            };

                            if (result.affectedRows > 0) {
                                return res.status(201).json({ message: 'Success' });
                            } else {
                                return res.status(409).json({ message: 'Error, please check if person (already) exists in database' });
                            };
                        });
                    } else {
                        return res.status(500).json({ message: 'Error, action unable to be logged' });
                    };
                });
            };
        } else {
            return res.status(401).json({ message: 'Error, missing/invalid credentials' });
        };
    });
});

router.post('/master', async (req, res, next) => {
    const masterUsername = require('../config.json').masterUsername;
    const masterPassword = require('../config.json').masterPassword;

    if (!req.body.username || !req.body.password) {
        return res.status(401).json({ message: 'Error, missing/invalid credentials' });
    };

    if (req.body.username === masterUsername && req.body.password === masterPassword) {
        const passwordToHash = passwordGenerator.generate({
            length: 20,
            numbers: true,
            symbols: true,
            lowercase: true,
            uppercase: true,
            strict: true
        });

        let salt = crypto.randomBytes(16).toString('hex');

        const hashPassword = (password) => {
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            return hash;
        };

        const password = hashPassword(passwordToHash);

        insertCredentials(req.body.newUserUsername, password, salt, async (result) => {
            if (result) {
                sendPasswordEmail(req.body.newUserEmail, req.body.newUserUsername, passwordToHash, async (sent) => {
                    if (sent) {
                        return res.status(201).json({ message: 'Success' });
                    } else {
                        return res.status(500).json({ message: 'Error, email unable to be sent' });
                    };
                });
            } else {
                return res.status(409).json({ message: 'Error, please check if person (already) exists in database' });
            };
        });
    } else { 
        return res.status(401).json({ message: 'Error, missing/invalid credentials' });
    };
});

module.exports = { router };