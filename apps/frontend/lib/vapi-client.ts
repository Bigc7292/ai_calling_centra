// Per TASK COMMAND: VAPI SDK wrapper (createCall, etc.)
import Vapi from '@vapi-ai/sdk';

// Per PRD Sec 5: Stack (VAPI 1.1 REST/WS)
const vapi = new Vapi(process.env.VAPI_API_KEY || '');

/**
 * Creates an outbound call using the VAPI service.
 * @param phoneNumber - The destination phone number.
 * @param assistantId - The VAPI Assistant ID to use for the call.
 * @returns The created call object from VAPI.
 * @see PRD Sec 6: Adapt for /calls endpoints
 */
export const createOutboundCall = async (phoneNumber: string, assistantId: string) => {
  try {
    // Per TASK COMMAND: Call VAPI API.createCall
    const call = await vapi.call.create({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID, // The VAPI-provisioned number to call from
      assistantId: assistantId,
      customer: {
        number: phoneNumber,
      },
    });

    return call;
  } catch (error) {
    console.error('VAPI call creation failed:', error);
    // Per TASK COMMAND: Error Handling: VAPI 5xx -> Retry x3 (bullmq queue)
    // This is where we would enqueue a retry job.
    // For now, we just re-throw the error.
    throw new Error('Failed to initiate call with VAPI.');
  }
};

/**
 * Retrieves a call from the VAPI service.
 * @param callId - The ID of the call to retrieve.
 * @returns The call object from VAPI.
 */
export const getVapiCall = async (callId: string) => {
  try {
    const call = await vapi.call.get(callId);
    return call;
  } catch (error) {
    console.error(`Failed to retrieve VAPI call ${callId}:`, error);
    throw new Error('Failed to retrieve call from VAPI.');
  }
};
