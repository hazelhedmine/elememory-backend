const bcrypt = require('bcrypt')
const User = require('../models/user')
const Deck = require('../models/deck')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('when a user creates a deck', () => {
  beforeEach(async () => {
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
  })

  test('creation succeeds with all fields', async () => {
    const user = await helper.getUserId('root')

    const newDeck = {
      name: 'test creation succeeds with all fields',
      userId: user._id,
    }

    await api
      .post('/api/decks')
      .send(newDeck)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const decksAtEnd = await helper.decksInDb()
    expect(decksAtEnd).toHaveLength(1)
  })

  test('creation fails with missing name', async () => {
    const user = await helper.getUserId('root')

    const newDeck = {
      userId: user._id,
    }

    const result = await api
      .post('/api/decks')
      .send(newDeck)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing name')

    const decksAtEnd = await helper.decksInDb()
    expect(decksAtEnd).toHaveLength(0)
  })

  test('creation fails with missing user ID', async () => {
    const newDeck = {
      name: 'test creation fails with missing user ID',
    }

    const result = await api
      .post('/api/decks')
      .send(newDeck)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing user ID')

    const decksAtEnd = await helper.decksInDb()
    expect(decksAtEnd).toHaveLength(0)
  })
})

describe('when there is initially a deck', () => {
  beforeEach(async () => {
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
      userId: savedUser._id,
    }

    await api
      .post('/api/decks')
      .send(newDeck)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('deck can be deleted', async () => {
    const deckToDelete = (await helper.decksInDb())[0]

    await api.delete(`/api/decks/${deckToDelete.id}`).expect(204)

    const decksAtEnd = await helper.decksInDb()
    expect(decksAtEnd).toHaveLength(0)
  })

  test('deck can be updated', async () => {
    const deckToUpdate = (await helper.decksInDb())[0]
    expect(deckToUpdate.name).toBe('initial deck')
    const editedDeck = {
      ...deckToUpdate,
      name: 'test deck can be updated',
    }

    await api.put(`/api/decks/${deckToUpdate.id}`).send(editedDeck).expect(200)

    const decksAtEnd = await helper.decksInDb()
    const deck = decksAtEnd.find((d) => d.id === deckToUpdate.id)
    expect(deck.name).toBe('test deck can be updated')
  })
})

describe('when there are many decks', () => {
  beforeEach(async () => {
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

    const initialDecks = await helper.initialDecks

    for (const deck of initialDecks) {
      const newDeck = {
        ...deck,
        userId: savedUser.id, //_id will give ObjectId object
      }

      await api
        .post('/api/decks')
        .send(newDeck)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    }
  })

  test('decks under a deleted user will be deleted', async () => {
    const decksAtStart = await helper.decksInDb()
    expect(decksAtStart).toHaveLength(helper.initialDecks.length)

    const userToDelete = (await helper.usersInDb())[0]
    await api.delete(`/api/users/${userToDelete.id}`).expect(204)
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(0)

    const decksAtEnd = await helper.decksInDb()
    expect(decksAtEnd).toHaveLength(0)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
