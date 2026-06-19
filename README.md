# Hue Agent Beacon

Ambient Philips Hue notifications for AI agent harnesses.

## North star

```bash
npm install -g hue-agent-beacon
hue-agent-beacon setup
hue-agent-beacon integrate pi
```

Expected result:

```text
✅ Hue Bridge connected
✅ Office light selected
✅ Pi lifecycle hooks installed
✅ Test notification sent
```

After that, use the agent normally. Hue Agent Beacon listens to harness lifecycle events and turns them into subtle light notifications.

## Core idea

Agents should emit semantic lifecycle events, not directly control Hue lights.

```text
Agent harness
  lifecycle hooks
      ↓
Hue Agent Beacon adapter
      ↓
POST http://127.0.0.1:8765/events
      ↓
Hue Agent Beacon daemon
      ↓
Philips Hue Bridge API
      ↓
Office lights
```

Only the Beacon daemon talks to the Hue Bridge. Integrations only emit events like:

```json
{
  "event": "waiting_for_user",
  "source": "pi",
  "message": "Agent needs input"
}
```

## Planned commands

```bash
hue-agent-beacon setup
hue-agent-beacon serve
hue-agent-beacon notify <event>
hue-agent-beacon integrate <agent>
hue-agent-beacon integrations list
hue-agent-beacon status
```

## Example events

- `working` → soft blue working state
- `waiting_for_user` → yellow pulse until acknowledged
- `needs_approval` → purple pulse until acknowledged
- `complete` → green flash, then restore
- `error` → red flash, then restore

## Local event API

```http
POST http://127.0.0.1:8765/events
Content-Type: application/json
```

```json
{
  "event": "complete",
  "source": "pi",
  "run_id": "optional-run-id",
  "message": "Agent finished",
  "priority": "normal"
}
```

## Integration model

Each agent harness integration should translate its own lifecycle hooks into the shared event contract.

Example lifecycle mapping:

| Harness transition | Beacon event |
|---|---|
| Run starts | `working` |
| User input prompt opens | `waiting_for_user` |
| Permission approval is needed | `needs_approval` |
| Run completes | `complete` |
| Run errors | `error` |

The integration should not know Hue credentials, light IDs, colors, or brightness values.

## MVP

1. Connect to a Hue Bridge.
2. Select a target light or room.
3. Run a local event daemon.
4. Support manual `notify` commands.
5. Implement green `complete`, red `error`, and yellow `waiting_for_user` notifications.
6. Implement `hue-agent-beacon integrate pi` as the first lifecycle-hook adapter.

## Design principle

The lights should notify, not annoy.

Hue Agent Beacon should be best-effort: notification failures must never break an agent run.
