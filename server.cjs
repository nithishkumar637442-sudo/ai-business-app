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

    const advisorType =
      business?.advisorType || null

    const questionLower = userQuestion.toLowerCase()

    console.log('BizAI received:', userQuestion)

    console.log('Business profile:', {
      businessName,
      businessType,
      targetCustomers,
      monthlyBudget,
      mainGoal,
      advisorType,
    })

    /*
      BUSINESS QUESTION DETECTION
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
      'promotions',
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
      'marketing plan',
      'marketing strategy',
      'campaign',
    ]

    const isBusinessQuestion =
      businessKeywords.some((keyword) =>
        questionLower.includes(keyword)
      )

    /*
      TASK 45 - MARKETING PLAN DETECTION
    */

    const asksForMarketingPlan =
      questionLower.includes('marketing plan') ||
      questionLower.includes('marketing strategy plan') ||
      questionLower.includes('create a marketing plan') ||
      questionLower.includes('make a marketing plan') ||
      questionLower.includes('generate a marketing plan') ||
      questionLower.includes('marketing campaign plan')

    /*
      BUDGET PLAN DETECTION
    */

    const asksForBudgetPlan =
      questionLower.includes('budget plan') ||
      questionLower.includes('budget breakdown') ||
      questionLower.includes('budget allocation') ||
      questionLower.includes('allocate my budget') ||
      questionLower.includes('allocate the budget') ||
      questionLower.includes('how should i allocate') ||
      questionLower.includes('how should we allocate')

    /*
      TASK 67 - FIVE AREA BUDGET DETECTION

      Detects requests that specifically ask for:
      Marketing
      Customer Offers
      Local Promotion
      Operations
      Testing
    */

    const asksForFiveAreaBudgetPlan =
      asksForBudgetPlan &&
      questionLower.includes('marketing') &&
      questionLower.includes('customer offers') &&
      questionLower.includes('local promotion') &&
      questionLower.includes('operations') &&
      questionLower.includes('testing')

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
        /*
          TASK 67
          Exact ₹20,000 allocation:

          Marketing       ₹6,000
          Customer Offers ₹4,000
          Local Promotion ₹3,500
          Operations      ₹4,500
          Testing         ₹2,000

          Total = ₹20,000
        */

        if (asksForFiveAreaBudgetPlan) {
          const marketing = Math.round(
            budgetNumber * 0.30
          )

          const customerOffers = Math.round(
            budgetNumber * 0.20
          )

          const localPromotion = Math.round(
            budgetNumber * 0.175
          )

          const operations = Math.round(
            budgetNumber * 0.225
          )

          const testing = Math.round(
            budgetNumber * 0.10
          )

          const total =
            marketing +
            customerOffers +
            localPromotion +
            operations +
            testing

          budgetPlan = {
            total,
            marketing,
            customerOffers,
            localPromotion,
            operations,
            testing,
            remaining: 0,
          }
        } else {
          /*
            Existing general budget allocation
          */

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
    }

    /*
      ADVISOR SPECIALIZATION
    */

    let advisorInstruction = ''

    /*
      TASK 41 - SALES ADVISOR
    */

    if (advisorType === 'sales') {
      advisorInstruction = `
You are acting as BizAI Sales Advisor.

Your ONLY focus is improving sales.

Use the business profile to make the advice specific.

Focus on practical areas such as:

- Increasing daily sales
- Increasing repeat customers
- Improving product or service offers
- Creating useful bundles
- Increasing average customer purchases
- Improving conversion from visitors to buyers
- Promoting best-selling products
- Customer retention when it directly supports sales

Important Sales Advisor rules:

- Give exactly 3 practical sales actions.
- Keep each action clear and actionable.
- Consider the target customers.
- Consider the business type.
- Consider the main business goal.
- Consider the monthly budget only when relevant.
- Do not create a separate budget plan unless the user asks for one.
- Do not invent sales numbers.
- Do not invent profit numbers.
- Do not invent savings amounts.
- Do not invent exact prices.
- Do not invent exact discount percentages.
- Do not invent exact advertising costs.
- Do not promise guaranteed results.
- Do not give unrelated cost-saving advice.
- Do not give generic marketing advice unless it directly supports sales.
- Avoid generic recommendations that could apply to every business.
`
    }

    /*
      TASK 42 - MARKETING ADVISOR
    */

    if (advisorType === 'marketing') {
      advisorInstruction = `
You are acting as BizAI Marketing Advisor.

Your ONLY focus is improving marketing.

Use the business profile to make the advice specific.

Focus on practical areas such as:

- Attracting new customers
- Local marketing
- Social media promotion
- Customer awareness
- Promotions and campaigns
- Reaching the target customers
- Online visibility
- Local partnerships
- Customer engagement
- Brand awareness
- Repeat visibility

Important Marketing Advisor rules:

- Give exactly 3 practical marketing actions.
- Make every action specific to the business type.
- Consider the target customers carefully.
- Consider the main business goal.
- Consider the monthly budget when affordability is relevant.
- Prefer low-cost and realistic marketing ideas when the budget is limited.
- Do not invent exact advertising costs.
- Do not invent customer numbers.
- Do not invent sales numbers.
- Do not invent profit numbers.
- Do not invent exact discount percentages.
- Do not invent exact prices.
- Do not invent exact spending amounts.
- Do not promise guaranteed results.
- Do not turn the answer into a sales plan.
- Do not turn the answer into a cost-reduction plan.
- Do not create a separate budget plan unless the user explicitly asks for one.
- Avoid generic advice that could apply to every business.
- Keep each recommendation practical and actionable.
`
    }

    /*
      TASK 43 - COST ADVISOR
    */

    if (advisorType === 'cost') {
      advisorInstruction = `
You are acting as BizAI Cost Advisor.

Your ONLY focus is reducing unnecessary business costs.

Use the business profile to make the advice specific.

Focus on practical areas such as:

- Reducing unnecessary expenses
- Reducing waste
- Improving inventory control
- Comparing supplier costs
- Reducing energy usage
- Improving operational efficiency
- Reviewing recurring expenses
- Avoiding unnecessary spending

Important Cost Advisor rules:

- Give exactly 3 practical cost-reduction actions.
- Consider the business type.
- Consider the target customers when relevant.
- Consider the main business goal.
- Consider the monthly budget when relevant.
- Do not invent exact savings amounts.
- Do not invent profit numbers.
- Do not invent exact prices.
- Do not invent exact spending amounts.
- Do not invent exact discount percentages.
- Do not promise guaranteed savings.
- Do not turn the answer into a marketing plan.
- Do not turn the answer into a sales plan.
- Do not create a separate budget plan unless the user explicitly asks for one.
- Keep each recommendation practical and actionable.
`
    }

    /*
      TASK 45 - MARKETING PLAN GENERATOR
    */

    let marketingPlanInstruction = ''

    if (asksForMarketingPlan) {
      marketingPlanInstruction = `
You are acting as BizAI Marketing Plan Generator.

The user explicitly requested a marketing plan.

Create a practical marketing plan specifically for the
business profile provided below.

Business:
${businessName}

Business Type:
${businessType}

Target Customers:
${targetCustomers}

Monthly Budget:
${monthlyBudget}

Main Business Goal:
${mainGoal}

Marketing plan requirements:

- Give exactly 3 practical marketing actions.
- Each action must be specific to this business.
- Each action should explain what the business should do.
- Consider where the target customers are likely to be reached.
- Consider the business type.
- Consider the main business goal.
- Consider the monthly budget as a constraint.
- Prefer realistic and affordable approaches.
- Prioritize channels that can be tested without large upfront spending.
- Include a simple way to measure whether each action is working.
- Focus on practical execution rather than theory.

VERY IMPORTANT:

- Do NOT invent exact advertising costs.
- Do NOT invent exact campaign costs.
- Do NOT invent exact employee or influencer payments.
- Do NOT invent exact discount percentages.
- Do NOT invent exact sales numbers.
- Do NOT invent customer numbers.
- Do NOT invent profit numbers.
- Do NOT promise guaranteed results.
- Do NOT claim that a specific percentage increase is guaranteed.
- Do NOT assign arbitrary rupee amounts to individual marketing activities.
- Do NOT create a separate Budget Plan.
- Do NOT use made-up numbers just to make the plan look specific.

If the monthly budget is known, say that activities should
remain within the stated budget, but do not invent how much
each activity should cost.

Use this structure:

**Marketing Plan**

1. **Action:** Explain the marketing action.
   **How to execute:** Give practical steps.
   **Measure:** Explain what to track.

2. **Action:** Explain the marketing action.
   **How to execute:** Give practical steps.
   **Measure:** Explain what to track.

3. **Action:** Explain the marketing action.
   **How to execute:** Give practical steps.
   **Measure:** Explain what to track.

Keep the response concise and practical.
`
    }

    /*
      BUDGET INSTRUCTION

      IMPORTANT:
      The backend generates the final Budget Plan.
      Ollama must NOT generate another one.
    */

    let budgetInstruction = ''

    if (asksForBudgetPlan) {
      budgetInstruction = `
The user explicitly requested a budget allocation.

IMPORTANT:
- The backend will append the final Budget Plan automatically.
- Do NOT create a section called "Budget Plan".
- Do NOT create another budget breakdown.
- Do NOT repeat monthly budget allocations.
- Do NOT add a second list of rupee amounts.
- Focus only on explaining the usefulness of the requested allocation categories.
- Do not invent alternative budget amounts.
`
    }

    /*
      GENERAL QUESTION
    */

    let systemPrompt = ''

    if (
      !isBusinessQuestion &&
      advisorType === null &&
      !asksForMarketingPlan
    ) {
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
        BUSINESS / ADVISOR / MARKETING PLAN QUESTION
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

${advisorInstruction}

${marketingPlanInstruction}

${budgetInstruction}

Important general rules:

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
- Do NOT invent exact discounts.
- Do NOT invent exact prices.
- Do NOT invent exact spending amounts.
- Do NOT invent sales numbers.
- Do NOT invent profit numbers.
- Do NOT invent savings amounts.
- Do NOT invent customer numbers.
- Do NOT invent exact advertising costs.
- Do NOT invent influencer fees.
- Do not promise guaranteed results.
- Give exactly the number of recommendations requested.
- If the user asks for 3 recommendations, give 3 recommendations.
- Keep recommendations practical and concise.
- Do not ask unnecessary follow-up questions.

Return only the answer to the user's question.
`
    }

    /*
      SEND REQUEST TO OLLAMA
    */

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
      ADD FINAL BUDGET PLAN ONLY WHEN EXPLICITLY REQUESTED

      This is the ONLY Budget Plan that will be returned.
    */

    if (budgetPlan) {
      const formatMoney = (amount) =>
        `₹${amount.toLocaleString('en-IN')}`

      if (asksForFiveAreaBudgetPlan) {
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
- Operations: ${formatMoney(
          budgetPlan.operations
        )}
- Testing: ${formatMoney(
          budgetPlan.testing
        )}

Total Allocated: ${formatMoney(
          budgetPlan.total
        )}

These are suggested budget allocations for planning purposes, not guaranteed results.
`
      } else {
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