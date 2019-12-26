'use strict'

const conn = require('../dbconfig')


var Restaurant = function Restaurant(data) {
    this.name = data.name
    this.logo = data.image
    this.longitude = data.longitude
    this.latitude = data.latitude
    this.description = data.description
    this.user_id = data.user_id
    this.created_at = new Date()
    this.updated_at = new Date()
}

Restaurant.getAllRestaurant = () => {
    return new Promise((resolve, reject) => {
        conn.query('select * from restaurants', (err, res, fields) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

Restaurant.getRestaurantById = (id) => {
    return new Promise((resolve, reject) => {
        conn.query('select * from restaurants where id=?', id, (err, res, fields) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

Restaurant.createRestaurant = (newData) => {
    const { name, logo, longitude, latitude, description, user_id, created_at, updated_at } = newData
    return new Promise((resolve, reject) => {
        conn.query(
            'INSERT INTO restaurants(name, logo, longitude, latitude, description, user_id, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?)',
            [name, logo, longitude, latitude, description, user_id, created_at, updated_at],
            (err, res, fields) => {
                if (err) reject(err)
                resolve(res)
            })
    })
}

Restaurant.updateRestaurant = (id, data) => {
    const { name, logo, longitude, latitude, description, user_id, updated_at } = data
    return new Promise((resolve, reject) => {
        conn.query('update restaurants set name=?, logo=?, longitude=?, latitude=?, description=?, user_id=?, updated_at=? where id=?',
            [name, logo, longitude, latitude, description, user_id, updated_at, id],
            (err, res, fields) => {
                if (err) reject(err)
                resolve(res)
            })
    })
}

Restaurant.deleteRestaurant = (id) => {
    return new Promise((resolve, reject) => {
        conn.query('delete from restaurants where id=?', id, (err, res, fields) => {
            if (err) reject(err)
            resolve(ress)
        })
    })
}

module.exports = Restaurant