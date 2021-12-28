/**
 * The environment type for this durable object that is passed to the fetch handler.
 *
 * The `docs` property must match the binding name in the wrangler.toml file.
 */
export interface DurableDocEnvironment {
  docs: DurableObjectNamespace;
}

export class DurableDoc implements DurableObject {
  private content = "";
  private sockets: WebSocket[] = [];

  constructor(private state: DurableObjectState, private env: unknown) {}

  async fetch(): Promise<Response> {
    const { 0: client, 1: server } = new WebSocketPair();

    this.sockets.push(server);
    this.connect(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async connect(socket: WebSocket) {
    socket.accept();
    socket.addEventListener("message", msg => this.update(msg));
    socket.addEventListener("close", () => this.close(socket));
  }

  update(msgEvent: MessageEvent) {
    const message = JSON.parse(msgEvent.data.toString());
    if (message.type === "update") {
      this.content = message.content;
    }
    this.broadcast();
  }

  broadcast() {
    for (const socket of this.sockets) {
      socket.send(this.render());
    }
  }

  close(socket: WebSocket) {
    const i = this.sockets.indexOf(socket);
    if (i !== -1) {
      this.sockets.splice(i, 1);
    }
  }

  render(): string {
    return JSON.stringify({
      input: this.content,
      output: this.content.toUpperCase()
    });
  }
}
