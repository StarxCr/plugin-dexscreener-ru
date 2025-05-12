import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    elizaLogger,
    getEmbeddingZeroVector,
} from "@elizaos/core";

interface TokenProfile {
    url: string;
    description?: string;
    chainId: string;
    tokenAddress: string;
    links: {url:string}[]
}

const createTokenMemory = async (
    runtime: IAgentRuntime,
    _message: Memory,
    formattedOutput: string
) => {
    const memory: Memory = {
        userId: _message.userId,
        agentId: _message.agentId,
        roomId: _message.roomId,
        content: { text: formattedOutput },
        createdAt: Date.now(),
        embedding: getEmbeddingZeroVector(),
    };
    await runtime.messageManager.createMemory(memory);
};

export const latestTokensTemplate = `Определите, является ли это запросом на получение последних токенов. Если это один из указанных случаев, выполните соответствующее действие:

Ситуация 1: "Получить последние токены"
- Сообщение содержит: слова вроде "последние", "новые", "свежие" И "токены"
- Пример: "Покажи последние токены" или "Какие новые токены появились?"
- Действие: Получить список самых недавно добавленных токенов

Предыдущий диалог для контекста:
{{conversation}}

Вы отвечаете на сообщение: {{message}}
`;

export class LatestTokensAction implements Action {
    name = "GET_LATEST_TOKENS";
    similes = ["FETCH_NEW_TOKENS", "CHECK_RECENT_TOKENS", "LIST_NEW_TOKENS"];
    description = "Get the latest tokens from DexScreener API";
    suppressInitialMessage = true;
    template = latestTokensTemplate;

    async validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        const content =
            typeof message.content === "string"
                ? message.content
                : message.content?.text;

        if (!content) return false;

        const hasLatestKeyword = /\b(latest|new|recent)\b/i.test(content) || /(последн..|нов..|недавн..)/i.test(content);;
        const hasTokensKeyword = /\b(tokens?|coins?|crypto)\b/i.test(content) || /(токен|токен.|токен..|монет..|монет.|монет)/i.test(content);;

