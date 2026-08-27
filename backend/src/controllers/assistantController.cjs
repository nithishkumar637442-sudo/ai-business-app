const { askOllama } = require('../services/aiService.cjs')

function cleanJsonText(text) {
  if (!text) return ''

  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function extractRecommendations(reply) {
  const cleaned = cleanJsonText(reply)

  try {
    const parsed = JSON.parse(cleaned)

    const possibleKeys = [
      'recommendations',
      'salesIdeas',
      'marketingActions',
      'costActions',
      'items',
    ]

    for (const key of possibleKeys) {
      if (Array.isArray(parsed?.[key])) {
        return parsed[key]
          .filter(item => typeof item === 'string')
          .map(item => item.trim())
          .filter(Boolean)
      }
    }
  } catch {
    return []
  }

  return []
}

function containsUnsafeNumbers(text) {
  if (!text) return false

  const patterns = [
    /\b\d+\s*%/i,
    /[$€£]\s*\d+/i,
    /\b\d+\s*(dollars?|euros?|pounds?)\b/i,
    /\b(?:save|savings|profit|revenue)\s+(?:of\s+)?\d+/i,
  ]

  return patterns.some(pattern => pattern.test(text))
}

function containsUnrelatedBusinessExample(text, businessType) {
  if (!text) return false

  const lowerText = text.toLowerCase()
  const type = businessType.toLowerCase()

  const unrelatedExamples = [
    'furniture seller',
    'fitness studio',
    'startup',
    'software company',
    'software business',
    'real estate',
    'insurance company',
    'law firm',
    'gym owner',
    'web developer',
    'clothing store',
    'fashion brand',
  ]

  return unrelatedExamples.some(example => {
    return lowerText.includes(example) && !type.includes(example)
  })
}

function validateRecommendations(items, businessType) {
  if (!Array.isArray(items)) {
    return false
  }

  if (items.length !== 3) {
    return false
  }

  for (const item of items) {
    if (!item || typeof item !== 'string') {
      return false
    }

    if (containsUnsafeNumbers(item)) {
      return false
    }

    if (containsUnrelatedBusinessExample(item, businessType)) {
      return false
    }
  }

  return true
}

function formatRecommendations(items) {
  return items
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n\n')
}

function isMarketingPlanRequest(question) {
  const questionLower = question.toLowerCase()

  return (
    questionLower.includes('marketing plan') ||
    questionLower.includes('marketing strategy plan') ||
    questionLower.includes('create a marketing plan') ||
    questionLower.includes('make a marketing plan') ||
    questionLower.includes('generate a marketing plan') ||
    questionLower.includes('marketing campaign plan')
  )
}

async function generateMarketingPlan({
  userQuestion,
  businessName,
  businessType,
  targetCustomers,
  monthlyBudget,
  mainGoal,
}) {
  const marketingPlanPrompt = `
You are BizAI Marketing Plan Generator.

The user explicitly requested a marketing plan.

BUSINESS PROFILE

Business Name: ${businessName}
Business Type: ${businessType}
Target Customers: ${targetCustomers}
Monthly Budget: ${monthlyBudget}
Main Business Goal: ${mainGoal}

Create a practical marketing plan specifically for THIS business.

MARKETING PLAN REQUIREMENTS:

- Give exactly 3 practical marketing actions.
- Each action must be specific to this business.
- Each action must explain what the business should do.
- Consider where the target customers are likely to be reached.
- Consider the business type.
- Consider the main business goal.
- Consider the monthly budget as a constraint.
- Prefer realistic and affordable approaches.
- Prioritize channels that can be tested without large upfront spending.
- Include a simple way to measure whether each action is working.
- Focus on practical execution rather than theory.

STRICT RULES:

- Do NOT invent exact advertising costs.
- Do NOT invent exact campaign costs.
- Do NOT invent employee payments.
- Do NOT invent influencer payments.
- Do NOT invent exact discount percentages.
- Do NOT invent exact prices.
- Do NOT invent exact sales numbers.
- Do NOT invent customer numbers.
- Do NOT invent profit numbers.
- Do NOT invent savings numbers.
- Do NOT promise guaranteed results.
- Do NOT claim a specific percentage increase.
- Do NOT assign arbitrary rupee amounts to individual activities.
- Do NOT create a separate Budget Plan.
- Do NOT use unrelated business examples.
- Do NOT mention another industry.
- Do NOT create made-up facts.

If the monthly budget is known, treat it only as an overall constraint.
Do not divide or allocate that budget between activities.

OUTPUT:

Return ONLY valid JSON.

Use exactly this format:

{
  "marketingPlan": [
    {
      "action": "short action",
      "howToExecute": "practical execution steps",
      "measure": "simple metric to track"
    },
    {
      "action": "short action",
      "howToExecute": "practical execution steps",
      "measure": "simple metric to track"
    },
    {
      "action": "short action",
      "howToExecute": "practical execution steps",
      "measure": "simple metric to track"
    }
  ]
}

Do NOT return Markdown.
Do NOT return code fences.
Do NOT return explanations outside JSON.

USER QUESTION:

${userQuestion}
`

  const reply = await askOllama([
    {
      role: 'system',
      content: marketingPlanPrompt,
    },
    {
      role: 'user',
      content: userQuestion,
    },
  ])

  return reply
}

function extractMarketingPlan(reply) {
  const cleaned = cleanJsonText(reply)

  try {
    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed?.marketingPlan)) {
      return []
    }

    return parsed.marketingPlan
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        action:
          typeof item.action === 'string'
            ? item.action.trim()
            : '',
        howToExecute:
          typeof item.howToExecute === 'string'
            ? item.howToExecute.trim()
            : '',
        measure:
          typeof item.measure === 'string'
            ? item.measure.trim()
            : '',
      }))
      .filter(item => {
        return (
          item.action &&
          item.howToExecute &&
          item.measure
        )
      })
  } catch {
    return []
  }
}

