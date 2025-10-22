/**
 * Integration Handlers Registry
 * Registers all available integration handlers
 */

const epicHandler = require('./epic.handler');
const stripeHandler = require('./stripe.handler');
const hundredMSHandler = require('./100ms.handler');
const agoraHandler = require('./agora.handler');
const vonageHandler = require('./vonage.handler');
const customHL7Handler = require('./custom-hl7.handler');
const claimMDHandler = require('./claimmd.handler');

// Add more handlers as they are created:
// const twilioHandler = require('./twilio.handler');
// const availityHandler = require('./availity.handler');
// const redoxHandler = require('./redox.handler');

/**
 * Register all integration handlers with the integration service
 * @param {IntegrationService} integrationService
 */
function registerAllHandlers(integrationService) {
  console.log('📦 Registering integration handlers...');

  // Medical Billing Clearinghouses
  integrationService.registerHandler('claimmd', claimMDHandler);

  // EHR Systems
  integrationService.registerHandler('epic', epicHandler);

  // Payment Processors
  integrationService.registerHandler('stripe', stripeHandler);

  // Telehealth Platforms
  integrationService.registerHandler('100ms', hundredMSHandler);
  integrationService.registerHandler('agora', agoraHandler);
  integrationService.registerHandler('vonage', vonageHandler);

  // HL7/FHIR Integration
  integrationService.registerHandler('custom-hl7', customHL7Handler);

  // TODO: Register additional handlers as they are implemented
  // integrationService.registerHandler('twilio', twilioHandler);
  // integrationService.registerHandler('availity', availityHandler);
  // integrationService.registerHandler('redox', redoxHandler);

  console.log('✓ Integration handlers registered');
}

module.exports = {
  registerAllHandlers,
  claimMDHandler,
  epicHandler,
  stripeHandler,
  hundredMSHandler,
  agoraHandler,
  vonageHandler,
  customHL7Handler
};
