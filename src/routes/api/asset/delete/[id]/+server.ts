import { client } from '$lib/services/graphql-client';
import { gql } from 'graphql-request';

export const GET = async (req) => {
  const id = req.params.id;
  try {
    const query = gql`
      mutation deletehAsset($id: ID!) {
        deleteAsset(where: { id: $id }) {
          id
        }
      }
    `;
    const variables = { id };
    const response = await client.request(query, variables);
    return new Response(JSON.stringify(response));
  } catch (error) {
    return new Response(JSON.stringify(error));
  }
};
