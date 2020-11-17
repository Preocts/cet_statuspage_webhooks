# Custom Event Transformer (CET)

### For Statuspage.io incident webhook events

---

A Custom Event Transformer (CET) to allow alerting for incidents emitted from StatusPage IO events.  Captures key details from the webhook.  Auto resolve of incident is enabled by default.

Add awareness to third-party dependancies through their status pages and PagerDuty.

External links:

- [PagerDuty Custom Event Transformer](https://developer.pagerduty.com/docs/events-api-v1/custom-event-transformer/)
- [Statuspage.io webhook documentation](https://support.atlassian.com/statuspage/docs/enable-webhook-notifications/)

---

### Configuration

There are three vars that can be adjusted to change the behavior of this CET.

- **auto_resolve**
  - When set to 'true' incidents will auto-resolve in PagerDuty when a status of 'resolved' is recieved from Statuspage.io for incidents or "operational" for components
  - Default: true

- **incident_watch**
  - When set to 'true' the CET will transform incoming incident webhooks into alerts on the PagerDuty dashboard
  - Default: true

- **component_watch**
  - When set to 'true' the CET will transform incoming component webhooks into alerts on the PagerDuty dashboard
  - Default: false

**Note**: This CET uses the Statuspage.io ID for the PagerDuty `incident_key` value. This means multiple webhooks from the same incident/component will be grouped.
