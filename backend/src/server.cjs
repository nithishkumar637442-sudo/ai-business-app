const express = require('express')
const cors = require('cors')

const assistantRoutes = require('./routes/assistantRoutes.cjs')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', assistantRoutes)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BizAI backend',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(
    `BizAI production backend running on port ${PORT}`
  )
})