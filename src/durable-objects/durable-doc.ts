import { renderer } from "./markdown-renderer";

/**
 * The environment type for this durable object that is passed to the fetch handler.
 *
 * The `docs` property must match the binding name in the wrangler.toml file.
 */
export interface DurableDocEnvironment {
  docs: DurableObjectNamespace;
}

export class DurableDoc implements DurableObject {
  private content: string = null!;
  private sockets: WebSocket[] = [];

  constructor(private state: DurableObjectState, private env: unknown) {}

  async fetch(): Promise<Response> {
    if (this.content === null) {
      const store = (await this.state.storage?.list<string>()) ?? [];
      this.content = Array.from(store.values()).join("\n");
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.sockets.push(server);
    this.connect(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async connect(socket: WebSocket) {
    socket.accept();
    socket.addEventListener("message", msg => this.handle(msg));
    socket.addEventListener("close", () => this.close(socket));
  }

  private async handle(msgEvent: MessageEvent) {
    const message = JSON.parse(msgEvent.data.toString());
    switch (message.type) {
      case "update":
        this.content = message.content;
        this.broadcast(changedMessage(this.content));
        break;
      case "init":
        this.broadcast(changedMessage(this.content));
        break;
      case "save":
        await this.save();
        this.broadcast(savedMessage());
        break;
    }
  }

  private broadcast(msg: unknown) {
    const msgString = JSON.stringify(msg);
    for (const socket of this.sockets) {
      socket.send(msgString);
    }
  }

  private close(socket: WebSocket) {
    const i = this.sockets.indexOf(socket);
    if (i !== -1) {
      this.sockets.splice(i, 1);
    }
  }

  private async save() {
    await this.state.storage?.deleteAll();
    const lines = this.content.split("\n");
    await Promise.all(
      lines.map((line, index) => this.state.storage?.put(String(index), line))
    );
  }
}

function changedMessage(content: string) {
  return {
    type: "changed",
    input: content,
    output: renderer.render(content)
  };
}

function savedMessage() {
  return { type: "saved" };
}
