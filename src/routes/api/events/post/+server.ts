import { client } from '$services/graphql-client';
import { gql } from 'graphql-request';
import type { RequestHandler } from '@sveltejs/kit';
import type { Catering } from '$interfaces/catering.interface';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const cateringData: Catering = await request.json();
    const mutation = gql`
      mutation CreateMission(
        $title: String!
        $start: DateTime
        $specialWishes: String
        $slug: String
        $remarks: String
        $place: String
        $offeringCreated: Boolean
        $numberOfPersons: Int
        $end: DateTime
        $description: String
        $date: Date
        $flow: String
        $client: String
        $cateringType: EventType
        $cateringStyle: DiningStyle
        $additionalServices: [AdditionalServices!]
        $relatedAssets: [AssetWhereUniqueInput!]
      ) {
        createMission(
          data: {
            title: $title
            start: $start
            specialWishes: $specialWishes
            slug: $slug
            remarks: $remarks
            place: $place
            offeringCreated: $offeringCreated
            numberOfPersons: $numberOfPersons
            end: $end
            description: $description
            flow: $flow
            date: $date
            client: $client
            cateringType: $cateringType
            cateringStyle: $cateringStyle
            additionalServices: $additionalServices
            relatedAssets: { connect: $relatedAssets }
          }
        ) {
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

    const variables = {
      title: cateringData.title,
      start: cateringData.start,
      specialWishes: cateringData.specialWishes,
      slug: cateringData.slug,
      remarks: cateringData.remarks,
      place: cateringData.place,
      offeringCreated: cateringData.offeringCreated,
      numberOfPersons: cateringData.numberOfPersons,
      end: cateringData.end,
      description: cateringData.description,
      date: cateringData.date,
      flow: cateringData.flow,
      client: cateringData.client,
      cateringType: cateringData.cateringType,
      cateringStyle: cateringData.cateringStyle,
      additionalServices: cateringData.additionalServices,
      relatedAssets: cateringData.relatedAssets?.length ? cateringData.relatedAssets : null
    };

    const response = (await client.request(mutation, variables)) as { createMission: Catering };

    return new Response(
      JSON.stringify({
        success: true,
        data: response.createMission
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error creating catering:', error);

    // Spezifische Fehlerbehandlung für GraphQL-Fehler
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Prüfe auf spezifische GraphQL-Fehler
      if (error.message.includes('authorization') || error.message.includes('Unauthorized')) {
        statusCode = 401;
        errorMessage = 'Authorization failed';
      } else if (error.message.includes('validation') || error.message.includes('required')) {
        statusCode = 400;
        errorMessage = 'Validation error: ' + error.message;
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
