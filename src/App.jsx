import { useEffect, useState } from 'react'
import './App.css'

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [authMode, setAuthMode] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] =
    useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // =========================
  // MAIN APP STATES
  // =========================

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [advisorType, setAdvisorType] = useState(null)

  // BUSINESS PROFILE
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [targetCustomers, setTargetCustomers] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [mainGoal, setMainGoal] = useState('')

  // TASK 44 - SALES ANALYSIS
  const [totalSales, setTotalSales] = useState('')
  const [customerCount, setCustomerCount] = useState('')
  const [averageOrderValue, setAverageOrderValue] =
    useState('')
  const [salesAnalysis, setSalesAnalysis] = useState('')
  const [salesAnalysisLoading, setSalesAnalysisLoading] =
    useState(false)

  // TASK 51 - BUSINESS METRICS
  const [totalExpenses, setTotalExpenses] = useState('')
  const [metricsSaved, setMetricsSaved] = useState(false)

  // TASK 53 - COMPETITOR ANALYSIS
  const [competitorName, setCompetitorName] = useState('')
  const [competitorStrengths, setCompetitorStrengths] =
    useState('')
  const [competitorWeaknesses, setCompetitorWeaknesses] =
    useState('')
  const [competitorAnalysis, setCompetitorAnalysis] =
    useState('')
  const [
    competitorAnalysisLoading,
    setCompetitorAnalysisLoading,
  ] = useState(false)
  const [competitorSaved, setCompetitorSaved] =
    useState(false)

  // =========================
  // CHECK LOGIN
  // =========================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem('bizaiLoggedIn')

    if (loggedIn === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (!isAuthenticated) return

    // LOAD BUSINESS PROFILE
    const savedProfile = localStorage.getItem(
      'bizaiBusinessProfile'
    )

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)

        setBusinessName(profile.businessName || '')
        setBusinessType(profile.businessType || '')
        setTargetCustomers(
          profile.targetCustomers || ''
        )
        setMonthlyBudget(
          profile.monthlyBudget || ''
        )
        setMainGoal(profile.mainGoal || '')
      } catch (error) {
        console.error(
          'Profile load failed:',
          error
        )
      }
    }

    // LOAD SALES DATA
    const savedSalesData = localStorage.getItem(
      'bizaiSalesData'
    )

    if (savedSalesData) {
      try {
        const salesData =
          JSON.parse(savedSalesData)

        setTotalSales(
          salesData.totalSales || ''
        )
        setCustomerCount(
          salesData.customerCount || ''
        )
        setAverageOrderValue(
          salesData.averageOrderValue || ''
        )
      } catch (error) {
        console.error(
          'Sales data load failed:',
          error
        )
      }
    }

    // LOAD BUSINESS METRICS
    const savedMetrics = localStorage.getItem(
      'bizaiBusinessMetrics'
    )

    if (savedMetrics) {
      try {
        const metrics =
          JSON.parse(savedMetrics)

        setTotalSales(
          metrics.totalSales || ''
        )
        setTotalExpenses(
          metrics.totalExpenses || ''
        )
        setCustomerCount(
          metrics.customerCount || ''
        )
        setAverageOrderValue(
          metrics.averageOrderValue || ''
        )
      } catch (error) {
        console.error(
          'Metrics load failed:',
          error
        )
      }
    }

    // LOAD COMPETITOR DATA
    const savedCompetitorData =
      localStorage.getItem(
        'bizaiCompetitorData'
      )

    if (savedCompetitorData) {
      try {
        const competitorData =
          JSON.parse(savedCompetitorData)

        setCompetitorName(
          competitorData.competitorName || ''
        )

        setCompetitorStrengths(
          competitorData.competitorStrengths || ''
        )

        setCompetitorWeaknesses(
          competitorData.competitorWeaknesses || ''
        )
      } catch (error) {
        console.error(
          'Competitor data load failed:',
          error
        )
      }
    }
  }, [isAuthenticated])

  // =========================
  // SIGN UP
  // =========================

  const handleSignup = (e) => {
    e.preventDefault()

    setAuthError('')
    setAuthSuccess('')

    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      !signupPassword.trim() ||
      !signupConfirmPassword.trim()
    ) {
      setAuthError(
        'Please fill in all fields.'
      )
      return
    }

    if (
      !signupEmail.includes('@') ||
      !signupEmail.includes('.')
    ) {
      setAuthError(
        'Please enter a valid email address.'
      )
      return
    }

    if (signupPassword.length < 6) {
      setAuthError(
        'Password must be at least 6 characters.'
      )
      return
    }

    if (
      signupPassword !==
      signupConfirmPassword
    ) {
      setAuthError(
        'Passwords do not match.'
      )
      return
    }

    const existingUser =
      localStorage.getItem(
        'bizaiUser'
      )

    if (existingUser) {
      try {
        const user = JSON.parse(
          existingUser
        )

        if (
          user.email.toLowerCase() ===
          signupEmail.trim().toLowerCase()
        ) {
          setAuthError(
            'An account with this email already exists.'
          )
          return
        }
      } catch (error) {
        console.error(
          'User data check failed:',
          error
        )
      }
    }

    const user = {
      name: signupName.trim(),
      email: signupEmail
        .trim()
        .toLowerCase(),
      password: signupPassword,
    }

    localStorage.setItem(
      'bizaiUser',
      JSON.stringify(user)
    )

    setAuthSuccess(
      'Account created successfully. Please login.'
    )

    setSignupName('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupConfirmPassword('')

    setTimeout(() => {
      setAuthMode('login')
      setAuthSuccess('')
    }, 1000)
  }

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (e) => {
    e.preventDefault()

    setAuthError('')
    setAuthSuccess('')

    if (
      !loginEmail.trim() ||
      !loginPassword.trim()
    ) {
      setAuthError(
        'Please enter your email and password.'
      )
      return
    }

    const savedUser =
      localStorage.getItem(
        'bizaiUser'
      )

    if (!savedUser) {
      setAuthError(
        'No account found. Please sign up first.'
      )
      return
    }

    try {
      const user = JSON.parse(
        savedUser
      )

      if (
        user.email !==
          loginEmail
            .trim()
            .toLowerCase() ||
        user.password !==
          loginPassword
      ) {
        setAuthError(
          'Invalid email or password.'
        )
        return
      }

      localStorage.setItem(
        'bizaiLoggedIn',
        'true'
      )

      localStorage.setItem(
        'bizaiCurrentUser',
        JSON.stringify({
          name: user.name,
          email: user.email,
        })
      )

      setIsAuthenticated(true)

      setLoginEmail('')
      setLoginPassword('')
      setAuthError('')
    } catch (error) {
      setAuthError(
        'Unable to login. Please try again.'
      )
    }
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem(
      'bizaiLoggedIn'
    )

    localStorage.removeItem(
      'bizaiCurrentUser'
    )

    setIsAuthenticated(false)
    setMessages([])
    setMessage('')
    setAdvisorType(null)
  }

  // =========================
  // SAVE BUSINESS PROFILE
  // =========================

  const saveProfile = () => {
    const profile = {
      businessName,
      businessType,
      targetCustomers,
      monthlyBudget,
      mainGoal,
    }

    localStorage.setItem(
      'bizaiBusinessProfile',
      JSON.stringify(profile)
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  // =========================
  // SAVE SALES DATA
  // =========================

  const saveSalesData = () => {
    const salesData = {
      totalSales,
      customerCount,
      averageOrderValue,
    }

    localStorage.setItem(
      'bizaiSalesData',
      JSON.stringify(salesData)
    )
  }

  // =========================
  // SAVE BUSINESS METRICS
  // =========================

  const saveBusinessMetrics = () => {
    const sales = Number(
      String(totalSales)
        .replace(/,/g, '')
        .replace(/₹/g, '')
        .trim()
    )

    const expenses = Number(
      String(totalExpenses)
        .replace(/,/g, '')
        .replace(/₹/g, '')
        .trim()
    )

    const customers = Number(
      String(customerCount)
        .replace(/,/g, '')
        .trim()
    )

    let calculatedAverage = ''

    if (
      Number.isFinite(sales) &&
      sales > 0 &&
      Number.isFinite(customers) &&
      customers > 0
    ) {
      calculatedAverage = (
        sales / customers
      ).toFixed(2)

      setAverageOrderValue(
        calculatedAverage
      )
    }

    const metrics = {
      totalSales,
      totalExpenses,
      customerCount,
      averageOrderValue:
        calculatedAverage ||
        averageOrderValue,
    }

    localStorage.setItem(
      'bizaiBusinessMetrics',
      JSON.stringify(metrics)
    )

    setMetricsSaved(true)

    setTimeout(() => {
      setMetricsSaved(false)
    }, 2000)
  }

  // =========================
  // SAVE COMPETITOR DATA
  // =========================

  const saveCompetitorData = () => {
    const competitorData = {
      competitorName,
      competitorStrengths,
      competitorWeaknesses,
    }

    localStorage.setItem(
      'bizaiCompetitorData',
      JSON.stringify(
        competitorData
      )
    )

    setCompetitorSaved(true)

    setTimeout(() => {
      setCompetitorSaved(false)
    }, 2000)
  }

  // =========================
  // ASK AI
  // =========================

  const askAI = async () => {
    if (
      !message.trim() ||
      loading
    ) {
      return
    }

    const userMessage =
      message.trim()

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
      },
    ])

    setMessage('')
    setLoading(true)

    const businessContext = {
      businessName,
      businessType,
      targetCustomers,
      monthlyBudget:
        String(monthlyBudget),
      mainGoal,
      advisorType,

      totalSales,
      totalExpenses,
      customerCount,
      averageOrderValue,

      competitorName,
      competitorStrengths,
      competitorWeaknesses,
    }

    try {
      const response = await fetch(
        'https://ai-business-app-o669.onrender.com/api/assistant',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            business:
              businessContext,
          }),
        }
      )

      const data =
        await response.json()

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.reply,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text:
              data.error ||
              'No response received from BizAI.',
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text:
            'Could not connect to the BizAI backend.',
        },
      ])
    }

    setLoading(false)
    setAdvisorType(null)
  }

  // =========================
  // SALES ANALYSIS
  // =========================

  const analyzeSales = async () => {
    if (salesAnalysisLoading)
      return

    if (
      !totalSales ||
      !customerCount
    ) {
      setSalesAnalysis(
        'Please enter Total Sales and Customer Count before analyzing.'
      )
      return
    }

    const sales = Number(
      String(totalSales)
        .replace(/,/g, '')
        .replace(/₹/g, '')
        .trim()
    )

    const customers = Number(
      String(customerCount)
        .replace(/,/g, '')
        .trim()
    )

    if (
      !Number.isFinite(sales) ||
      !Number.isFinite(customers) ||
      sales <= 0 ||
      customers <= 0
    ) {
      setSalesAnalysis(
        'Please enter valid positive numbers for sales and customer count.'
      )
      return
    }

    const calculatedAverage =
      sales / customers

    const formattedAverage =
      calculatedAverage.toLocaleString(
        'en-IN',
        {
          maximumFractionDigits: 2,
        }
      )

    setAverageOrderValue(
      calculatedAverage.toFixed(2)
    )

    saveSalesData()

    setSalesAnalysisLoading(true)
    setSalesAnalysis('')

    const analysisQuestion = `
Analyze my sales performance.

Business Name: ${
      businessName || 'Not provided'
    }
Business Type: ${
      businessType || 'Not provided'
    }
Target Customers: ${
      targetCustomers || 'Not provided'
    }
Main Business Goal: ${
      mainGoal || 'Not provided'
    }

Sales Data:
Total Sales: ₹${sales.toLocaleString(
      'en-IN'
    )}
Customer Count: ${customers.toLocaleString(
      'en-IN'
    )}
Average Order Value: ₹${formattedAverage}

Give exactly 3 practical sales improvement actions.

Keep the answer specific to my business and sales data.
Do not invent sales numbers.
Do not promise guaranteed results.
Focus only on sales performance and improvement.
`

    try {
      const response = await fetch(
        'http://localhost:5000/api/assistant',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            message:
              analysisQuestion,
            business: {
              businessName,
              businessType,
              targetCustomers,
              monthlyBudget:
                String(
                  monthlyBudget
                ),
              mainGoal,
              advisorType:
                'sales',
              totalSales,
              totalExpenses,
              customerCount,
              averageOrderValue,
            },
          }),
        }
      )

      const data =
        await response.json()

      if (data.reply) {
        setSalesAnalysis(
          data.reply
        )
      } else {
        setSalesAnalysis(
          'BizAI could not generate the sales analysis.'
        )
      }
    } catch (error) {
      setSalesAnalysis(
        'Could not connect to the BizAI backend.'
      )
    }

    setSalesAnalysisLoading(false)
  }

  // =========================
  // COMPETITOR ANALYSIS
  // =========================

  const analyzeCompetitor =
    async () => {
      if (
        competitorAnalysisLoading
      ) {
        return
      }

      if (
        !competitorName.trim()
      ) {
        setCompetitorAnalysis(
          'Please enter a competitor name before analyzing.'
        )
        return
      }

      saveCompetitorData()

      setCompetitorAnalysisLoading(
        true
      )

      setCompetitorAnalysis('')

      const competitorQuestion = `
Analyze the competitor for my business.

My Business:
Business Name: ${
        businessName || 'Not provided'
      }
Business Type: ${
        businessType || 'Not provided'
      }
Target Customers: ${
        targetCustomers || 'Not provided'
      }
Main Business Goal: ${
        mainGoal || 'Not provided'
      }
Monthly Budget: ${
        monthlyBudget || 'Not provided'
      }

Competitor:
Competitor Name: ${competitorName}

Known Competitor Strengths:
${
        competitorStrengths ||
        'Not provided'
      }

Known Competitor Weaknesses:
${
        competitorWeaknesses ||
        'Not provided'
      }

Give exactly 3 practical recommendations for my business based on this competitor information.

Focus on:
1. How my business can differentiate itself.
2. How my business can improve its customer value.
3. One practical action I can take against the competitor.

Do not invent competitor statistics, prices, ratings, revenue, customer counts, or market share.
Do not claim facts about the competitor that were not provided.
Do not promise guaranteed results.
Keep the recommendations specific to my business.
`

      try {
        const response =
          await fetch(
            'http://localhost:5000/api/assistant',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify(
                {
                  message:
                    competitorQuestion,
                  business: {
                    businessName,
                    businessType,
                    targetCustomers,
                    monthlyBudget:
                      String(
                        monthlyBudget
                      ),
                    mainGoal,
                    advisorType:
                      'competitor',
                    competitorName,
                    competitorStrengths,
                    competitorWeaknesses,
                  },
                }
              ),
            }
          )

        const data =
          await response.json()

        if (data.reply) {
          setCompetitorAnalysis(
            data.reply
          )
        } else {
          setCompetitorAnalysis(
            'BizAI could not generate the competitor analysis.'
          )
        }
      } catch (error) {
        setCompetitorAnalysis(
          'Could not connect to the BizAI backend.'
        )
      }

      setCompetitorAnalysisLoading(
        false
      )
    }

  // =========================
  // ADVISORS
  // =========================

  const selectAdvisor = (
    type
  ) => {
    if (type === 'sales') {
      setAdvisorType('sales')
      setMessage(
        'How can I increase my sales?'
      )
    }

    if (type === 'marketing') {
      setAdvisorType(
        'marketing'
      )
      setMessage(
        'How can I improve my marketing?'
      )
    }

    if (type === 'cost') {
      setAdvisorType('cost')
      setMessage(
        'How can I reduce my business costs?'
      )
    }
  }

  // =========================
  // RECOMMENDATIONS
  // =========================

  const getRecommendations =
    () => {
      if (
        !businessName ||
        !businessType
      ) {
        return [
          'Complete your Business Profile to get personalized recommendations.',
          'Add your target customers so BizAI can suggest better marketing ideas.',
          'Set your main business goal to receive more relevant advice.',
        ]
      }

      return [
        `Create offers and product bundles for ${
          targetCustomers ||
          'your target customers'
        }.`,
        `Use social media to promote your ${businessType} and attract more local customers.`,
        `Track your spending and keep your marketing activities within your ${
          monthlyBudget ||
          'monthly'
        } budget.`,
      ]
    }

  // =========================
  // AI RESPONSE HELPERS
  // =========================

  const parseBudgetLines = (
    lines
  ) => {
    return lines
      .map((line) =>
        line
          .replace(/^[-*]\s*/, '')
          .replace(/\\-/g, '-')
          .trim()
      )
      .filter(Boolean)
  }

  const renderBoldText = (
    text
  ) => {
    const parts =
      text.split(
        /(\*\*.*?\*\*)/g
      )

    return parts.map(
      (
        part,
        partIndex
      ) => {
        if (
          part.startsWith(
            '**'
          ) &&
          part.endsWith(
            '**'
          )
        ) {
          return (
            <strong
              key={
                partIndex
              }
            >
              {part.slice(
                2,
                -2
              )}
            </strong>
          )
        }

        return part
      }
    )
  }

  const renderAIResponse = (
    text
  ) => {
    const lines =
      text.split('\n')

    const elements = []
    let index = 0

    while (
      index < lines.length
    ) {
      const line =
        lines[index].trim()

      if (!line) {
        index += 1
        continue
      }

      const cleanHeading =
        line
          .replace(
            /\*\*/g,
            ''
          )
          .trim()

      if (
        cleanHeading ===
        'Budget Plan'
      ) {
        const budgetLines =
          []

        index += 1

        while (
          index <
          lines.length
        ) {
          const currentLine =
            lines[
              index
            ].trim()

          if (
            currentLine.startsWith(
              '**'
            ) &&
            currentLine
              .replace(
                /\*\*/g,
                ''
              )
              .trim() !==
              'Budget Plan'
          ) {
            break
          }

          if (currentLine) {
            budgetLines.push(
              currentLine
            )
          }

          index += 1
        }

        elements.push(
          <div
            className="ai-section-card budget-card"
            key={`budget-${index}`}
          >
            <div className="ai-section-title">
              💰 Budget Plan
            </div>

            <div className="budget-list">
              {parseBudgetLines(
                budgetLines
              ).map(
                (
                  budget,
                  budgetIndex
                ) => (
                  <div
                    className="budget-row"
                    key={
                      budgetIndex
                    }
                  >
                    {
                      budget
                    }
                  </div>
                )
              )}
            </div>
          </div>
        )

        continue
      }

      if (
        line.startsWith(
          '**'
        ) &&
        line.endsWith(
          '**'
        )
      ) {
        const sectionTitle =
          line
            .replace(
              /\*\*/g,
              ''
            )
            .trim()

        const sectionLines =
          []

        index += 1

        while (
          index <
          lines.length
        ) {
          const currentLine =
            lines[
              index
            ].trim()

          if (
            currentLine.startsWith(
              '**'
            ) &&
            currentLine.endsWith(
              '**'
            )
          ) {
            break
          }

          if (currentLine) {
            sectionLines.push(
              currentLine
            )
          }

          index += 1
        }

        if (
          sectionTitle ===
          'Recommended Actions'
        ) {
          elements.push(
            <div
              className="ai-section-card actions-card"
              key={`actions-${index}`}
            >
              <div className="ai-section-title">
                🎯 Recommended Actions
              </div>

              <div className="action-list">
                {sectionLines.map(
                  (
                    action,
                    actionIndex
                  ) => {
                    const cleanAction =
                      action
                        .replace(
                          /^\d+\.\s*/,
                          ''
                        )
                        .replace(
                          /\\-/g,
                          '-'
                        )

                    return (
                      <div
                        className="action-item"
                        key={
                          actionIndex
                        }
                      >
                        <div className="action-number">
                          {
                            actionIndex +
                            1
                          }
                        </div>

                        <div className="action-text">
                          {renderBoldText(
                            cleanAction
                          )}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          )
        } else if (
          sectionTitle ===
          'Why This Fits'
        ) {
          elements.push(
            <div
              className="ai-section-card why-card"
              key={`why-${index}`}
            >
              <div className="ai-section-title">
                💡 Why This Fits
              </div>

              <div className="ai-section-content">
                {sectionLines.map(
                  (
                    sectionLine,
                    sectionIndex
                  ) => (
                    <p
                      key={
                        sectionIndex
                      }
                    >
                      {renderBoldText(
                        sectionLine.replace(
                          /\\-/g,
                          '-'
                        )
                      )}
                    </p>
                  )
                )}
              </div>
            </div>
          )
        } else if (
          sectionTitle ===
          'Next Step'
        ) {
          elements.push(
            <div
              className="ai-section-card next-step-card"
              key={`next-${index}`}
            >
              <div className="ai-section-title">
                🚀 Next Step
              </div>

              <div className="ai-section-content">
                {sectionLines.map(
                  (
                    sectionLine,
                    sectionIndex
                  ) => (
                    <p
                      key={
                        sectionIndex
                      }
                    >
                      {renderBoldText(
                        sectionLine.replace(
                          /\\-/g,
                          '-'
                        )
                      )}
                    </p>
                  )
                )}
              </div>
            </div>
          )
        } else if (
          sectionTitle ===
          'Answer'
        ) {
          elements.push(
            <div
              className="ai-direct-answer"
              key={`answer-${index}`}
            >
              <div className="ai-answer-label">
                🤖 BizAI Answer
              </div>

              {sectionLines.map(
                (
                  sectionLine,
                  sectionIndex
                ) => (
                  <p
                    key={
                      sectionIndex
                    }
                  >
                    {renderBoldText(
                      sectionLine.replace(
                        /\\-/g,
                        '-'
                      )
                    )}
                  </p>
                )
              )}
            </div>
          )
        } else {
          elements.push(
            <div
              className="ai-section-card"
              key={`section-${index}`}
            >
              <div className="ai-section-title">
                {
                  sectionTitle
                }
              </div>

              <div className="ai-section-content">
                {sectionLines.map(
                  (
                    sectionLine,
                    sectionIndex
                  ) => (
                    <p
                      key={
                        sectionIndex
                      }
                    >
                      {renderBoldText(
                        sectionLine.replace(
                          /\\-/g,
                          '-'
                        )
                      )}
                    </p>
                  )
                )}
              </div>
            </div>
          )
        }

        continue
      }

      const normalLines =
        []

      while (
        index <
        lines.length
      ) {
        const currentLine =
          lines[
            index
          ].trim()

        if (
          currentLine.startsWith(
            '**'
          ) &&
          currentLine.endsWith(
            '**'
          )
        ) {
          break
        }

        if (currentLine) {
          normalLines.push(
            currentLine
          )
        }

        index += 1
      }

      if (
        normalLines.length >
        0
      ) {
        elements.push(
          <div
            className="ai-direct-answer"
            key={`normal-${index}`}
          >
            <div className="ai-answer-label">
              🤖 BizAI Answer
            </div>

            {normalLines.map(
              (
                normalLine,
                normalIndex
              ) => (
                <p
                  key={
                    normalIndex
                  }
                >
                  {renderBoldText(
                    normalLine.replace(
                      /\\-/g,
                      '-'
                    )
                  )}
                </p>
              )
            )}
          </div>
        )
      }
    }

    return elements
  }

  // =========================
  // COPY RESPONSE
  // =========================

  const copyResponse = async (
    text,
    index
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      )

      setCopiedIndex(
        index
      )

      setTimeout(() => {
        setCopiedIndex(
          null
        )
      }, 1500)
    } catch (error) {
      console.error(
        'Copy failed:',
        error
      )
    }
  }

  // =========================
  // CLEAR CHAT
  // =========================

  const clearChat = () => {
    setMessages([])
    setCopiedIndex(null)
    setAdvisorType(null)
  }

  // =========================
  // CALCULATED METRICS
  // =========================

  const salesNumber = Number(
    String(totalSales)
      .replace(/,/g, '')
      .replace(/₹/g, '')
      .trim()
  )

  const expenseNumber = Number(
    String(totalExpenses)
      .replace(/,/g, '')
      .replace(/₹/g, '')
      .trim()
  )

  const customerNumber = Number(
    String(customerCount)
      .replace(/,/g, '')
      .trim()
  )

  const calculatedProfit =
    Number.isFinite(
      salesNumber
    ) &&
    Number.isFinite(
      expenseNumber
    )
      ? salesNumber -
        expenseNumber
      : null

  const calculatedAOV =
    Number.isFinite(
      salesNumber
    ) &&
    Number.isFinite(
      customerNumber
    ) &&
    customerNumber > 0
      ? salesNumber /
        customerNumber
      : null

  const recommendations =
    getRecommendations()

  // =====================================================
  // AUTH SCREEN
  // =====================================================

  if (!isAuthenticated) {
    return (
      <div className="app">

        <nav className="navbar">
          <div className="logo">
            Biz<span>AI</span>
          </div>

          <div className="nav-user">
            AI Business Assistant
          </div>
        </nav>

        <main
          className="dashboard"
          style={{
            maxWidth: '520px',
          }}
        >

          <section
            className="business-profile"
            style={{
              marginTop: '70px',
            }}
          >

            <div
              style={{
                textAlign: 'center',
                marginBottom: '25px',
              }}
            >
              <div
                style={{
                  fontSize: '42px',
                  marginBottom: '10px',
                }}
              >
                🤖
              </div>

              <h1
                style={{
                  margin: '0 0 8px',
                  fontSize: '28px',
                  color: '#172033',
                }}
              >
                Welcome to BizAI
              </h1>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  fontSize: '14px',
                }}
              >
                Your AI-powered business
                assistant
              </p>
            </div>

            {authMode ===
            'login' ? (
              <>
                <h2
                  style={{
                    marginBottom:
                      '18px',
                  }}
                >
                  🔐 Login
                </h2>

                <form
                  onSubmit={
                    handleLogin
                  }
                >

                  <div
                    style={{
                      display:
                        'grid',
                      gap: '14px',
                    }}
                  >

                    <input
                      type="email"
                      placeholder="Email"
                      value={
                        loginEmail
                      }
                      onChange={(
                        e
                      ) =>
                        setLoginEmail(
                          e.target
                            .value
                        )
                      }
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={
                        loginPassword
                      }
                      onChange={(
                        e
                      ) =>
                        setLoginPassword(
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                  {authError && (
                    <p
                      style={{
                        margin:
                          '14px 0 0',
                        color:
                          '#dc2626',
                        fontSize:
                          '13px',
                      }}
                    >
                      ⚠️{' '}
                      {
                        authError
                      }
                    </p>
                  )}

                  <button
                    type="submit"
                    style={{
                      width:
                        '100%',
                      marginTop:
                        '18px',
                    }}
                  >
                    Login
                  </button>

                </form>

                <p
                  style={{
                    textAlign:
                      'center',
                    margin:
                      '20px 0 0',
                    color:
                      '#667085',
                    fontSize:
                      '14px',
                  }}
                >
                  Don't have an
                  account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        'signup'
                      )
                      setAuthError(
                        ''
                      )
                      setAuthSuccess(
                        ''
                      )
                    }}
                    style={{
                      background:
                        'none',
                      color:
                        '#2563eb',
                      padding:
                        0,
                      fontSize:
                        '14px',
                      fontWeight:
                        700,
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2
                  style={{
                    marginBottom:
                      '18px',
                  }}
                >
                  📝 Create Account
                </h2>

                <form
                  onSubmit={
                    handleSignup
                  }
                >

                  <div
                    style={{
                      display:
                        'grid',
                      gap: '14px',
                    }}
                  >

                    <input
                      type="text"
                      placeholder="Full Name"
                      value={
                        signupName
                      }
                      onChange={(
                        e
                      ) =>
                        setSignupName(
                          e.target
                            .value
                        )
                      }
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={
                        signupEmail
                      }
                      onChange={(
                        e
                      ) =>
                        setSignupEmail(
                          e.target
                            .value
                        )
                      }
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={
                        signupPassword
                      }
                      onChange={(
                        e
                      ) =>
                        setSignupPassword(
                          e.target
                            .value
                        )
                      }
                    />

                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={
                        signupConfirmPassword
                      }
                      onChange={(
                        e
                      ) =>
                        setSignupConfirmPassword(
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                  {authError && (
                    <p
                      style={{
                        margin:
                          '14px 0 0',
                        color:
                          '#dc2626',
                        fontSize:
                          '13px',
                      }}
                    >
                      ⚠️{' '}
                      {
                        authError
                      }
                    </p>
                  )}

                  {authSuccess && (
                    <p
                      style={{
                        margin:
                          '14px 0 0',
                        color:
                          '#16a34a',
                        fontSize:
                          '13px',
                      }}
                    >
                      ✅{' '}
                      {
                        authSuccess
                      }
                    </p>
                  )}

                  <button
                    type="submit"
                    style={{
                      width:
                        '100%',
                      marginTop:
                        '18px',
                    }}
                  >
                    Create Account
                  </button>

                </form>

                <p
                  style={{
                    textAlign:
                      'center',
                    margin:
                      '20px 0 0',
                    color:
                      '#667085',
                    fontSize:
                      '14px',
                  }}
                >
                  Already have an
                  account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        'login'
                      )
                      setAuthError(
                        ''
                      )
                      setAuthSuccess(
                        ''
                      )
                    }}
                    style={{
                      background:
                        'none',
                      color:
                        '#2563eb',
                      padding:
                        0,
                      fontSize:
                        '14px',
                      fontWeight:
                        700,
                    }}
                  >
                    Login
                  </button>
                </p>
              </>
            )}

          </section>

        </main>
      </div>
    )
  }

  // =====================================================
  // MAIN BIZAI DASHBOARD
  // =====================================================

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          Biz<span>AI</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >

          <div className="nav-user">
            Business Dashboard
          </div>

          <button
            onClick={
              handleLogout
            }
            style={{
              background:
                '#ffffff',
              color:
                '#475467',
              border:
                '1px solid #d9dee8',
              padding:
                '9px 14px',
            }}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard">

        {/* WELCOME */}

        <div className="welcome">

          <h1>
            Welcome to{' '}
            {businessName ||
              'BizAI'}{' '}
            👋
          </h1>

          <p>
            Your AI-powered
            business assistant.
          </p>

        </div>

        {/* BUSINESS PROFILE */}

        <section className="business-profile">

          <h2>
            🏢 Business Profile
          </h2>

          <div className="profile-grid">

            <input
              type="text"
              placeholder="Business Name"
              value={
                businessName
              }
              onChange={(e) =>
                setBusinessName(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Business Type"
              value={
                businessType
              }
              onChange={(e) =>
                setBusinessType(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Target Customers"
              value={
                targetCustomers
              }
              onChange={(e) =>
                setTargetCustomers(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Monthly Budget"
              value={
                monthlyBudget
              }
              onChange={(e) =>
                setMonthlyBudget(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Main Business Goal"
              value={
                mainGoal
              }
              onChange={(e) =>
                setMainGoal(
                  e.target.value
                )
              }
            />

          </div>

          <button
            className="save-profile"
            onClick={
              saveProfile
            }
          >
            {saved
              ? '✓ Profile Saved'
              : 'Save Business Profile'}
          </button>

        </section>

        {/* BUSINESS OVERVIEW */}

        <section className="overview">

          <h2>
            📊 Business Overview
          </h2>

          <div className="overview-grid">

            <div className="overview-card">

              <span>🏢</span>

              <div>

                <small>
                  Business
                </small>

                <h3>
                  {businessName ||
                    'Not set'}
                </h3>

              </div>

            </div>

            <div className="overview-card">

              <span>🎯</span>

              <div>

                <small>
                  Main Goal
                </small>

                <h3>
                  {mainGoal ||
                    'Not set'}
                </h3>

              </div>

            </div>

            <div className="overview-card">

              <span>💰</span>

              <div>

                <small>
                  Monthly Budget
                </small>

                <h3>
                  {monthlyBudget
                    ? `₹${Number(
                        String(
                          monthlyBudget
                        )
                          .replace(
                            /₹/g,
                            ''
                          )
                          .replace(
                            /,/g,
                            ''
                          )
                      ).toLocaleString(
                        'en-IN'
                      )}`
                    : 'Not set'}
                </h3>

              </div>

            </div>

            <div className="overview-card">

              <span>👥</span>

              <div>

                <small>
                  Target Customers
                </small>

                <h3>
                  {targetCustomers ||
                    'Not set'}
                </h3>

              </div>

            </div>

          </div>

        </section>

        {/* BUSINESS METRICS */}

        <section className="business-profile">

          <h2>
            📊 Business Metrics
          </h2>

          <p className="recommendation-intro">
            Enter your current
            business numbers.
            BizAI will save them
            and calculate key
            metrics.
          </p>

          <div className="profile-grid">

            <input
              type="text"
              inputMode="decimal"
              placeholder="Total Sales (e.g. 50000)"
              value={
                totalSales
              }
              onChange={(e) =>
                setTotalSales(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              inputMode="decimal"
              placeholder="Total Expenses (e.g. 20000)"
              value={
                totalExpenses
              }
              onChange={(e) =>
                setTotalExpenses(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Customer Count (e.g. 500)"
              value={
                customerCount
              }
              onChange={(e) =>
                setCustomerCount(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Average Order Value"
              value={
                calculatedAOV !==
                null
                  ? `₹${calculatedAOV.toLocaleString(
                      'en-IN',
                      {
                        maximumFractionDigits: 2,
                      }
                    )}`
                  : ''
              }
              readOnly
            />

            <input
              type="text"
              placeholder="Profit"
              value={
                calculatedProfit !==
                null
                  ? `₹${calculatedProfit.toLocaleString(
                      'en-IN'
                    )}`
                  : ''
              }
              readOnly
            />

          </div>

          <button
            className="save-profile"
            onClick={
              saveBusinessMetrics
            }
          >
            {metricsSaved
              ? '✓ Metrics Saved'
              : 'Save Business Metrics'}
          </button>

        </section>

        {/* SALES ANALYSIS */}

        <section className="business-profile">

          <h2>
            📈 Sales Analysis
          </h2>

          <p className="recommendation-intro">
            Analyze your sales
            performance using
            your business
            metrics.
          </p>

          <button
            className="save-profile"
            onClick={
              analyzeSales
            }
            disabled={
              salesAnalysisLoading
            }
          >
            {salesAnalysisLoading
              ? 'Analyzing Sales...'
              : 'Analyze Sales'}
          </button>

          {salesAnalysis && (
            <div className="ai-section-card actions-card">

              <div className="ai-section-title">
                📈 BizAI Sales
                Analysis
              </div>

              <div className="ai-section-content">
                {renderAIResponse(
                  salesAnalysis
                )}
              </div>

            </div>
          )}

        </section>

        {/* COMPETITOR ANALYSIS */}

        <section className="business-profile">

          <h2>
            🏆 Competitor Analysis
          </h2>

          <p className="recommendation-intro">
            Enter competitor
            information and let
            BizAI suggest
            practical ways to
            differentiate your
            business.
          </p>

          <div className="profile-grid">

            <input
              type="text"
              placeholder="Competitor Name"
              value={
                competitorName
              }
              onChange={(e) =>
                setCompetitorName(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Competitor Strengths"
              value={
                competitorStrengths
              }
              onChange={(e) =>
                setCompetitorStrengths(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Competitor Weaknesses"
              value={
                competitorWeaknesses
              }
              onChange={(e) =>
                setCompetitorWeaknesses(
                  e.target.value
                )
              }
            />

          </div>

          <button
            className="save-profile"
            onClick={
              analyzeCompetitor
            }
            disabled={
              competitorAnalysisLoading
            }
          >
            {competitorAnalysisLoading
              ? 'Analyzing Competitor...'
              : competitorSaved
                ? '✓ Competitor Data Saved'
                : 'Analyze Competitor'}
          </button>

          {competitorAnalysis && (
            <div className="ai-section-card actions-card">

              <div className="ai-section-title">
                🏆 BizAI Competitor
                Analysis
              </div>

              <div className="ai-section-content">
                {renderAIResponse(
                  competitorAnalysis
                )}
              </div>

            </div>
          )}

        </section>

        {/* AI RECOMMENDATIONS */}

        <section className="recommendations">

          <h2>
            🤖 AI Recommendations
          </h2>

          <p className="recommendation-intro">
            Personalized
            suggestions based on
            your business
            profile.
          </p>

          <div className="recommendation-list">

            {recommendations.map(
              (
                recommendation,
                index
              ) => (
                <div
                  className="recommendation-card"
                  key={index}
                >

                  <div className="recommendation-number">
                    {index + 1}
                  </div>

                  <p>
                    {
                      recommendation
                    }
                  </p>

                </div>
              )
            )}

          </div>

        </section>

        {/* BUSINESS INSIGHTS */}

        <section className="insights">

          <h2>
            💡 Business Insights
          </h2>

          <div className="insight-grid">

            <div className="insight-card">

              <span>📈</span>

              <h3>
                Sales Opportunity
              </h3>

              <p>
                Focus on your
                best-selling
                products and
                repeat customers.
              </p>

            </div>

            <div className="insight-card">

              <span>📣</span>

              <h3>
                Marketing
                Opportunity
              </h3>

              <p>
                Use engaging
                content and
                social media to
                reach more
                customers.
              </p>

            </div>

            <div className="insight-card">

              <span>💰</span>

              <h3>
                Cost Opportunity
              </h3>

              <p>
                Review recurring
                expenses and
                compare supplier
                prices.
              </p>

            </div>

          </div>

        </section>

        {/* ADVISORS */}

        <section className="advisor-section">

          <h2>
            Choose an Advisor
          </h2>

          <div className="advisor-buttons">

            <button
              onClick={() =>
                selectAdvisor(
                  'sales'
                )
              }
            >
              📈 Sales Advisor
            </button>

            <button
              onClick={() =>
                selectAdvisor(
                  'marketing'
                )
              }
            >
              📣 Marketing Advisor
            </button>

            <button
              onClick={() =>
                selectAdvisor(
                  'cost'
                )
              }
            >
              💰 Cost Advisor
            </button>

          </div>

        </section>

        {/* AI ASSISTANT */}

        <section className="assistant">

          <div className="assistant-header">

            <div>

              <h2>
                🤖 AI Business
                Assistant
              </h2>

              <p>
                Ask BizAI anything
                about your
                business.
              </p>

            </div>

            {messages.length >
              0 && (
              <button
                className="clear-chat"
                onClick={
                  clearChat
                }
              >
                Clear Chat
              </button>
            )}

          </div>

          <textarea
            placeholder="Ask something about your business..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                  'Enter' &&
                !e.shiftKey
              ) {
                e.preventDefault()
                askAI()
              }
            }}
          />

          <div className="assistant-actions">

            <button
              className="ask-button"
              onClick={askAI}
              disabled={loading}
            >
              {loading
                ? 'Thinking...'
                : 'Ask BizAI'}
            </button>

            <span className="enter-hint">
              Enter to send •
              Shift + Enter for
              new line
            </span>

          </div>

          {loading && (
            <div className="thinking">

              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>

              <span>
                BizAI is thinking...
              </span>

            </div>
          )}

          {messages.length >
            0 && (
            <div className="chat-history">

              {messages.map(
                (
                  item,
                  index
                ) => (

                  <div
                    className={
                      item.role ===
                      'user'
                        ? 'user-message'
                        : 'ai-message'
                    }
                    key={index}
                  >

                    <div className="message-top">

                      <strong>
                        {item.role ===
                        'user'
                          ? 'You'
                          : 'BizAI'}
                      </strong>

                      {item.role ===
                        'ai' && (
                        <button
                          className="copy-button"
                          onClick={() =>
                            copyResponse(
                              item.text,
                              index
                            )
                          }
                        >
                          {copiedIndex ===
                          index
                            ? '✓ Copied'
                            : 'Copy'}
                        </button>
                      )}

                    </div>

                    {item.role ===
                    'ai' ? (
                      <div className="ai-response">
                        {renderAIResponse(
                          item.text
                        )}
                      </div>
                    ) : (
                      <p>
                        {item.text}
                      </p>
                    )}

                  </div>

                )
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  )
}

export default App
