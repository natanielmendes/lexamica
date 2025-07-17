export interface WebhookEvent {
  type: string;
  payload: any;
}

export interface WebhookEventHandler {
  handleEvent(event: WebhookEvent): Promise<void>;
}

export class WebhookHandler {
  private handlers: Map<string, WebhookEventHandler[]> = new Map();

  // Register a handler for a specific event type
  registerHandler(eventType: string, handler: WebhookEventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  // Dispatch an event to all registered handlers for its type
  async dispatch(event: WebhookEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      await handler.handleEvent(event);
    }
  }
}
