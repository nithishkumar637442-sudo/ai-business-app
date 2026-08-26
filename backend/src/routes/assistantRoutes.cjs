const express = require('express')
const {
  assistantController,
} = require('../controllers/assistantController.cjs')

const router = express.Router()

router.post('/assistant', assistantController)

module.exports = router