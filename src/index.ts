import { connectToDoc } from "./handlers/connect-to-doc";
import { homePage } from "./handlers/home-page";
import { DurableDocEnvironment } from "./durable-objects/durable-doc";

/** The environment passed to fetch is a union of all durable object environments. */
interface Environment extends DurableDocEnvironment {}

/**
 * The fetch handler for the public facing worker simply routes the request to the appropriate handler.
 */
export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    if (request.url.endsWith("/connect")) {
      return await connectToDoc(request, env);
    } else {
      return homePage();
    }
  }
};

/** Durable object types must be exported from the root. */
export { DurableDoc } from "./durable-objects/durable-doc";
