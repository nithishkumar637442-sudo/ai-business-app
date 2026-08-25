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
    const { message, business } = req.body

    console.log('BizAI received:', message)
    console.log('Business profile:', business)

    const lowerMessage = message.toLowerCase()

    const businessName = business?.businessName || 'your business'
    const businessType = business?.businessType || 'business'
    const targetCustomers =
      business?.targetCustomers || 'your customers'
    const monthlyBudget =
      business?.monthlyBudget || 'your current budget'
    const mainGoal =
      business?.mainGoal || 'business growth'

    let reply

    // SALES ADVISOR
    if (
      lowerMessage.includes('sales') ||
      lowerMessage.includes('sell') ||
      lowerMessage.includes('increase revenue')
    ) {
      reply =
        `For ${businessName}, your ${businessType} serving ${targetCustomers}, here are 3 ways to improve sales:\n\n` +
        `1. Create offers and product bundles that are attractive to ${targetCustomers}.\n` +
        `2. Focus your marketing on your best-selling products and encourage repeat purchases.\n` +
        `3. Track your sales regularly and focus on activities that support your goal of ${mainGoal}.`
    }

    // MARKETING ADVISOR
    else if (
      lowerMessage.includes('marketing') ||
      lowerMessage.includes('advertising') ||
      lowerMessage.includes('promotion') ||
      lowerMessage.includes('social media')
    ) {
      reply =
        `For ${businessName}, here are 3 marketing ideas for your ${businessType}:\n\n` +
        `1. Create useful content that is relevant to ${targetCustomers}.\n` +
        `2. Use social media to promote your products, offers, and customer benefits.\n` +
        `3. Plan your marketing spending around your monthly budget of ${monthlyBudget}.`
    }

    // COST ADVISOR
    else if (
      lowerMessage.includes('cost') ||
      lowerMessage.includes('expense') ||
      lowerMessage.includes('reduce cost') ||
      lowerMessage.includes('save money')
    ) {
      reply =
        `For ${businessName}, here are 3 ways to control costs:\n\n` +
        `1. Review recurring expenses and remove unnecessary spending.\n` +
        `2. Compare supplier prices and negotiate better rates.\n` +
        `3. Track monthly spending so you can protect your budget of ${monthlyBudget} while working toward ${mainGoal}.`
    }

    // DEFAULT RESPONSE
    else {
      reply =
        `I can help ${businessName} with sales, marketing, and cost improvement. ` +
        `Try asking: How can I increase my sales?`
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