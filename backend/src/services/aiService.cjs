const OLLAMA_URL = 'https://ollama.com/api/chat'
const MODEL = 'gpt-oss:20b'

async function askOllama(messages) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ollama API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  return (
    data?.message?.content?.trim() ||
    'Sorry, I could not generate a response.'
  )
}

module.exports = {
  askOllama,
}