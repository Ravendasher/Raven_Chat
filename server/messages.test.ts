import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const context = { user: undefined, req: {} as never, res: {} as never };

describe("messages", () => {
  it("rejects an empty conversation id before touching storage", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.messages.list({ conversationId: "" })).rejects.toThrow();
  });

  it("rejects an image upload with an audio MIME type", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.messages.uploadMedia({
      conversationId: "sakura",
      senderKey: "test-sender",
      kind: "image",
      fileName: "voice.webm",
      mimeType: "audio/webm",
      dataBase64: "dGVzdA==",
    })).rejects.toThrow("Image MIME type required");
  });
});
