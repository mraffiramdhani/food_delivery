'use strict'

var User = require('../models/user')
const jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs'),
    redis = require('../redis'),
    RevToken = require('../models/revoked_token');

// working as intended
module.exports.list_all_users = async (req, res) => {
    return redis.get('index_user', async (ex, data) => {
        if (data) {
            const resultJSON = JSON.parse(data);
            return res.status(200).send({
                success: true,
                source: 'Redis Cache',
                data: resultJSON
            });
        } else {
            const data = await User.getAllUser()
            redis.setex('index_user', 600, JSON.stringify({ ...data }))
            var x_data = { ...data }
            return res.status(200).send({ success: true, source: 'Database Query', data: x_data })
        }
    })
}

//working as intended
module.exports.register_user = async (req, res) => {
    const { name, username, password } = req.body
    const role_id = 3 //assuming that new registered user are all customer
    var new_user = new User({ name, username, password, role_id })

    if (!new_user.name || !new_user.username || !new_user.password) {
        res.status(400).send({
            error: true,
            message: "Please provide a valid data"
        })
    } else {
        await User.createUser(new_user).then((result) => {
            const token = jwt.sign({ name, username, role_id }, process.env.APP_KEY)
            var put_token = new RevToken({ token })
            RevToken.putToken(put_token, (err, data) => {
                if (err) {
                    res.send(err)
                    console.log('error', err)
                    console.log('res', result)
                } else {
                    res.send({
                        success: true,
                        result,
                        data,
                        token
                    })
                }
            })
        })
    }
}


module.exports.login_user = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).send({
            error: true,
            message: "Please provide a valid data"
        })
    } else {
        const user = await User.getUserByUsername(username)
        if (user) {
            console.log('User Controller login user - username verified')
            if (bcrypt.compareSync(password, user[0].password)) {
                console.log('User Controller login user - password verified')
                const { id, name, role_id } = user[0]
                const token = jwt.sign({ id, name, username, role_id }, process.env.APP_KEY)
                var put_token = new RevToken({ token })
                RevToken.putToken(put_token, (err, result) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.send({
                            success: true,
                            result,
                            token
                        })
                    }
                })
            } else {
                res.send({
                    success: false,
                    message: 'Invalid Password.'
                })
            }
        } else {
            res.send({
                success: false,
                message: 'User not found.'
            })
        }
    }
}

//working as intended
module.exports.create_user = async (req, res) => {
    var new_user = new User(req.body)

    if (!new_user.name || !new_user.username || !new_user.password || !new_user.role_id) {
        res.status(400).send({
            error: true,
            message: "Please provide a valid data"
        })
    } else {
        await User.createUser(new_user).then(async (result) => {
            await User.getUserById(result.insertId).then((data) => {
                res.send({ success: true, result, data })
            })
        })
    }
}

//working as intended
module.exports.update_user = async (req, res) => {
    var new_user = new User(req.body)
    const { id } = req.params

    if (!new_user.name || !new_user.username || !new_user.password || !new_user.role_id) {
        res.status(400).send({
            error: true,
            message: "Please provide a valid data"
        })
    } else {
        await User.updateUser(id, new_user).then(async (result) => {
            await User.getUserById(id).then((data) => {
                res.send({ success: true, result, data })
            })
        })
    }
}

module.exports.delete_user = async (req, res) => {
    const { id } = req.params
    await User.deleteUser(id).then((result) => {
        res.send({
            success: true, result
        })
    })
}

module.exports.logout_user = (req, res) => {
    RevToken.revokeToken(req.headers['jwt_token'],
        (err, result, fields) => {
            if (err) {
                res.send({
                    success: false,
                    message: err
                })
            } else {
                res.send({
                    success: true,
                    message: "User Logged Out Successfuly"
                })
            }
        }
    )
}