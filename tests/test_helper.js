const User = require('../models/user')
const Deck = require('../models/deck')
const Card = require('../models/card')

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

const initialCards = [
  {
    question: 'card1q',
    answer: 'card1a',
  },
  {
    question: 'card2q',
    answer: 'card2a',
  },
  {
    question: 'card3q',
    answer: 'card3',
  },
  {
    question: 'card4q',
    answer: 'card4a',
  },
  {
    question: 'card5q',
    answer: 'card5a',
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

const cardsInDb = async () => {
  const cards = await Card.find({})
  return cards.map((c) => c.toJSON())
}

const getUserId = async (username) => {
  const users = await User.find({})
  return users.find((user) => user.username === username)
}

const getDeckId = async (name) => {
  const decks = await Deck.find({})
  return decks.find((deck) => deck.name === name)
}

module.exports = {
  initialUsers,
  initialCards,
  usersInDb,
  decksInDb,
  cardsInDb,
  getUserId,
  getDeckId,
}
