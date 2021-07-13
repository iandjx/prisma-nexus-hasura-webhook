import fetch from 'node-fetch'

export const HASURA_OPERATION = `
mutation MyMutation($object: item_insert_input!) {
  insert_item_one(object: $object) {
    id
  }
}
`

// execute the parent operation in Hasura
export const execute = async (variables: any) => {
  const fetchResponse = await fetch(
    'https://action-relationships.hasura.app/v1/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables,
      }),
      headers: {
        'x-hasura-admin-secret':
          'pe9G8UHqLdYZ5oRI2CK2KXtC5xa7RKXdEk6mnDDiZ46fVA1cfagkHTGOoIVjCWAR',
      },
    },
  )
  const data = await fetchResponse.json()
  console.log('DEBUG: ', data)
  return data
}
