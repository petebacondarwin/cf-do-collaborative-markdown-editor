import { DurableDocEnvironment } from "../durable-objects/durable-doc";

/**
 * The handler called by the public facing worker to connect the browser
 * to the durable object worker via a Web Socket.
 */
export async function connectToDoc(
  request: Request,
  env: DurableDocEnvironment
) {
  const id = env.docs.idFromName("my-doc");
  const doc = await env.docs.get(id);
  return await doc.fetch(request);
}
