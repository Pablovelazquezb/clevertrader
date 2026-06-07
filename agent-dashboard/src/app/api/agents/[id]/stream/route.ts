import { NextRequest } from 'next/server'

// SSE endpoint — streams agent status updates to the frontend
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'connected', agentId: id })}\n\n`
        )
      )

      // Keep-alive ping every 15s
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'))
      }, 15_000)

      // Simulate a stream of events (replace with real agent hook later)
      let counter = 0
      const simulate = setInterval(() => {
        counter++
        const event = {
          type: 'event',
          agentId: id,
          payload: {
            id: `sse-${Date.now()}`,
            timestamp: Date.now(),
            type: counter % 3 === 0 ? 'log' : 'thinking',
            message: `📡 Evento simulado #${counter} desde el servidor.`,
          },
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        )

        if (counter >= 5) {
          clearInterval(simulate)
          clearInterval(keepAlive)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'done', agentId: id })}\n\n`
            )
          )
          controller.close()
        }
      }, 2000)

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        clearInterval(simulate)
        clearInterval(keepAlive)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
