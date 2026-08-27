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
    } else if (advisorType === 'marketing') {
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
    } else if (advisorType === 'cost') {
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
- Do not include dollar, euro, or pound amounts.
- Keep each recommendation practical and concise.

OUTPUT FORMAT:

Return ONLY valid JSON.

The JSON must contain exactly three strings.

For SALES use:
{"recommendations":["recommendation 1","recommendation 2","recommendation 3"]}

For MARKETING use:
{"recommendations":["recommendation 1","recommendation 2","recommendation 3"]}

For COST use:
{"recommendations":["recommendation 1","recommendation 2","recommendation 3"]}

Do NOT return Markdown.
Do NOT return code fences.
Do NOT return explanations outside the JSON.
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

    let recommendations = extractRecommendations(reply)

    /*
      Validate the model response.
      If invalid, retry once with an even stricter instruction.
    */

    if (!validateRecommendations(recommendations, businessType)) {
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

      recommendations = extractRecommendations(retryReply)
    }

    if (!validateRecommendations(recommendations, businessType)) {
      return res.status(502).json({
        error: 'BizAI generated an invalid advisor response. Please try again.',
      })
    }

    res.json({
      reply: formatRecommendations(recommendations),
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