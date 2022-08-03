const decksRouter = require('express').Router()
const Deck = require('../models/deck')
const User = require('../models/user')

decksRouter.get('/', async (request, response) => {
  const decks = await Deck.find({})
    .populate('user', { username: 1 })
    .populate('cards', { question: 1, answer: 1 })

  response.json(decks)
})

decksRouter.post('/', async (request, response) => {
  const { name, userId } = request.body

  if (!name) {
    return response.status(400).json({
      error: 'missing name',
    })
  }

  if (!userId) {
    return response.status(400).json({
      error: 'missing user ID',
    })
  }

  const user = await User.findById(userId)

  const deck = new Deck({
    name: name,
    userId: userId,
  })

  const savedDeck = await deck.save()
  // id of deck is stored in decks field
  user.decks = user.decks.concat(savedDeck._id)
  await user.save()

  response.status(201).json(savedDeck)
})

decksRouter.put('/:id', async (request, response) => {
  const deck = request.body

  const updatedDeck = await Deck.findByIdAndUpdate(request.params.id, deck, {
    new: true,
    runValidators: true,
    context: 'query',
  })

  response.json(updatedDeck)
})

decksRouter.delete('/:id', async (request, response) => {
  const deckToDelete = await Deck.findById(request.params.id)
  if (!deckToDelete) {
    return response.status(204).end()
  }

  await Deck.findByIdAndRemove(request.params.id)
  // await Deck.deleteOne({ _id: request.params.id })

  response.status(204).end()
})

// to delete all cards referencing deleted deck
// Deck.pre('deleteOne', function (next) {
//   const deck = this
//   deck.model('Card').deleteMany({ deck: deck._id }, next)
// })

module.exports = decksRouter
