/* Custom Event Transformer for StatusPage.io incident and component events

CET to allow alerting for webhooks emitted from StatusPage IO events.  Captures
key details from the webhook.  Auto resolve of incident is enabled by default.

Author: Preocts, preocts@preocts.com
Git   : https://github.com/Preocts/CET_statuspage.io
*/

// When true incidents will close when resolved
var auto_resolve = true;
// When true incidents will be opened/updated on incident webhooks
var incident_watch = true;
// When true incidents will be opened/updated on component webhooks
var component_watch = false;

var webhook = PD.inputRequest.body;
var event_type = PD.Trigger;
var normalized_event = {};

// Assemble from Incident Webhook
if (incident_watch && ('incident' in webhook)) {

    // Handle auto-resolve
    if ((webhook.incident.status == "resolved") && auto_resolve) event_type = PD.Resolve;

    // Build event
    normalized_event = {
        event_type: event_type,
        incident_key: webhook.incident.id,
        description: 'StatusPage.io Incident Webhook - ' + webhook.incident.name,
        details: {
            created_at: webhook.incident.created_at,
            status: webhook.incident.status,
            updated_at: webhook.incident.updated_at,
            resolved_at: webhook.incident.resolved_at,
            updates: webhook.incident.incident_updates[0].body,
            unsubscribe: webhook.meta.unsubscribe
        },
        client: "Statuspage.io",
        client_url: webhook.incident.shortlink
    };
};

// Assemble from Component Update
if (component_watch && ('component_update' in webhook)) {

    // Handle auto-resolve
    if ((webhook.component_update.new_status == "operational") && auto_resolve) event_type = PD.Resolve;

    // Build event
    normalized_event = {
        event_type: event_type,
        incident_key: webhook.component.id,
        description: 'StatusPage.io Component Webhook - ' + webhook.component.name + ' status: ' + webhook.component.status,
        details: {
            created_at: webhook.component_update.created_at,
            current_status: webhook.component_update.new_status,
            prior_status: webhook.component_update.old_status,
            unsubscribe: webhook.meta.unsubscribe
        },
        client: webhook.component.name
    };
};

// Emit event
if ('event_type' in normalized_event) PD.emitGenericEvents([normalized_event]);