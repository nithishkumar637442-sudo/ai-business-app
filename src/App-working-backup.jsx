import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

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
    if (!message.trim()) return

    const userMessage = message

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
      `Create offers and product bundles for ${targetCustomers || 'your target customers'}.`,
      `Use social media to promote your ${businessType} and attract more local customers.`,
      `Track your spending and keep your marketing activities within your ${monthlyBudget || 'monthly budget'}.`,
    ]
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
                  {monthlyBudget || 'Not set'}
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
            Personalized suggestions based on your business profile.
          </p>

          <div className="recommendation-list">

            {recommendations.map((recommendation, index) => (
              <div
                className="recommendation-card"
                key={index}
              >
                <div className="recommendation-number">
                  {index + 1}
                </div>

                <p>{recommendation}</p>
              </div>
            ))}

          </div>
        </section>

        {/* BUSINESS INSIGHTS */}

        <section className="insights">
          <h2>💡 Business Insights</h2>

          <div className="insight-grid">

            <div className="insight-card">
              <span>📈</span>

              <h3>Sales Opportunity</h3>

              <p>
                Focus on your best-selling products
                and repeat customers.
              </p>
            </div>

            <div className="insight-card">
              <span>📣</span>

              <h3>Marketing Opportunity</h3>

              <p>
                Use engaging content and social media
                to reach more customers.
              </p>
            </div>

            <div className="insight-card">
              <span>💰</span>

              <h3>Cost Opportunity</h3>

              <p>
                Review recurring expenses and
                compare supplier prices.
              </p>
            </div>

          </div>
        </section>

        {/* ADVISORS */}

        <section className="advisor-section">
          <h2>Choose an Advisor</h2>

          <div className="advisor-buttons">

            <button
              onClick={() => selectAdvisor('sales')}
            >
              📈 Sales Advisor
            </button>

            <button
              onClick={() => selectAdvisor('marketing')}
            >
              📣 Marketing Advisor
            </button>

            <button
              onClick={() => selectAdvisor('cost')}
            >
              💰 Cost Advisor
            </button>

          </div>
        </section>

        {/* AI ASSISTANT */}

        <section className="assistant">
          <h2>🤖 AI Business Assistant</h2>

          <textarea
            placeholder="Ask something about your business..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />

          <button
            onClick={askAI}
            disabled={loading}
          >
            {loading
              ? 'Thinking...'
              : 'Ask BizAI'}
          </button>

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

                  <strong>
                    {item.role === 'user'
                      ? 'You:'
                      : 'BizAI:'}
                  </strong>

                  <p>{item.text}</p>

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