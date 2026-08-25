const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const app = express()

app.use(cors())
app.use(express.json())

const OLLAMA_URL = 'http://localhost:11434/api/chat'
const MODEL = 'llama3.2:3b'

app.get('/', (req, res) => {
  res.json({
    message: 'BizAI backend is running with Ollama',
  })
})

app.post('/api/assistant', async (req, res) => {
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

    const questionLower = userQuestion.toLowerCase()

    console.log('BizAI received:', userQuestion)

    console.log('Business profile:', {
      businessName,
      businessType,
      targetCustomers,
      monthlyBudget,
      mainGoal,
    })

    /*
      Detect whether the question is related to the business.
    */
    const businessKeywords = [
      'business',
      'businesses',
      'cafe',
      'shop',
      'store',
      'sales',
      'customer',
      'customers',
      'marketing',
      'cost',
      'costs',
      'profit',
      'revenue',
      'promotion',
      'advertising',
      'budget',
      'goal',
      'weekday',
      'menu',
      'inventory',
      'supplier',
      'product',
      'products',
      'my cafe',
      'my shop',
      'my store',
      'my business',
    ]

    const isBusinessQuestion =
      businessKeywords.some((keyword) =>
        questionLower.includes(keyword)
      )

    /*
      Only create a separate Budget Plan when the user
      explicitly asks for a budget breakdown or allocation.

      Example:
      "Give me a budget plan"
      "How should I allocate my ₹20,000 budget?"
      
      NOT for:
      "Reduce costs within my ₹20,000 budget."
    */
    const asksForBudgetPlan =
      questionLower.includes('budget plan') ||
      questionLower.includes('budget breakdown') ||
      questionLower.includes('budget allocation') ||
      questionLower.includes('allocate my budget') ||
      questionLower.includes('allocate the budget') ||
      questionLower.includes('how should i allocate') ||
      questionLower.includes('how should we allocate')

    let budgetPlan = null

    if (asksForBudgetPlan) {
      const budgetNumber =
        monthlyBudget !== 'Not provided'
          ? Number(
              monthlyBudget
                .replace(/₹/g, '')
                .replace(/,/g, '')
                .trim()
            )
          : null

      if (
        Number.isFinite(budgetNumber) &&
        budgetNumber > 0
      ) {
        const marketing = Math.round(
          budgetNumber * 0.10
        )

        const customerOffers = Math.round(
          budgetNumber * 0.15
        )

        const localPromotion = Math.round(
          budgetNumber * 0.10
        )

        const testing = Math.round(
          budgetNumber * 0.05
        )

        const remaining =
          budgetNumber -
          marketing -
          customerOffers -
          localPromotion -
          testing

        budgetPlan = {
          total: budgetNumber,
          marketing,
          customerOffers,
          localPromotion,
          testing,
          remaining,
        }
      }
    }

    /*
      GENERAL QUESTION
    */
    let systemPrompt = ''

    if (!isBusinessQuestion) {
      systemPrompt = `
You are BizAI, a helpful AI assistant.

The user asked a general question that is not specifically
about their business.

Answer the user's question directly.

Important:
- Do NOT mention the user's business.
- Do NOT mention the business name.
- Do NOT mention target customers.
- Do NOT mention monthly budget.
- Do NOT mention business goals.
- Do NOT create a business budget plan.
- Do NOT force business context into the answer.
- Give exactly what the user asks for.
- If the user asks for 3 things, give 3 things.
- Keep the response practical and concise.
`
    } else {
      /*
        BUSINESS QUESTION
      */
      systemPrompt = `
You are BizAI, a practical AI business advisor.

Use the following business profile only when it is
relevant to the user's question.

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

Important rules:

- Focus directly on the user's question.
- Use the business profile when it helps answer the question.
- Prioritize the user's latest stated business goal.
- Consider the target customers when relevant.
- Consider the business type when relevant.
- Use the monthly budget as a constraint when the user
  mentions affordability, spending limits, or staying
  within the budget.
- Do NOT automatically create a Budget Plan.
- Only provide a separate Budget Plan if the user explicitly
  asks for a budget plan, budget breakdown, or allocation.
- Do NOT mention marketing, customer offers, testing,
  or other budget categories unless they are relevant
  to the user's question.
- Do NOT invent exact discounts, prices, spending amounts,
  sales numbers, or profit numbers.
- Do NOT invent exact amounts just to make the answer look specific.
- If the user provides an amount, you may use that amount.
- If an example amount is genuinely useful, clearly label it
  as an example rather than presenting it as a recommendation.
- Do not promise guaranteed results.
- Give exactly the number of recommendations requested.
- If the user asks for 3 recommendations, give 3 recommendations.
- Keep recommendations practical and concise.
- Do not ask unnecessary follow-up questions.

Return only the answer to the user's question.
`
    }

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userQuestion,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status}`
      )
    }

    const data = await response.json()

    let reply =
      data?.message?.content?.trim() ||
      'Sorry, I could not generate a response.'

    /*
      Add Budget Plan ONLY when explicitly requested.
    */
    if (budgetPlan) {
      const formatMoney = (amount) =>
        `₹${amount.toLocaleString('en-IN')}`

      reply += `

**Budget Plan**

Monthly Budget: ${formatMoney(
        budgetPlan.total
      )}

- Marketing: ${formatMoney(
        budgetPlan.marketing
      )}
- Customer Offers: ${formatMoney(
        budgetPlan.customerOffers
      )}
- Local Promotion: ${formatMoney(
        budgetPlan.localPromotion
      )}
- Testing: ${formatMoney(
        budgetPlan.testing
      )}
- Remaining Budget: ${formatMoney(
        budgetPlan.remaining
      )}

These are suggested budget allocations for planning purposes, not guaranteed results.
`
    }

    res.json({
      reply,
      budgetPlan,
    })
  } catch (error) {
    console.error('BizAI error:', error)

    res.status(500).json({
      error: 'BizAI request failed',
      details: error.message,
    })
  }
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(
    `BizAI server running on http://localhost:${PORT}`
  )
})