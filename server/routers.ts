import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ravenAi: router({
    ask: publicProcedure
      .input(z.object({ prompt: z.string().min(1).max(2000) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are Raven AI, a calm and thoughtful assistant inside Raven Chat. Be concise, warm, and practical. You may help with writing, explanations, planning, language, and reflection. Never help access accounts, passwords, private data, credentials, surveillance, fraud, or instructions that could harm people. If asked for those, refuse briefly and offer a safe alternative. Do not claim to be human.",
            },
            { role: "user", content: input.prompt },
          ],
          maxTokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (typeof content === "string") return { text: content };
        if (Array.isArray(content)) {
          return {
            text: content
              .filter((part): part is { type: "text"; text: string } => part.type === "text")
              .map(part => part.text)
              .join("\n"),
          };
        }
        return { text: "I’m here with you. Try asking that in a different way." };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
