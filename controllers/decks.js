const decksRouter = require('express').Router()
const Deck = require('../models/deck')
const User = require('../models/user')
const Card = require('../models/card')

// decksRouter.get('/', async (request, response) => {
//   const decks = await Deck.find({})
//     .populate('user', { username: 1 })
//     .populate('cards', { question: 1, answer: 1 })

//   response.json(decks)
// })

decksRouter.get('/:id', async (request, response) => {
  const deck = await Deck.findById(request.params.id).populate('cards', {
    question: 1,
    answer: 1,
    id: 1,
  })
  console.log('deck :>> ', deck)
  response.json(deck)
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
  //TODO: validation checking, such as empty field etc
  const deck = request.body
  try {
    const updatedDeck = await Deck.findByIdAndUpdate(request.params.id, deck, {
      new: true,
      runValidators: true,
      context: 'query',
    })
    console.log('updatedDeck :>> ', updatedDeck)
    return response.status(200).json({ message: 'Successfully updated' })
  } catch (exception) {
    console.log('exception :>> ', exception)
    return response.status(400).json({ message: 'Validation failed' })
  }
})

decksRouter.delete('/:id', async (request, response) => {
  try {
    const deckToDelete = await Deck.findById(request.params.id)
    if (!deckToDelete) {
      return response.status(204).end()
    }

    await Card.deleteMany({ deckId: request.params.id })

    await Deck.findByIdAndRemove(request.params.id)
    // await Deck.deleteOne({ _id: request.params.id })

    response.status(204).end()
  } catch (exception) {
    console.log('exception :>> ', exception)
    return response.status(500).json({ message: 'Deletion failed' })
  }
})

// to delete all cards referencing deleted deck
// doesnt work
// Deck.pre('findByIdAndRemove', function (next) {
//   const deck = this
//   deck.model('Card').deleteMany({ deck: deck._id }, next)
// })

module.exports = decksRouter
