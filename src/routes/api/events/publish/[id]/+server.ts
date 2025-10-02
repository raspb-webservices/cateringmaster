import { client } from '$lib/services/graphql-client';
import { gql } from 'graphql-request';
import { json, type RequestHandler } from '@sveltejs/kit';

async function publishMission(id: string) {
  try {
    const query = gql`
      mutation publishMission($id: ID!) {
        publishMission(where: { id: $id }, to: PUBLISHED) {
          id
          stage
        }
      }
    `;

    const variables = { id };
    const response = (await client.request(query, variables)) as any;

    console.log('Mission publish id:', response);
    console.log('Mission publish response:', response);

    if (response?.publishMission?.id) {
      return {
        success: true,
        data: response.publishMission,
        message: 'Mission successfully published'
      };
    } else {
      throw new Error('No mission returned from publish mutation');
    }
  } catch (error) {
    console.error('Error publishing mission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    };
  }
}


export const POST: RequestHandler = async ({ params }) => {
  const id = params.id;

  if (!id) {
    return json({ success: false, error: 'Mission ID is required' }, { status: 400 });
  }

  // Wait 3 seconds to ensure entity is properly updated before publishing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const result = await publishMission(id);

  if (result.success) {
    return json(result);
  } else {
    return json(result, { status: 500 });
  }
};
