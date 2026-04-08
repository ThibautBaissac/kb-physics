// Minimal types for the SDK stream messages we consume.
// Importing from the SDK fails tsc due to missing peer dep types
// (@anthropic-ai/sdk, @modelcontextprotocol/sdk).

export interface ContentBlockText { type: 'text'; text: string }
export interface ContentBlockToolUse { type: 'tool_use'; name: string; input: Record<string, string> }
export interface SDKAssistantMessage {
  type: 'assistant';
  message: { content: Array<ContentBlockText | ContentBlockToolUse> };
}
export interface SDKResultMessageSuccess {
  type: 'result'; subtype: 'success'; result: string;
}
export interface SDKResultMessageError {
  type: 'result'; subtype: 'error_during_execution' | 'error_max_turns' | 'error_max_budget_usd'; errors: string[];
}
export type SDKResultMessage = SDKResultMessageSuccess | SDKResultMessageError;

export type IngestEventType = 'text' | 'tool' | 'error' | 'kb_updated' | 'done';
export interface IngestEvent { type: IngestEventType; content?: string; tool?: string; detail?: string }
