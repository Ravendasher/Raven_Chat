import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeLLM = vi.hoisted(() => vi.fn());
vi.mock("./_core/llm", () => ({ invokeLLM }));

import { appRouter } from "./routers";

const context = {
  user: undefined,
  req: {} as never,
  res: {} as never,
};

describe("ravenAi.ask", () => {
  beforeEach(() => {
    invokeLLM.mockReset();
    invokeLLM.mockResolvedValue({
      choices: [{ message: { content: "A calm, useful answer." } }],
    });
  });

  it("returns the model text for a valid prompt", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.ravenAi.ask({ prompt: "Help me plan a calm day" })).resolves.toEqual({
      text: "A calm, useful answer.",
    });
    expect(invokeLLM).toHaveBeenCalledOnce();
  });

  it("rejects empty prompts before calling the model", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.ravenAi.ask({ prompt: "" })).rejects.toThrow();
    expect(invokeLLM).not.toHaveBeenCalled();
  });
});
