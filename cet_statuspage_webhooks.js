/* Custom Event Transformer for StatusPage.io incident and component events

CET to allow alerting for webhooks emitted from StatusPage IO events.  Captures
key details from the webhook.  Auto resolve of incident is enabled by default.

Author: preocts@preocts.com
Git   : https://github.com/Preocts/cet_statuspage_webhooks
*/

// When true incidents will close when resolved
var auto_resolve = true;
// When true incidents will be opened/updated on incident webhooks
var open_incident = true;
// When true incidents will be opened/updated on component webhooks
var component_incidents = false;
// When true events will be deduped
var dedup_events = true;

var webhook = PD.inputRequest.body;
var event_type = PD.Trigger;
var normalized_event = {};

if (open_incident && ('incident' in webhook)) {
    // Assemble from statuspage.io Incident webhook

    // Handle auto-resolve
    if ((webhook.incident.status == "resolved") && auto_resolve) event_type = PD.Resolve;

    // Build event
    normalized_event = {
        event_type: event_type,
        incident_key: dedup_events ? webhook.incident.id : Date.now(),
        description: webhook.incident.name,
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

} else if (component_incidents && ('component_update' in webhook)) {
    // Assemble from statuspage.io Component Update webhook

    // Handle auto-resolve
    if ((webhook.component_update.new_status == "operational") && auto_resolve) event_type = PD.Resolve;

    // Build event
    normalized_event = {
        event_type: event_type,
        incident_key: dedup_events ? webhook.component_update.id : Date.now(),
        description: webhook.component.name + ' status: ' + webhook.component.status,
        details: {
            created_at: webhook.component_update.created_at,
            current_status: webhook.component_update.new_status,
            prior_status: webhook.component_update.old_status,
            unsubscribe: webhook.meta.unsubscribe
        },
        client: webhook.component.name
    };

} else if (open_incident && ('status_page' in webhook)) {
    // Assemble from PagerDuty Status Page webhook

    // Handle auto-resolve
    if ((webhook.status == "resolved") && auto_resolve) event_type = PD.Resolve;

    // Build event
    normalized_event = {
        event_type: event_type,
        incident_key: dedup_events ? webhook.href : Date.now(),
        description: webhook.title,
        details: {
            status_page_url: webhook.href,
            created_at: webhook.reported_at,
            post_type: webhook.post_type,
            message: webhook.message,
            status: webhook.status,
            severity: webhook.severity,
            services: webhook.services,
        },
        client: webhook.status_page
    };
};

// Emit event
if ('event_type' in normalized_event) {
    PD.emitGenericEvents([normalized_event]);
} else {
    var crash = 1 / 0;
    PD.fail("No event_type found in webhook");
};
