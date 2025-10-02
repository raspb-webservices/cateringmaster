import { client } from '$services/graphql-client';
import type { RequestHandler } from '@sveltejs/kit';
import { gql } from 'graphql-request';

export const GET: RequestHandler = async () => {
  try {
    const query = gql`
      query getMissions {
        missions(stage: PUBLISHED, first: 100) {
          title
          start
          specialWishes
          slug
          remarks
          place
          offeringCreated
          numberOfPersons
          relatedAssets {
            id
            url
            fileName
          }
          id
          flow
          end
          description
          date
          createdAt
          client
          cateringType
          cateringStyle
          additionalServices
        }
      }
    `;
    const { missions } = (await client.request(query)) as any;

    return new Response(JSON.stringify(missions));
  } catch (error) {
    return new Response(JSON.stringify(error));
  }
};
