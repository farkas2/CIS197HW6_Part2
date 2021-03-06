const express = require('express')

const router = express.Router()
const User = require('../models/user')
const isAuthenticated = require('../middlewares/isAuthenticated')

// middleware for checking whether logged in
router.post('/', async (req, res) => {
  // could also send back username (or whatever)
  if (typeof (req.session) !== 'undefined') {
    if (typeof req.session.username !== 'undefined') {
      if (req.session.username !== '' && req.session.username !== null) {
        res.send(
          { data: 'user is logged in', username: req.session.username },
        )
        return
      }
    }
  }
  res.send('user not logged in')
})

// signup
router.post('/signup', async (req, res, next) => {
  const { username, password } = req.body

  try {
    await User.create({ username, password })
    res.send('user created')
  } catch (err) {
    // console.log(err)
    const err2 = new Error('User creation has problems')
    next(err2)
    res.send('user signup has problems') // preferred
  }
})

// login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) {
      res.send('user does not exist')
    } else {
      const { password: passDB } = user // const passDB = user.password
      if (password === passDB) {
        req.session.username = username
        req.session.password = password
        res.send('user logged in successfully')
        // console.log('req.session.name after login is')
        // console.log(req.session.username)
      } else {
        res.send('user credentials are wrong')
      }
    }
  } catch (err) {
    const err2 = new Error('User login has problems')
    next(err2)
  }
})

// logout
router.post('/logout', isAuthenticated, (req, res) => {
  req.session.username = null
  req.session.password = null
  res.send('user is logged out // session terminated')
})

module.exports = router
