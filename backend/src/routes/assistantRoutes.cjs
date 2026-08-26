const express = require('express')
const { askOllama } = require('../services/aiService.cjs')

const router = express.Router()

router.post('/assistant', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Please enter a question.',
      })
    }

    const reply = await askOllama([
      {
        role: 'user',
        content: message.trim(),
      },
    ])

    res.json({
      reply,
    })
  } catch (error) {
    console.error('Assistant route error:', error)

    res.status(500).json({
      error: 'AI request failed',
    })
  }
})

module.exports = router