function validateMarketingPlan(plan, businessType) {
  if (!Array.isArray(plan)) {
    return false
  }

  if (plan.length !== 3) {
    return false
  }

  for (const item of plan) {
    const combinedText =
      `${item.action} ${item.howToExecute} ${item.measure}`

    if (!item.action || !item.howToExecute || !item.measure) {
      return false
    }

    if (containsUnsafeNumbers(combinedText)) {
      return false
    }

    if (containsUnrelatedBusinessExample(
      combinedText,
      businessType
    )) {
      return false
    }
  }

  return true
}

function formatMarketingPlan(plan) {
  return [
    '**Marketing Plan**',
    '',
    `1. **Action:** ${plan[0].action}`,
    `   **How to execute:** ${plan[0].howToExecute}`,
    `   **Measure:** ${plan[0].measure}`,
    '',
    `2. **Action:** ${plan[1].action}`,
    `   **How to execute:** ${plan[1].howToExecute}`,
    `   **Measure:** ${plan[1].measure}`,
    '',
    `3. **Action:** ${plan[2].action}`,
    `   **How to execute:** ${plan[2].howToExecute}`,
    `   **Measure:** ${plan[2].measure}`,
  ].join('\n')
}

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

    const advisorType =
      business?.advisorType || null

    /*
      TASK 45 - MARKETING PLAN GENERATOR
    */

    if (isMarketingPlanRequest(userQuestion)) {
      const marketingReply = await generateMarketingPlan({
        userQuestion,
        businessName,
        businessType,
        targetCustomers,
        monthlyBudget,
        mainGoal,
      })

      let marketingPlan =
        extractMarketingPlan(marketingReply)

      if (!validateMarketingPlan(
        marketingPlan,
        businessType
      )) {
        const retryPrompt = `
Return ONLY valid JSON.

Create exactly 3 marketing plan actions for:

Business Name: ${businessName}
Business Type: ${businessType}
Target Customers: ${targetCustomers}
Monthly Budget: ${monthlyBudget}
Main Goal: ${mainGoal}

Rules:
- Exactly 3 actions.
- Every action must fit this business.
- No unrelated business examples.
- No percentages.
- No currency amounts.
- No exact prices.
- No exact discount percentages.
- No exact advertising costs.
- No savings estimates.
- No sales estimates.
- No customer estimates.
- No guaranteed results.
- Include action, howToExecute, and measure.

Format:

{
  "marketingPlan": [
    {
      "action": "one",
      "howToExecute": "steps",
      "measure": "metric"
    },
    {
      "action": "two",
      "howToExecute": "steps",
      "measure": "metric"
    },
    {
      "action": "three",
      "howToExecute": "steps",
      "measure": "metric"
    }
  ]
}
`

        const retryReply = await askOllama([
          {
            role: 'system',
            content: retryPrompt,
          },
          {
            role: 'user',
            content: userQuestion,
          },
        ])

        marketingPlan =
          extractMarketingPlan(retryReply)
      }

      if (!validateMarketingPlan(
        marketingPlan,
        businessType
      )) {
        return res.status(502).json({
          error:
            'BizAI generated an invalid marketing plan. Please try again.',
        })
      }

      return res.json({
        reply: formatMarketingPlan(marketingPlan),
      })
    }

    /*
      TASK 41 - SALES ADVISOR
    */

    let advisorInstruction = ''

    if (advisorType === 'sales') {
      advisorInstruction = `
ADVISOR: SALES

Give exactly 3 practical sales actions.

Focus ONLY on:
- increasing sales
- increasing repeat purchases
- improving relevant product offers
- increasing customer purchases
- best-selling products
- suitable bundles
- relevant peak-time opportunities

Every idea MUST fit the actual business type and target customers.

Do not discuss marketing strategy as the main recommendation.
Do not discuss cost reduction as the main recommendation.
`
    }

    /*
      TASK 42 - MARKETING ADVISOR
    */

    else if (advisorType === 'marketing') {
      advisorInstruction = `
ADVISOR: MARKETING

Give exactly 3 practical marketing actions.

Focus ONLY on:
- attracting relevant customers
- local visibility
- social media
- customer awareness
- suitable promotions
- local partnerships
- customer engagement

Every idea MUST fit the actual business type and target customers.

Do not turn the answer into a cost-reduction plan.
Do not turn the answer into a sales-management plan.
`
    }

    /*
      TASK 43 - COST ADVISOR
    */

    else if (advisorType === 'cost') {
      advisorInstruction = `
ADVISOR: COST

Give exactly 3 practical cost-reduction actions.

Focus ONLY on:
- reducing waste
- inventory control
- supplier management
- energy efficiency
- recurring expenses
- operational efficiency
- unnecessary spending

Every idea MUST fit the actual business type.

Do not give marketing recommendations.
Do not give sales-growth recommendations.
Do not provide a separate budget plan.
`
    }

    const systemPrompt = `
You are BizAI, a practical AI business advisor.

BUSINESS PROFILE

Business Name: ${businessName}
Business Type: ${businessType}
Target Customers: ${targetCustomers}
Monthly Budget: ${monthlyBudget}
Main Business Goal: ${mainGoal}

${advisorInstruction}

IMPORTANT BUSINESS RULES:

- Answer specifically for THIS business.
- Use the business type.
- Use the target customers.
- Consider the main business goal.
- Do not give advice for another industry.
- Do not mention unrelated businesses.
- Do not create hypothetical examples about another business.
- Do not invent facts about the business.
- Do not invent exact prices.
- Do not invent discount percentages.
- Do not invent advertising costs.
- Do not invent customer numbers.
- Do not invent sales numbers.
- Do not invent profit numbers.
- Do not invent savings amounts.
- Do not promise guaranteed results.
- Do not include percentages.
- Do not include currency amounts.
- Keep each recommendation practical and concise.

OUTPUT FORMAT:

Return ONLY valid JSON.

Use exactly:

{"recommendations":["one","two","three"]}

Do NOT return Markdown.
Do NOT return code fences.
Do NOT return explanations outside JSON.
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

    let recommendations =
      extractRecommendations(reply)

    if (!validateRecommendations(
      recommendations,
      businessType
    )) {
      const retryPrompt = `
