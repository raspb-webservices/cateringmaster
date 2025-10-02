import { client } from '$lib/services/graphql-client';
import { gql } from 'graphql-request';
import type { RequestHandler } from '@sveltejs/kit';
import type { Catering } from '$interfaces/catering.interface';

export const PATCH: RequestHandler = async ({ request }) => {
  try {
    const { id: cateringId, ...propertiesToUpdate } = await request.json();

    if (!cateringId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Catering ID is required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const updateFields: string[] = [];
    const variables: Record<string, any> = { id: cateringId };

    for (const key in propertiesToUpdate) {
      if (propertiesToUpdate[key] !== undefined) {
        if (key === 'location') {
          // Handle nested location object
          updateFields.push('location: $location');
          variables.location = propertiesToUpdate[key];
        } else if (key === 'relatedAssets') {
          updateFields.push('relatedAssets: { set: $relatedAssets }');
          variables.relatedAssets = propertiesToUpdate[key]?.length ? propertiesToUpdate[key] : [];
        } else {
          updateFields.push(`${key}: $${key}`);
          variables[key] = propertiesToUpdate[key];
        }
      }
    }

    // Prüfen, ob mindestens ein Feld zum Update vorhanden ist
    if (updateFields.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No fields to update provided'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Dynamische GraphQL-Mutation basierend auf den vorhandenen Feldern erstellen
    const variableDefinitions = Object.keys(variables)
      .filter((key) => key !== 'id')
      .map((key) => {
        switch (key) {
          case 'offeringCreated':
            return `$${key}: Boolean`;
          case 'numberOfPersons':
            return `$${key}: Int`;
          case 'date':
            return `$${key}: Date`;
          case 'start':
          case 'end':
            return `$${key}: DateTime`;
          case 'additionalServices':
            return `$${key}: [AdditionalServices!]`;
          case 'relatedAssets':
            return `$${key}: [AssetWhereUniqueInput!]`;
          case 'cateringType':
            return `$${key}: EventType`; // Assuming an Enum
          case 'cateringStyle':
            return `$${key}: DiningStyle`; // Assuming an Enum
          default:
            return `$${key}: String`;
        }
      })
      .join('\n        ');

    const mutation = gql`
      mutation UpdateMission(
        $id: ID!
        ${variableDefinitions}
      ) {
        updateMission(
          where: { id: $id }
          data: {
            ${updateFields.join('\n            ')}
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

    // GraphQL Request an Hygraph senden
    const response = (await client.request(mutation, variables)) as { updateMission: Catering };

    return new Response(
      JSON.stringify({
        success: true,
        data: response.updateMission
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error updating catering:', error);

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
      } else if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = 'Catering not found';
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
