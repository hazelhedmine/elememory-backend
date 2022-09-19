const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Card = require('../models/card')
const Deck = require('../models/deck')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

usersRouter.get('/:id', async (request, response) => {
  const token = getTokenFrom(request)
  // check validity of token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(request.params.id).populate('decks', {
    name: 1,
    id: 1,
  })
  console.log('user :>> ', user)
  response.json(user)
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

usersRouter.put('/:id', async (request, response) => {
  const user = request.body
  const oldUser = await User.find({ username: user.username })

  if (oldUser.length === 0) {
    return response.status(400).json({
      error: 'username cannot be changed',
    })
  }

  await User.findByIdAndUpdate(request.params.id, user, {
    new: true,
    runValidators: true,
    context: 'query',
  })

  response.json({
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
    id: request.params.id,
  })
})

usersRouter.delete('/:id', async (request, response) => {
  const userToDelete = await User.findById(request.params.id)
  if (!userToDelete) {
    return response.status(204).end()
  }

  const decksToDelete = await Deck.find({ userId: request.params.id })

  for (const deck of decksToDelete) {
    await Card.deleteMany({ deckId: deck.id })
    await Deck.findByIdAndRemove(deck.id)
  }

  await User.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

module.exports = usersRouter