Return ONLY valid JSON.

Business:
${businessName}

Business Type:
${businessType}

Target Customers:
${targetCustomers}

Main Goal:
${mainGoal}

Advisor:
${advisorType || 'general'}

User Question:
${userQuestion}

Rules:
- Exactly 3 recommendations.
- Every recommendation must fit this business.
- No unrelated business examples.
- No percentages.
- No currency amounts.
- No exact prices.
- No exact discounts.
- No savings estimates.
- No sales estimates.
- No customer estimates.
- No profit estimates.
- No guaranteed results.

Return exactly:

{"recommendations":["one","two","three"]}
`

      const retryReply = await askOllama([
        {
          role: 'system',
          content: retryPrompt,
        },
        {
          role: 'user',
          content: userQuestion,
        },
      ])

      recommendations =
        extractRecommendations(retryReply)
    }

    if (!validateRecommendations(
      recommendations,
      businessType
    )) {
      return res.status(502).json({
        error:
          'BizAI generated an invalid advisor response. Please try again.',
      })
    }

    res.json({
      reply: formatRecommendations(
        recommendations
      ),
    })
  } catch (error) {
    console.error(
      'BizAI controller error:',
      error
    )

    res.status(500).json({
      error: 'BizAI request failed',
    })
  }
}

module.exports = {
  assistantController,
}