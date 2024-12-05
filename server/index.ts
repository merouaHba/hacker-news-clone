import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ErrorResponse } from '@/shared/types'
import { authRouter } from '@/routes/auth'
import { postRouter } from './routes/posts'
import { commentsRouter } from './routes/comments'
import { cors } from 'hono/cors'
import { lucia } from './lucia'
import type { Context } from './context'


const app = new Hono<Context>()
app.use("*", cors(), async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }
  c.set("session", session);
  c.set("user", user);
  return next();
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .basePath("/api")
  .route("/auth", authRouter) 
  .route("/posts", postRouter)
  .route("/comments", commentsRouter)

app.onError((err,c) => {
  if (err instanceof HTTPException){
  const ErrorResponse = err.res ?? c.json<ErrorResponse>({
    success: false,
    error: err.message,
    isFormError: err.cause && typeof err.cause === "object" && "form" in err.cause ? err.cause.form === true : false,

  },err.status);
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
export type ApiRoutes = typeof routes 
serve({
  fetch: app.fetch,
  port
})
