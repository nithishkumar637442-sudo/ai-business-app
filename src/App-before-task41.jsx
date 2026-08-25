import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [targetCustomers, setTargetCustomers] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [mainGoal, setMainGoal] = useState('')

  useEffect(() => {
    const savedProfile = localStorage.getItem('bizaiBusinessProfile')

    if (savedProfile) {
      const profile = JSON.parse(savedProfile)

      setBusinessName(profile.businessName || '')
      setBusinessType(profile.businessType || '')
      setTargetCustomers(profile.targetCustomers || '')
      setMonthlyBudget(profile.monthlyBudget || '')
      setMainGoal(profile.mainGoal || '')
    }
  }, [])

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

  const askAI = async () => {
    if (!message.trim() || loading) return

    const userMessage = message.trim()

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
      monthlyBudget,
      mainGoal,
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/assistant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            business: businessContext,
          }),
        }
      )

      const data = await response.json()

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
            text: 'No response received from BizAI.',
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Could not connect to the BizAI backend.',
        },
      ])
    }

    setLoading(false)
  }

  const selectAdvisor = (type) => {
    if (type === 'sales') {
      setMessage('How can I increase my sales?')
    }

    if (type === 'marketing') {
      setMessage('How can I improve my marketing?')
    }

    if (type === 'cost') {
      setMessage('How can I reduce my business costs?')
    }
  }

  const getRecommendations = () => {
    if (!businessName || !businessType) {
      return [
        'Complete your Business Profile to get personalized recommendations.',
        'Add your target customers so BizAI can suggest better marketing ideas.',
        'Set your main business goal to receive more relevant advice.',
      ]
    }

    return [
      `Create offers and product bundles for ${
        targetCustomers || 'your target customers'
      }.`,
      `Use social media to promote your ${businessType} and attract more local customers.`,
      `Track your spending and keep your marketing activities within your ${
        monthlyBudget || 'monthly'
      } budget.`,
    ]
  }

  const parseBudgetLines = (lines) => {
    return lines
      .map((line) =>
        line
          .replace(/^[-*]\s*/, '')
          .replace(/\\-/g, '-')
          .trim()
      )
      .filter(Boolean)
  }

  const renderAIResponse = (text) => {
    const lines = text.split('\n')
    const elements = []
    let index = 0

    while (index < lines.length) {
      const line = lines[index].trim()

      if (!line) {
        index += 1
        continue
      }

      const cleanHeading = line.replace(/\*\*/g, '').trim()

      if (
        cleanHeading === 'Budget Plan'
      ) {
        const budgetLines = []
        index += 1

        while (index < lines.length) {
          const currentLine = lines[index].trim()

          if (
            currentLine.startsWith('**') &&
            currentLine.replace(/\*\*/g, '').trim() !==
              'Budget Plan'
          ) {
            break
          }

          if (currentLine) {
            budgetLines.push(currentLine)
          }

          index += 1
        }

        const cleanBudgetLines =
          parseBudgetLines(budgetLines)

        elements.push(
          <div
            className="ai-section-card budget-card"
            key={`budget-${index}`}
          >
            <div className="ai-section-title">
              💰 Budget Plan
            </div>

            <div className="budget-list">
              {cleanBudgetLines.map(
                (budget, budgetIndex) => (
                  <div
                    className="budget-row"
                    key={budgetIndex}
                  >
                    {budget}
                  </div>
                )
              )}
            </div>
          </div>
        )

        continue
      }

      if (
        line.startsWith('**') &&
        line.endsWith('**')
      ) {
        const sectionTitle =
          line.replace(/\*\*/g, '').trim()

        const sectionLines = []
        index += 1

        while (index < lines.length) {
          const currentLine = lines[index].trim()

          if (
            currentLine.startsWith('**') &&
            currentLine.endsWith('**')
          ) {
            break
          }

          if (currentLine) {
            sectionLines.push(currentLine)
          }

          index += 1
        }

        if (sectionTitle === 'Recommended Actions') {
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
                  (action, actionIndex) => {
                    const cleanAction =
                      action
                        .replace(/^\d+\.\s*/, '')
                        .replace(/\\-/g, '-')

                    return (
                      <div
                        className="action-item"
                        key={actionIndex}
                      >
                        <div className="action-number">
                          {actionIndex + 1}
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
          sectionTitle === 'Why This Fits'
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
                  (sectionLine, sectionIndex) => (
                    <p key={sectionIndex}>
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
          sectionTitle === 'Next Step'
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
                  (sectionLine, sectionIndex) => (
                    <p key={sectionIndex}>
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
          sectionTitle === 'Answer'
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
                (sectionLine, sectionIndex) => (
                  <p key={sectionIndex}>
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
                {sectionTitle}
              </div>

              <div className="ai-section-content">
                {sectionLines.map(
                  (sectionLine, sectionIndex) => (
                    <p key={sectionIndex}>
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

      const normalLines = []

      while (index < lines.length) {
        const currentLine = lines[index].trim()

        if (
          currentLine.startsWith('**') &&
          currentLine.endsWith('**')
        ) {
          break
        }

        if (currentLine) {
          normalLines.push(currentLine)
        }

        index += 1
      }

      if (normalLines.length > 0) {
        elements.push(
          <div
            className="ai-direct-answer"
            key={`normal-${index}`}
          >
            <div className="ai-answer-label">
              🤖 BizAI Answer
            </div>

            {normalLines.map(
              (normalLine, normalIndex) => (
                <p key={normalIndex}>
                  {renderBoldText(
                    normalLine.replace(/\\-/g, '-')
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

  const renderBoldText = (text) => {
    const parts = text.split(
      /(\*\*.*?\*\*)/g
    )

    return parts.map((part, partIndex) => {
      if (
        part.startsWith('**') &&
        part.endsWith('**')
      ) {
        return (
          <strong key={partIndex}>
            {part.slice(2, -2)}
          </strong>
        )
      }

      return part
    })
  }

  const copyResponse = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)

      setCopiedIndex(index)

      setTimeout(() => {
        setCopiedIndex(null)
      }, 1500)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const clearChat = () => {
    setMessages([])
    setCopiedIndex(null)
  }

  const recommendations = getRecommendations()

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          Biz<span>AI</span>
        </div>

        <div className="nav-user">
          Business Dashboard
        </div>
      </nav>

      <main className="dashboard">
        <div className="welcome">
          <h1>
            Welcome to {businessName || 'BizAI'} 👋
          </h1>

          <p>
            Your AI-powered business assistant.
          </p>
        </div>

        {/* BUSINESS PROFILE */}

        <section className="business-profile">
          <h2>🏢 Business Profile</h2>

          <div className="profile-grid">
            <input
              type="text"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Business Type"
              value={businessType}
              onChange={(e) =>
                setBusinessType(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Target Customers"
              value={targetCustomers}
              onChange={(e) =>
                setTargetCustomers(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Monthly Budget"
              value={monthlyBudget}
              onChange={(e) =>
                setMonthlyBudget(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Main Business Goal"
              value={mainGoal}
              onChange={(e) =>
                setMainGoal(e.target.value)
              }
            />
          </div>

          <button
            className="save-profile"
            onClick={saveProfile}
          >
            {saved
              ? '✓ Profile Saved'
              : 'Save Business Profile'}
          </button>
        </section>

        {/* BUSINESS OVERVIEW */}

        <section className="overview">
          <h2>📊 Business Overview</h2>

          <div className="overview-grid">
            <div className="overview-card">
              <span>🏢</span>

              <div>
                <small>Business</small>

                <h3>
                  {businessName || 'Not set'}
                </h3>
              </div>
            </div>

            <div className="overview-card">
              <span>🎯</span>

              <div>
                <small>Main Goal</small>

                <h3>
                  {mainGoal || 'Not set'}
                </h3>
              </div>
            </div>

            <div className="overview-card">
              <span>💰</span>

              <div>
                <small>Monthly Budget</small>

                <h3>
                  {monthlyBudget
                    ? `₹${Number(
                        monthlyBudget
                          .replace(/₹/g, '')
                          .replace(/,/g, '')
                      ).toLocaleString('en-IN')}`
                    : 'Not set'}
                </h3>
              </div>
            </div>

            <div className="overview-card">
              <span>👥</span>

              <div>
                <small>Target Customers</small>

                <h3>
                  {targetCustomers || 'Not set'}
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* AI RECOMMENDATIONS */}

        <section className="recommendations">
          <h2>🤖 AI Recommendations</h2>

          <p className="recommendation-intro">
            Personalized suggestions based on your
            business profile.
          </p>

          <div className="recommendation-list">
            {recommendations.map(
              (recommendation, index) => (
                <div
                  className="recommendation-card"
                  key={index}
                >
                  <div className="recommendation-number">
                    {index + 1}
                  </div>

                  <p>{recommendation}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* BUSINESS INSIGHTS */}

        <section className="insights">
          <h2>💡 Business Insights</h2>

          <div className="insight-grid">
            <div className="insight-card">
              <span>📈</span>

              <h3>
                Sales Opportunity
              </h3>

              <p>
                Focus on your best-selling products
                and repeat customers.
              </p>
            </div>

            <div className="insight-card">
              <span>📣</span>

              <h3>
                Marketing Opportunity
              </h3>

              <p>
                Use engaging content and social media
                to reach more customers.
              </p>
            </div>

            <div className="insight-card">
              <span>💰</span>

              <h3>
                Cost Opportunity
              </h3>

              <p>
                Review recurring expenses and compare
                supplier prices.
              </p>
            </div>
          </div>
        </section>

        {/* ADVISORS */}

        <section className="advisor-section">
          <h2>Choose an Advisor</h2>

          <div className="advisor-buttons">
            <button
              onClick={() =>
                selectAdvisor('sales')
              }
            >
              📈 Sales Advisor
            </button>

            <button
              onClick={() =>
                selectAdvisor('marketing')
              }
            >
              📣 Marketing Advisor
            </button>

            <button
              onClick={() =>
                selectAdvisor('cost')
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
                🤖 AI Business Assistant
              </h2>

              <p>
                Ask BizAI anything about your
                business.
              </p>
            </div>

            {messages.length > 0 && (
              <button
                className="clear-chat"
                onClick={clearChat}
              >
                Clear Chat
              </button>
            )}
          </div>

          <textarea
            placeholder="Ask something about your business..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
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
              Enter to send • Shift + Enter for new line
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

          {messages.length > 0 && (
            <div className="chat-history">
              {messages.map((item, index) => (
                <div
                  className={
                    item.role === 'user'
                      ? 'user-message'
                      : 'ai-message'
                  }
                  key={index}
                >
                  <div className="message-top">
                    <strong>
                      {item.role === 'user'
                        ? 'You'
                        : 'BizAI'}
                    </strong>

                    {item.role === 'ai' && (
                      <button
                        className="copy-button"
                        onClick={() =>
                          copyResponse(
                            item.text,
                            index
                          )
                        }
                      >
                        {copiedIndex === index
                          ? '✓ Copied'
                          : 'Copy'}
                      </button>
                    )}
                  </div>

                  {item.role === 'ai' ? (
                    <div className="ai-response">
                      {renderAIResponse(item.text)}
                    </div>
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App