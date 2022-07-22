const User = require('../models/user')

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

module.exports = { initialUsers, usersInDb }
