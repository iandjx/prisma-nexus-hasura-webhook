import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './schema'
import { context } from './context'
import JWT from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { execute } from './webhook'
dotenv.config()
const app = express()
app.use(express.urlencoded())
app.use(express.json())

const secret = process.env.SECRET as string
const authenticate = async (req: any, res: any) => {
  const { email, password } = req.body
  const user = await context.prisma.user.findFirst({
    where: {
      email,
      password,
    },
  })
  if (!user) {
    res.sendStatus(401)
    return
  }

  const token = JWT.sign(user.email, secret)
  res.json({ token })
}

const webhook = async (req: any, res: any) => {
  var authHeaders = req.get('Authorization')
  var token = extractToken(authHeaders)
  if (!token) {
    return res.sendStatus(401)
  }
  try {
    JWT.verify(token, secret)
  } catch (error) {
    return res.sendStatus(403)
  }
  var hasuraVariables = {
    'X-Hasura-User-Id': '1234',
    'X-Hasura-Role': 'user',
  }
  return res.json(hasuraVariables)
}

app.post('/authenticate', authenticate)
app.get('/webhook', webhook)
// Request Handler
app.post('/MyMutation', async (req, res) => {
  // get request input
  const { object } = req.body.input

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ object })

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_item_one,
  })
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    context: context,
    graphiql: true,
  }),
)

app.listen(4000)
console.log(`\
🚀 Server ready at: http://localhost:4000/graphql
⭐️ See sample queries: http://pris.ly/e/ts/graphql#using-the-graphql-api
`)

const extractToken = (bearerToken: string) => {
  const regex = /^(Bearer) (.*)$/g
  const match = regex.exec(bearerToken)
  if (match && match[2]) {
    return match[2]
  }
  return null
}
