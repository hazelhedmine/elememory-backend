const User = require('../models/user')
const Deck = require('../models/deck')

const initialUsers = [
  {
    username: 'zelhht',
    firstName: 'Hazel',
    lastName: 'Tan',
    password: 'hazelpassword',
  },
  {
    username: 'matthewgani',
    firstName: 'Matthew',
    lastName: 'Gani',
    password: 'mattpassword',
  },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

const decksInDb = async () => {
  const decks = await Deck.find({})
  return decks.map((d) => d.toJSON())
}

const getUserId = async (username) => {
  const users = await User.find({})
  return users.find((user) => user.username === username)
}

module.exports = { initialUsers, usersInDb, decksInDb, getUserId }
