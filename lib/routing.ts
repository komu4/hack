import type { CreateIncidentPayload, ResponderType } from '@/types/incident';

/**
 * Deterministic responder routing based on incident data.
 * The AI extracts information; this function applies predictable rules.
 */
export function determineResponders(payload: CreateIncidentPayload): ResponderType[] {
  const responders = new Set<ResponderType>();

  switch (payload.type) {
    case 'MEDICAL':
      responders.add('AMBULANCE');
      break;

    case 'FIRE':
      responders.add('FIRE_SERVICE');
      if (payload.peopleAffected && payload.peopleAffected > 0) {
        responders.add('AMBULANCE');
      }
      break;

    case 'POLICE':
      responders.add('POLICE');
      break;

    case 'ACCIDENT':
      responders.add('POLICE');
      responders.add('AMBULANCE');
      if (payload.personTrapped || payload.firePresent) {
        responders.add('FIRE_SERVICE');
      }
      break;

    case 'OTHER':
      // Route based on contextual signals
      if (payload.bleeding || payload.conscious === false) {
        responders.add('AMBULANCE');
      }
      if (payload.firePresent) {
        responders.add('FIRE_SERVICE');
      }
      if (payload.weaponPresent) {
        responders.add('POLICE');
      }
      if (responders.size === 0) {
        responders.add('AMBULANCE'); // Default safest option
      }
      break;
  }

  // Additional cross-category rules
  if (payload.firePresent && !responders.has('FIRE_SERVICE')) {
    responders.add('FIRE_SERVICE');
  }
  if (payload.weaponPresent && !responders.has('POLICE')) {
    responders.add('POLICE');
  }

  return Array.from(responders);
}
