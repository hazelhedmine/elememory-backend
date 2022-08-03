const cardsRouter = require('express').Router()
const Deck = require('../models/deck')
const Card = require('../models/card')

cardsRouter.get('/', async (request, response) => {
  const decks = await Deck.find({})
    .populate('user', { username: 1 })
    .populate('cards', { question: 1, answer: 1 })

  response.json(decks)
})

cardsRouter.post('/', async (request, response) => {
  const body = request.body

  const deck = await Deck.findById(body.deckId)

  const card = new Card({
    question: body.question,
    answer: body.answer,
    deck: deck._id,
  })

  const savedCard = await card.save()
  // id of deck is stored in decks field
  deck.cards = deck.cards.concat(savedCard._id)
  await deck.save()

  response.json(savedCard)
})

cardsRouter.put('/:id', async (request, response) => {
  const card = request.body //! might need to check this

  const updatedCard = await Card.findByIdAndUpdate(request.params.id, card, {
    new: true,
    runValidators: true,
    context: 'query',
  })

  response.json(updatedCard)
})

cardsRouter.delete('/:id', async (request, response) => {
  const cardToDelete = await Card.findById(request.params.id)
  if (!cardToDelete) {
    return response.status(204).end()
  }

  await Card.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

module.exports = cardsRouter
