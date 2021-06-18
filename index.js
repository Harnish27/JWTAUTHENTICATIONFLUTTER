"use strict";

const express = require('express');

const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const database = new sqlite3.Database("./my.db");

const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());










app.use(router);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});
router.get('/', (req, res) => {
    res.status(200).send('This is an authentication server');
});

const createUsersTable = () => {
    const sqlQuery = 'CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY,username text,password text)';
    
        return database.run(sqlQuery);
    }
    
    const findUserByEmail = (username, cb) => {
        return database.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            cb(err, row)
        });
    }
    
    const createUser = (user, cb) => {
        return database.run('INSERT INTO users (username, password) VALUES (?,?)', user, (err) => {
            cb(err)
        });
    }
    createUsersTable();

    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    const SECRET_KEY = "m yincredibl y(!!1!11!)<'SECRET>)Key'!";



    router.post('/register', (req, res) => {

        const username = req.body.username;
       // const email = req.body.email;
        const password = bcrypt.hashSync(req.body.password);
    
        createUser([username, password], (err) => {
            if (err) return res.status(500).send("Server error!");
            findUserByEmail(username, (err, user) => {
                if (err) return res.status(500).send('Server error!');
                const expiresIn = 24 * 60 * 60;
                const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
                    expiresIn: expiresIn
                });
                res.status(200).send({
                    "user": user, "access_token": accessToken, "expires_in": expiresIn
                });
            });
        });
    });
    router.post('/login', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        findUserByEmail(username, (err, user) => {
            if (err) return res.status(500).send('Server error!');
            if (!user) return res.status(404).send('User not found!');
            const result = bcrypt.compareSync(password, user.password);
            if (!result) return res.status(401).send('Password not valid!');
    
            const expiresIn = 24 * 60 * 60;
            const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
                expiresIn: expiresIn
            });
            res.status(200).send({ "user": user, "access_token": accessToken, "expires_in": expiresIn });
        });
    });