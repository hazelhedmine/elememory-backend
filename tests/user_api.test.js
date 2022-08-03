const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('../tests/test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      firstName: 'super',
      lastName: 'user',
      passwordHash,
    })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      firstName: 'Matti',
      lastName: 'Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      firstName: 'super',
      lastName: 'user',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('user can be deleted', async () => {
    const userToDelete = (await helper.usersInDb())[0]

    await api.delete(`/api/users/${userToDelete.id}`).expect(204)

    const usersAtEnd = await helper.decksInDb()
    expect(usersAtEnd).toHaveLength(0)
  })

  test('user can update first name', async () => {
    const userToUpdate = (await helper.usersInDb())[0]
    expect(userToUpdate.username).toBe('root')
    const editedUser = {
      ...userToUpdate,
      firstName: 'new first name',
    }

    await api.put(`/api/users/${userToUpdate.id}`).send(editedUser).expect(200)

    const usersAtEnd = await helper.usersInDb()
    const user = usersAtEnd.find((u) => u.id === userToUpdate.id)
    expect(user.firstName).toBe('new first name')
  })

  test('user can update last name', async () => {
    const userToUpdate = (await helper.usersInDb())[0]
    expect(userToUpdate.username).toBe('root')
    const editedUser = {
      ...userToUpdate,
      lastName: 'new last name',
    }

    await api.put(`/api/users/${userToUpdate.id}`).send(editedUser).expect(200)

    const usersAtEnd = await helper.usersInDb()
    const user = usersAtEnd.find((u) => u.id === userToUpdate.id)
    expect(user.lastName).toBe('new last name')
  })

  test('user cannot update username', async () => {
    const userToUpdate = (await helper.usersInDb())[0]
    expect(userToUpdate.username).toBe('root')
    const editedUser = {
      ...userToUpdate,
      username: 'newusername',
    }

    await api.put(`/api/users/${userToUpdate.id}`).send(editedUser).expect(400)

    const usersAtEnd = await helper.usersInDb()
    const user = usersAtEnd.find((u) => u.id === userToUpdate.id)
    expect(user.username).toBe('root')
  })
})

describe('when creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('creation succeeds if last name is missing', async () => {
    const newUser = {
      username: 'mluukkai',
      firstName: 'Matti',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails if username is missing', async () => {
    const newUser = {
      firstName: 'Matti',
      lastName: 'Luukkainen',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('User validation failed')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(0)
  })

  test('creation fails if first name is missing', async () => {
    const newUser = {
      userName: 'MattyLuu',
      lastName: 'Luukkainen',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('User validation failed')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(0)
  })

  test('creation fails if password is missing', async () => {
    const newUser = {
      userName: 'MattyLuu',
      firstName: 'Matti',
      lastName: 'Luukkainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('invalid password')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(0)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
