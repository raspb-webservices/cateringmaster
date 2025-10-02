import { GraphQLClient } from 'graphql-request';
import { GRAPHQL_ENDPOINT } from '$env/static/private'
import { GRAPHQL_TOKEN } from '$env/static/private'

export const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    Authorization: 'Bearer ' + GRAPHQL_TOKEN
  }
});
