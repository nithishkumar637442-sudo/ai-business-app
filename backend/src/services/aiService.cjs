const OLLAMA_URL = 'http://localhost:11434/api/chat'
const MODEL = 'llama3.2:3b'

async function askOllama(messages) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`)
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