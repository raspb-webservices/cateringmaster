import { client } from '$lib/services/graphql-client';
import { gql } from 'graphql-request';
import type { RequestHandler } from '@sveltejs/kit';
import type { Catering } from '$interfaces/catering.interface';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Event ID is required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const query = gql`
      query getMission($id: ID!) {
        mission(where: { id: $id }) {
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

    const response = (await client.request(query, { id })) as { mission: Catering };

    if (!response.mission) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Event not found'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: response.mission
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching event:', error);

    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('authorization') || error.message.includes('Unauthorized')) {
        statusCode = 401;
        errorMessage = 'Authorization failed';
      } else if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = 'Event not found';
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
