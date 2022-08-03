const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('decks', { name: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  const { username, firstName, lastName, password } = request.body

  if (!password) {
    return response.status(400).json({
      error: 'invalid password',
    })
  }

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique',
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    firstName,
    lastName,
    passwordHash,
  })

  user
    .save()
    .then((savedUser) => {
      response.status(201).json(savedUser)
    })
    .catch((error) => next(error))
})

module.exports = usersRouter
