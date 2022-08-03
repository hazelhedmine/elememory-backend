const bcrypt = require('bcrypt')
const User = require('../models/user')
const Deck = require('../models/deck')
const Card = require('../models/card')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('when a user creates a card', () => {
  beforeAll(async () => {
    await User.deleteMany({})
    await Deck.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      firstName: 'super',
      lastName: 'user',
      passwordHash,
    })
    await user.save()

    const savedUser = await helper.getUserId('root')

    const newDeck = {
      name: 'initial deck',
      userId: savedUser.id,
    }

    await api
      .post('/api/decks')
      .send(newDeck)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  beforeEach(async () => {
    await Card.deleteMany({})
  })

  test('creation succeeds with all fields', async () => {
    const deck = await helper.getDeckId('initial deck')

    const newCard = {
      question: 'test creation succeeds',
      answer: 'with all fields',
      deckId: deck._id,
    }

    await api
      .post('/api/cards')
      .send(newCard)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(1)
  })

  test('creation fails with missing question', async () => {
    const deck = await helper.getDeckId('initial deck')

    const newCard = {
      answer: 'with all fields',
      deckId: deck._id,
    }

    const result = await api
      .post('/api/cards')
      .send(newCard)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing question')

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(0)
  })

  test('creation fails with missing answer', async () => {
    const deck = await helper.getDeckId('initial deck')

    const newCard = {
      question: 'test creation succeeds',
      deckId: deck._id,
    }

    const result = await api
      .post('/api/cards')
      .send(newCard)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing answer')

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(0)
  })

  test('creation fails with missing deck ID', async () => {
    const newCard = {
      question: 'test creation succeeds',
      answer: 'with all fields',
    }

    const result = await api
      .post('/api/cards')
      .send(newCard)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing deck ID')

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(0)
  })
})

describe('when there is initially a card', () => {
  beforeAll(async () => {
    await User.deleteMany({})
    await Deck.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      firstName: 'super',
      lastName: 'user',
      passwordHash,
    })
    await user.save()

    const savedUser = await helper.getUserId('root')

    const newDeck = {
      name: 'initial deck',
      userId: savedUser.id,
    }

    await api
      .post('/api/decks')
      .send(newDeck)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  beforeEach(async () => {
    await Card.deleteMany({})

    const deck = await helper.getDeckId('initial deck')

    const newCard = {
      question: 'initial question',
      answer: 'initial answer',
      deckId: deck.id,
    }

    await api
      .post('/api/cards')
      .send(newCard)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('card can be deleted', async () => {
    const cardToDelete = (await helper.cardsInDb())[0]

    await api.delete(`/api/cards/${cardToDelete.id}`).expect(204)

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(0)
  })

  test('card can be updated', async () => {
    const cardToUpdate = (await helper.cardsInDb())[0]
    expect(cardToUpdate.question).toBe('initial question')
    expect(cardToUpdate.answer).toBe('initial answer')

    const editedCard = {
      ...cardToUpdate,
      question: 'card question can be updated',
      answer: 'as well as the answer',
    }

    await api.put(`/api/cards/${cardToUpdate.id}`).send(editedCard).expect(200)

    const cardsAtEnd = await helper.cardsInDb()
    const card = cardsAtEnd.find((c) => c.id === cardToUpdate.id)
    expect(card.question).toBe('card question can be updated')
    expect(card.answer).toBe('as well as the answer')
  })
})

describe('when there are many cards', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Deck.deleteMany({})
    await Card.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      firstName: 'super',
      lastName: 'user',
      passwordHash,
    })
    await user.save()

    const savedUser = await helper.getUserId('root')

    const newDeck = {
      name: 'initial deck',
      userId: savedUser.id,
    }

    await api
      .post('/api/decks')
      .send(newDeck)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const deck = await helper.getDeckId('initial deck')

    const initialCards = await helper.initialCards

    for (const card of initialCards) {
      const newCard = {
        ...card,
        deckId: deck.id, //_id will give ObjectId object
      }

      await api
        .post('/api/cards')
        .send(newCard)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    }
  })

  test('cards under a deleted deck will be deleted', async () => {
    const cardsAtStart = await helper.cardsInDb()
    expect(cardsAtStart).toHaveLength(helper.initialCards.length)

    const deckToDelete = (await helper.decksInDb())[0]
    await api.delete(`/api/decks/${deckToDelete.id}`).expect(204)
    const decksAtEnd = await helper.decksInDb()
    expect(decksAtEnd).toHaveLength(0)

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(0)
  })

  test('cards under a deleted user will be deleted', async () => {
    const cardsAtStart = await helper.cardsInDb()
    expect(cardsAtStart).toHaveLength(helper.initialCards.length)

    const userToDelete = (await helper.usersInDb())[0]
    await api.delete(`/api/users/${userToDelete.id}`).expect(204)

    const cardsAtEnd = await helper.cardsInDb()
    expect(cardsAtEnd).toHaveLength(0)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
