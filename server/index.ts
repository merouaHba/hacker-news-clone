import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ErrorResponse } from '@/shared/types'


const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.onError((err,c) => {
  if (err instanceof HTTPException){
  const ErrorResponse = err.res ?? c.json<ErrorResponse>({
    success: false,
    error: err.message,
    isFormError: err.cause && typeof err.cause === "object" && "form" in err.cause ? err.cause.form === true : false,

  });
   return ErrorResponse
  }
  
  return c.json<ErrorResponse>({
    success: false,
    error: process.env['NODE_ENV'] === "production" ? 'Internal server Error':  (err.stack ?? err.message),
    isFormError: false,
  })
})



// Start the server
const port = process.env['PORT']? parseInt(process.env['PORT']) : 5000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
