const User = require('../models/user')

const initialUsers = [
  {
    username: 'zelhht',
    name: 'Hazel Tan',
    password: 'hazelpassword',
  },
  {
    username: 'matthewgani',
    name: 'Matthew Gani',
    password: 'mattpassword',
  },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = { initialUsers, usersInDb }
