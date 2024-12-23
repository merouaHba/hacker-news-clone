
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { z } from 'zod'
import { sessionTable, userTable } from './db/schemas/auth';
import { postsTable } from './db/schemas/posts';
import { commentsTable } from './db/schemas/comments';

const EnvSchema = z.object({
    DATABASE_URL: z.string().url(),

})

const processEnv = EnvSchema.parse(process.env)

const queryClient = postgres(processEnv.DATABASE_URL)
export const db = drizzle(queryClient, {
    schema: {
        user: userTable,
        session: sessionTable,
        posts: postsTable,
        comments: commentsTable,
    }

})


export const adapter = new DrizzlePostgreSQLAdapter(db,sessionTable,userTable)