        return hasLatestKeyword && hasTokensKeyword;
    }

    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State,
        _options: { [key: string]: unknown } = {},
        callback?: HandlerCallback
    ): Promise<boolean> {
        elizaLogger.log("Starting GET_LATEST_TOKENS handler...");

        try {
            const response = await fetch(
                "https://api.dexscreener.com/token-profiles/latest/v1",
                {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tokens: TokenProfile[] = await response.json();

            const formattedOutput = tokens
                .map((token) => {
                    const [website, twitter, tg] = token.links
                    const description = token.description || "-";
                     return `${token.chainId}
                [📜${token.tokenAddress}](${token.url})
                ${website?(`[🌐Сайт](${website.url})`): ("")}${twitter?(`\n[🟢X](${twitter.url})`): ("")}${tg?(`\n[🔵Telegram](${tg.url})`): ("")}   
                Description: ${description}

                `;
                })
                .join("");

            await createTokenMemory(runtime, message, formattedOutput);

            if (callback) {
                await callback({
                    text: formattedOutput,
                    action: this.name,
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error fetching latest tokens:", error);

            if (callback) {
                await callback({
                    text: `Failed to fetch latest tokens: ${error.message}`,
                    action: this.name,
                });
            }

            return false;
        }
    }

    examples = [
    [
      {
        user: "{{user1}}",
        content: {
          text: "покажи мне последние токены"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here are the latest tokens added to DexScreener...",
          action: "GET_LATEST_TOKENS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "список новых токенов"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here are the latest tokens added to DexScreener...",
          action: "GET_LATEST_TOKENS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "список последних токенов"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here are the latest tokens added to DexScreener...",
          action: "GET_LATEST_TOKENS"
        }
      }
    ]
  ];
}

export const latestBoostedTemplate = `Определите, является ли это запросом на получение последних токенов с бустом. Если это один из указанных случаев, выполните соответствующее действие:

Ситуация 1: "Получить последние продвигаемые токены"
- Сообщение содержит: слова вроде "последние", "новые", "бустят","свежие", "токены с бустом" И "буст токены"
- Пример: "Покажи последние продвигаемые токены" или "Какие новые токены продвигаются?"
- Действие: GET_LATEST_BOOSTED_TOKENS

Предыдущий диалог для контекста:
{{conversation}}

Вы отвечаете на сообщение: {{message}}
`;

export class LatestBoostedTokensAction implements Action {
    name = "GET_LATEST_BOOSTED_TOKENS";
    similes = [
        "FETCH_NEW_BOOSTED_TOKENS",
        "CHECK_RECENT_BOOSTED_TOKENS",
        "LIST_NEW_BOOSTED_TOKENS",
    ];
    description = "Get the latest boosted tokens from DexScreener API";
    suppressInitialMessage = true;
    template = latestBoostedTemplate;

    async validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        const content =
            typeof message.content === "string"
                ? message.content
                : message.content?.text;

        if (!content) return false;

        const hasLatestKeyword = /\b(latest|new|recent)\b/i.test(content)|| /(последн..|нов..|недавн..)/i.test(content);;
        const hasBoostedKeyword = /\b(boosted|promoted|featured)\b/i.test(content) || /(буст|буст..|продвигаем..|продвижен..)/i.test(content);;
        const hasTokensKeyword = /\b(tokens?|coins?|crypto)\b/i.test(content) || /(токен|токен.|токен..|монет..|монет.|монет)/i.test(content);;

        return hasLatestKeyword && (hasBoostedKeyword || hasTokensKeyword);
    }

    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State,
        _options: { [key: string]: unknown } = {},
        callback?: HandlerCallback
    ): Promise<boolean> {
        elizaLogger.log("Starting GET_LATEST_BOOSTED_TOKENS handler...");

        try {
            const response = await fetch(
                "https://api.dexscreener.com/token-boosts/latest/v1",
                {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tokens: TokenProfile[] = await response.json();

            const formattedOutput = tokens
                .map((token) => {
                           const description = token.description || "";
                    return ` ${token.chainId}\n [${token.tokenAddress}](${token.url}) \n Description: ${description}`;})
                .join("");

            await createTokenMemory(runtime, message, formattedOutput);

            if (callback) {
                await callback({
                    text: formattedOutput,
                    action: this.name,
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error fetching latest boosted tokens:", error);

            if (callback) {
                await callback({
                    text: `Failed to fetch latest boosted tokens: ${error.message}`,
                    action: this.name,
                });
            }

            return false;
        }
    }

    examples = [
    [
      {
        user: "{{user1}}",
        content: {
          text: "покажи список новых токенов с продвижением"
        }
      },
      {
        user: "{{agent}}",
        content: {
          action: "GET_LATEST_BOOSTED_TOKENS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "новые токены с бустом"
        }
      },
      {
        user: "{{agent}}",
        content: {
          action: "GET_LATEST_BOOSTED_TOKENS"
        }
      }
    ]
  ];
}

export const topBoostedTemplate = `Определите, является ли это запросом на топ токенов с бустом. Если это один из указанных случаев, выполните соответствующее действие:

Ситуация 1: "Получить топ токенов c бустом"
- Сообщение содержит: слова вроде "в топе", "лидрующие", "топ", "лучшие", "самые","продвигаемые" И "токены с бустом"
- Пример: "Покажи топ токенов с бустом", "лидирующие токены с бустом" или "Какие токены продвигаются больше всего?"
- Действие: GET_TOP_BOOSTED_TOKENS

Предыдущий диалог для контекста:
{{conversation}}

Вы отвечаете на сообщение: {{message}}
`;

export class TopBoostedTokensAction implements Action {
    name = "GET_TOP_BOOSTED_TOKENS";
    similes = [
        "FETCH_MOST_BOOSTED_TOKENS",
        "CHECK_HIGHEST_BOOSTED_TOKENS",
        "LIST_TOP_BOOSTED_TOKENS",
    ];
    description = "Get tokens with most active boosts from DexScreener API";
    suppressInitialMessage = true;
    template = topBoostedTemplate;

    async validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        const content =
            typeof message.content === "string"
                ? message.content
                : message.content?.text;

        if (!content) return false;

        const hasTopKeyword = /\b(top|best|most)\b/i.test(content)|| /(топ|топ.|топовы.)/i.test(content);;
        const hasBoostedKeyword = /\b(boosted|promoted|featured)\b/i.test(content) || /(буст|буст..|продвигаем..|продвижен..)/i.test(content);;
        const hasTokensKeyword = /\b(tokens?|coins?|crypto)\b/i.test(content)|| /(токен|токен.|токен..|монет..|монет.|монет)/i.test(content);;

        return hasTopKeyword && (hasBoostedKeyword || hasTokensKeyword);
    }

    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State,
        _options: { [key: string]: unknown } = {},
        callback?: HandlerCallback
    ): Promise<boolean> {
        elizaLogger.log("Starting GET_TOP_BOOSTED_TOKENS handler...");

        try {
            const response = await fetch(
                "https://api.dexscreener.com/token-boosts/top/v1",
                {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tokens: TokenProfile[] = await response.json();

            const formattedOutput = tokens
                .map((token) => {
                   const [website, twitter, tg] = token.links
        const description = token.description || "-";
        return `${token.chainId}
[📜${token.tokenAddress}](${token.url})
${website?(`[🌐Сайт](${website.url})`): ("")}${twitter?(`\n[🟢X](${twitter.url})`): ("")}${tg?(`\n[🔵Telegram](${tg.url})`): ("")}   
Description: ${description}

`;})
                .join("");

            await createTokenMemory(runtime, message, formattedOutput);

            if (callback) {
                await callback({
                    text: formattedOutput,
                    action: this.name,
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error fetching top boosted tokens:", error);

            if (callback) {
                await callback({
                    text: `Failed to fetch top boosted tokens: ${error.message}`,
                    action: this.name,
                });
            }

            return false;
        }
    }

    examples = [
    [
      {
        user: "{{user1}}",
        content: {
          text: "покажи топовые токены с бустом"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here are the tokens with the most active boosts on DexScreener...",
          action: "GET_TOP_BOOSTED_TOKENS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "покажи токены в топе с бустом"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here are the tokens with the most active boosts on DexScreener...",
          action: "GET_TOP_BOOSTED_TOKENS"
        }
      }
    ]
  ];
}

export const latestTokensAction = new LatestTokensAction();
export const latestBoostedTokensAction = new LatestBoostedTokensAction();
export const topBoostedTokensAction = new TopBoostedTokensAction();
