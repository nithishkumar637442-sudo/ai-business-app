const { askOllama } = require('../services/aiService.cjs')

async function assistantController(req, res) {
  try {
    const { message, business } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Please enter a question.',
      })
    }

    const userQuestion = message.trim()

    const businessName =
      business?.businessName?.trim() || 'Not provided'

    const businessType =
      business?.businessType?.trim() || 'Not provided'

    const targetCustomers =
      business?.targetCustomers?.trim() || 'Not provided'

    const monthlyBudget =
      business?.monthlyBudget?.trim() || 'Not provided'

    const mainGoal =
      business?.mainGoal?.trim() || 'Not provided'

    const systemPrompt = `
You are BizAI, a practical AI business advisor.

Use the business profile when it is relevant to the user's question.

Business Name:
${businessName}

Business Type:
${businessType}

Target Customers:
${targetCustomers}

Monthly Budget:
${monthlyBudget}

Main Business Goal:
${mainGoal}

Important:
- Focus directly on the user's question.
- Give practical and concise advice.
- Consider the business type and target customers.
- Consider the main business goal when relevant.
- Do not invent exact prices, sales numbers, profit numbers, or guaranteed results.
`

    const reply = await askOllama([
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userQuestion,
      },
    ])

    res.json({
      reply,
    })
  } catch (error) {
    console.error('BizAI controller error:', error)

    res.status(500).json({
      error: 'BizAI request failed',
    })
  }
}

module.exports = {
  assistantController,
}