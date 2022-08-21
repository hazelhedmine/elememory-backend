const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  if (!user) {
    return response.status(401).json({
      error: 'invalid username',
    })
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    return response.status(401).json({
      error: 'invalid password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // expires in 4days * (24h * 60 min * 60 s)
  const token = jwt.sign(userForToken, process.env.SECRET)

  response.status(200).send({
    token,
    id: user._id,
  })
})

module.exports = loginRouter
