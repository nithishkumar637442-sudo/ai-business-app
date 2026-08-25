const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'BizAI backend is running',
  })
})

app.post('/api/assistant', async (req, res) => {
  try {
    const { message } = req.body

    console.log('BizAI received:', message)

    const lowerMessage = message.toLowerCase()

    let reply

    // SALES ADVISOR
    if (
      lowerMessage.includes('sales') ||
      lowerMessage.includes('sell') ||
      lowerMessage.includes('increase revenue')
    ) {
      reply =
        'Here are 3 simple ways to improve your sales:\n\n' +
        '1. Identify your best-selling products and focus your marketing on them.\n' +
        '2. Offer targeted promotions to existing customers.\n' +
        '3. Follow up with customers after a purchase and encourage repeat business.'
    }

    // MARKETING ADVISOR
    else if (
      lowerMessage.includes('marketing') ||
      lowerMessage.includes('advertising') ||
      lowerMessage.includes('promotion') ||
      lowerMessage.includes('social media')
    ) {
      reply =
        'Here are 3 simple ways to improve your marketing:\n\n' +
        '1. Create useful and engaging content for your target customers.\n' +
        '2. Use social media platforms to showcase your products and offers.\n' +
        '3. Track which marketing campaigns bring the most customers and focus on what works.'
    }

    // COST ADVISOR
    else if (
      lowerMessage.includes('cost') ||
      lowerMessage.includes('expense') ||
      lowerMessage.includes('reduce cost') ||
      lowerMessage.includes('save money')
    ) {
      reply =
        'Here are 3 simple ways to reduce your business costs:\n\n' +
        '1. Review your recurring expenses and remove unnecessary subscriptions.\n' +
        '2. Compare supplier prices and negotiate better rates.\n' +
        '3. Track your monthly spending to identify areas where you can save money.'
    }

    // DEFAULT RESPONSE
    else {
      reply =
        'I can help with business sales, marketing, and cost improvement. Try asking: How can I increase my sales?'
    }

    res.json({
      reply: reply,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'BizAI request failed',
    })
  }
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`BizAI server running on http://localhost:${PORT}`)
})