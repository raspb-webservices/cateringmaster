import { client } from '$lib/services/graphql-client';
import { gql } from 'graphql-request';

export const GET = async (req) => {
  const id = req.params.id;
  try {
    const query = gql`
      query GetAssetStatus($id: ID!) {
        published: asset(stage: PUBLISHED, where: { id: $id }) {
          id
          fileName
          url
          updatedAt
        }
        draft: asset(stage: DRAFT, where: { id: $id }) {
          id
          fileName
          url
          updatedAt
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
