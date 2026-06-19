export type ParsedArgs =
  | { kind: "notify"; event: string; source?: string }
  | { kind: "ack" }
  | { kind: "usage" };

export function parseArgs(args: string[]): ParsedArgs {
  const [command, event, ...optionArgs] = args;

  if (command === "ack" && !event && optionArgs.length === 0) {
    return { kind: "ack" };
  }

  if (command !== "notify" || !event) {
    return { kind: "usage" };
  }

  let source: string | undefined;

  for (let index = 0; index < optionArgs.length; index += 2) {
    const flag = optionArgs[index];
    const value = optionArgs[index + 1];

    if (flag !== "--source" || !value || value.startsWith("--")) {
      return { kind: "usage" };
    }

    source = value;
  }

  return source ? { kind: "notify", event, source } : { kind: "notify", event };
}
