var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/providers/tokenProvider.ts
var TokenPriceProvider = class {
  async get(_lengthruntime, message, _state) {
    var _a;
    try {
      const content = typeof message.content === "string" ? message.content : (_a = message.content) == null ? void 0 : _a.text;
      if (!content) {
        throw new Error("No message content provided");
      }
      const tokenIdentifier = this.extractToken(content);
      if (!tokenIdentifier) {
        return;
      }
      console.log(`Fetching price for token: ${tokenIdentifier}`);
      const isAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenIdentifier) || /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(tokenIdentifier);
      const endpoint = isAddress ? `https://api.dexscreener.com/latest/dex/tokens/${tokenIdentifier}` : `https://api.dexscreener.com/latest/dex/search?q=${tokenIdentifier}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No pricing data found for ${tokenIdentifier}`);
      }
      const bestPair = this.getBestPair(data.pairs);
      return this.formatPriceData(bestPair);
    } catch (error) {
      console.error("TokenPriceProvider error:", error);
      return `Error: ${error.message}`;
    }
  }
  extractToken(content) {
    const patterns = [
      /0x[a-fA-F0-9]{40}/,
      // ETH address
      /[$#]([a-zA-Z0-9]+)/,
      // $TOKEN or #TOKEN
      /(?:price|value|worth|cost)\s+(?:of|for)\s+([a-zA-Z0-9]+)/i,
      // "price of TOKEN"
      /(?:цена|стоимость|стоит)\s+([a-zA-Z0-9]+)/i,
      //цена
      /\b(?:of|for)\s+([a-zA-Z0-9]+)\b/i
      // "of TOKEN"
    ];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const token = match[1] || match[0];
        return token.replace(/[$#]/g, "").toLowerCase().trim();
      }
    }
    return null;
  }
  getBestPair(pairs) {
    return pairs.reduce((best, current) => {
      var _a, _b;
      const bestLiquidity = Number.parseFloat(((_a = best.liquidity) == null ? void 0 : _a.usd) || "0");
      const currentLiquidity = Number.parseFloat(((_b = current.liquidity) == null ? void 0 : _b.usd) || "0");
      return currentLiquidity > bestLiquidity ? current : best;
    }, pairs[0]);
  }
  formatPriceData(pair) {
    var _a, _b;
    const price = Number.parseFloat(pair.priceUsd).toFixed(6);
    const liquidity = Number.parseFloat(
      ((_a = pair.liquidity) == null ? void 0 : _a.usd) || "0"
    ).toLocaleString();
    const volume = (((_b = pair.volume) == null ? void 0 : _b.h24) || 0).toLocaleString();
    return `
        ${pair.baseToken.symbol} \u0441\u0442\u043E\u0438\u0442 $${price}
\u041B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u044C: $${liquidity}
\u041E\u0431\u044A\u0435\u043C \u0437\u0430 \u0441\u0443\u0442\u043A\u0438: $${volume}.`;
  }
};
var tokenPriceProvider = new TokenPriceProvider();

// src/actions/tokenAction.ts
var priceTemplate = `\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u0446\u0435\u043D\u0443 \u0442\u043E\u043A\u0435\u043D\u0430. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:

\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0446\u0435\u043D\u0443 \u0442\u043E\u043A\u0435\u043D\u0430"
- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 "\u0446\u0435\u043D\u0430", "\u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C", "\u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044C", "\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u043E\u0438\u0442" \u0418 \u0441\u0438\u043C\u0432\u043E\u043B/\u0430\u0434\u0440\u0435\u0441 \u0442\u043E\u043A\u0435\u043D\u0430
- \u041F\u0440\u0438\u043C\u0435\u0440: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u043E\u0438\u0442 ETH?", "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u043E\u0438\u0442 0xfbd2bc331233f9747d5aa57b0cdf8e0289ca4444?" \u0438\u043B\u0438 "\u041A\u0430\u043A\u043E\u0432\u0430 \u0446\u0435\u043D\u0430 BTC?"
- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: \u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u0446\u0435\u043D\u0443 \u0442\u043E\u043A\u0435\u043D\u0430

\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:
{{conversation}}

\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}
`;
var TokenPriceAction = class {
  name = "GET_TOKEN_PRICE";
  similes = ["FETCH_TOKEN_PRICE", "CHECK_TOKEN_PRICE", "TOKEN_PRICE"];
  description = "Fetches and returns token price information";
  suppressInitialMessage = true;
  template = priceTemplate;
  async validate(_runtime, message) {
    var _a;
    const content = typeof message.content === "string" ? message.content : (_a = message.content) == null ? void 0 : _a.text;
    if (!content) return false;
    const hasPriceKeyword = /\b(price|value|worth|cost)\b/i.test(content) || /(цен.|стоимость|стоит.)/i.test(content);
    ;
    const hasToken = /0x[a-fA-F0-9]{40}/.test(content) || /[$#]?[a-zA-Z0-9]+/i.test(content);
    return hasPriceKeyword && hasToken;
  }
  async handler(runtime, message, state, _options = {}, callback) {
    try {
      const provider = runtime.providers.find((p) => p instanceof TokenPriceProvider);
      if (!provider) {
        throw new Error("Token price provider not found");
      }
      console.log("Fetching price data...");
      const priceData = await provider.get(runtime, message, state);
      console.log("Received price data:", priceData);
      if (priceData.includes("Error")) {
        throw new Error(priceData);
      }
      if (callback) {
        await callback({
          text: priceData,
          action: this.name
        });
      }
      if (state) {
        state.responseData = {
          text: priceData,
          action: this.name
        };
      }
      return true;
    } catch (error) {
      console.error("Error in price action handler:", error);
      if (callback) {
        await callback({
          text: `Sorry, I couldn't fetch the token price: ${error.message}`,
          action: this.name
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
          text: "check price of eth"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "ETH: $2\u202F345,67 (+5,43% \u0437\u0430 24\u0447)\n \u041E\u0431\u044A\u0451\u043C $9,87B \n \u041B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u044C $1,23B.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "\u0446\u0435\u043D\u0430 eth"
        }
      },
      {
        user: "{{agent1}}",
        content: {
          text: "ETH: $2\u202F345,67 (+5,43% \u0437\u0430 24\u0447)\n \u041E\u0431\u044A\u0451\u043C $9,87B \n \u041B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u044C $1,23B.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u0447\u0430\u0441 \u0441\u0442\u043E\u0438\u0442 BTC?"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "BTC: $42\u202F567,89 (+2,15% \u0437\u0430 24\u0447) \n \u041E\u0431\u044A\u0451\u043C: $25,87B \n \u041B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u044C: $15,23B.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "what's the current value of $bnb"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Binance Coin (BNB) is priced at $345.67 with $5.23B in liquidity. The trading volume over the last 24h is $1.87B, and the price has decreased by 1.23% during this period.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "can you tell me the price for USDT?"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Tether (USDT) is maintaining its peg at $1.00 with minimal change (+0.01%). The token has $25.23B in liquidity and has seen $45.87B in trading volume over the past 24 hours.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "show me the cost of #SOL"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Solana (SOL) is trading at $123.45, showing strong momentum with an 8.75% increase in the last 24 hours. The liquidity stands at $3.23B with a 24h trading volume of $987.54M.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0 \u0446\u0435\u043D\u0430"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "The price of Polygon (MATIC) is currently $1.23, up 3.45% in the past 24 hours. The token has $2.23B in liquidity and has seen $567.54M in trading volume today.",
          action: "GET_TOKEN_PRICE"
        }
      }
    ]
  ];
};
var tokenPriceAction = new TokenPriceAction();

// src/evaluators/tokenEvaluator.ts
var TokenPriceEvaluator = class {
  name = "TOKEN_PRICE_EVALUATOR";
  similes = ["price", "token price", "check price"];
  description = "Evaluates messages for token price requests";
  async validate(runtime, message) {
    var _a;
    const content = typeof message.content === "string" ? message.content : (_a = message.content) == null ? void 0 : _a.text;
    if (!content) return false;
    const hasPriceKeyword = /\b(price|value|worth|cost)\b/i.test(content) || /(цен.|стоимость|стоит.)/i.test(content);
    ;
    const hasToken = /0x[a-fA-F0-9]{40}/.test(content) || // Ethereum address
    /[$#][a-zA-Z]+/.test(content) || // $TOKEN or #TOKEN format
    /\b(of|for)\s+[a-zA-Z0-9]+\b/i.test(content);
    return hasPriceKeyword && hasToken;
  }
  async handler(_runtime, _message, _state) {
    return "GET_TOKEN_PRICE";
  }
  examples = [
    {
      context: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0445\u043E\u0447\u0435\u0442 \u0443\u0437\u043D\u0430\u0442\u044C \u0446\u0435\u043D\u0443 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0430\u0434\u0440\u0435\u0441\u0430",
      messages: [
        {
          user: "{{user1}}",
          content: {
            text: "\u0426\u0435\u043D\u0430 0x1234567890123456789012345678901234567890?",
            action: "GET_TOKEN_PRICE"
          }
        }
      ],
      outcome: "GET_TOKEN_PRICE"
    },
    {
      context: "User checking token price with $ symbol",
      messages: [
        {
          user: "{{user1}}",
          content: {
            text: "Check price of $eth",
            action: "GET_TOKEN_PRICE"
          }
        }
      ],
      outcome: "GET_TOKEN_PRICE"
    },
    {
      context: "User checking token price with plain symbol",
      messages: [
        {
          user: "{{user1}}",
          content: {
            text: "What's the value for btc",
            action: "GET_TOKEN_PRICE"
          }
        }
      ],
      outcome: "GET_TOKEN_PRICE"
    }
  ];
};
var tokenPriceEvaluator = new TokenPriceEvaluator();

// src/actions/trendsAction.ts
import {
  elizaLogger,
  getEmbeddingZeroVector
} from "@elizaos/core";
var createTokenMemory = async (runtime, _message, formattedOutput) => {
  const memory = {
    userId: _message.userId,
    agentId: _message.agentId,
    roomId: _message.roomId,
    content: { text: formattedOutput },
    createdAt: Date.now(),
    embedding: getEmbeddingZeroVector()
  };
  await runtime.messageManager.createMemory(memory);
};
var latestTokensTemplate = `\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:

\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B"
- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 "\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435", "\u043D\u043E\u0432\u044B\u0435", "\u0441\u0432\u0435\u0436\u0438\u0435" \u0418 "\u0442\u043E\u043A\u0435\u043D\u044B"
- \u041F\u0440\u0438\u043C\u0435\u0440: "\u041F\u043E\u043A\u0430\u0436\u0438 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B" \u0438\u043B\u0438 "\u041A\u0430\u043A\u0438\u0435 \u043D\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u043E\u044F\u0432\u0438\u043B\u0438\u0441\u044C?"
- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: \u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u0430\u043C\u044B\u0445 \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432

\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:
{{conversation}}

\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}
`;
var LatestTokensAction = class {
  name = "GET_LATEST_TOKENS";
  similes = ["FETCH_NEW_TOKENS", "CHECK_RECENT_TOKENS", "LIST_NEW_TOKENS"];
  description = "Get the latest tokens from DexScreener API";
  suppressInitialMessage = true;
  template = latestTokensTemplate;
  async validate(_runtime, message) {
    var _a;
    const content = typeof message.content === "string" ? message.content : (_a = message.content) == null ? void 0 : _a.text;
    if (!content) return false;
    const hasLatestKeyword = /\b(latest|new|recent)\b/i.test(content) || /(последн..|нов..|недавн..)/i.test(content);
    ;
    const hasTokensKeyword = /\b(tokens?|coins?|crypto)\b/i.test(content) || /(токен|токен.|токен..|монет..|монет.|монет)/i.test(content);
    ;
    return hasLatestKeyword && hasTokensKeyword;
  }
  async handler(runtime, message, _state, _options = {}, callback) {
    elizaLogger.log("Starting GET_LATEST_TOKENS handler...");
    try {
      const response = await fetch(
        "https://api.dexscreener.com/token-profiles/latest/v1",
        {
          method: "GET",
          headers: {
            accept: "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tokens = await response.json();
      const partialTokens = await tokens.filter((item) => item.chainId !== "solana");
      const formattedOutput = partialTokens.map((token) => {
        const [website, twitter, tg] = token.links;
        const description = token.description || "-";
        return `${token.chainId} 
[\u{1F4DC}${token.tokenAddress}](${token.url})
${website ? `[\u{1F310}\u0421\u0430\u0439\u0442](${website.url})` : ""}${twitter ? `
[\u{1F7E2}X](${twitter.url})` : ""}${tg ? `
[\u{1F535}Telegram](${tg.url})` : ""}
Description: ${description}
 \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014 
`;
      }).join("");
      await createTokenMemory(runtime, message, formattedOutput);
      if (callback) {
        await callback({
          text: formattedOutput,
          action: this.name
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error("Error fetching latest tokens:", error);
      if (callback) {
        await callback({
          text: `Failed to fetch latest tokens: ${error.message}`,
          action: this.name
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
          text: "\u043F\u043E\u043A\u0430\u0436\u0438 \u043C\u043D\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B"
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
          text: "\u0441\u043F\u0438\u0441\u043E\u043A \u043D\u043E\u0432\u044B\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432"
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
          text: "\u0441\u043F\u0438\u0441\u043E\u043A \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432"
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
};
var latestBoostedTemplate = `\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:

\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0435\u043C\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B"
- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 "\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435", "\u043D\u043E\u0432\u044B\u0435", "\u0431\u0443\u0441\u0442\u044F\u0442","\u0441\u0432\u0435\u0436\u0438\u0435", "\u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C" \u0418 "\u0431\u0443\u0441\u0442 \u0442\u043E\u043A\u0435\u043D\u044B"
- \u041F\u0440\u0438\u043C\u0435\u0440: "\u041F\u043E\u043A\u0430\u0436\u0438 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0435\u043C\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B" \u0438\u043B\u0438 "\u041A\u0430\u043A\u0438\u0435 \u043D\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u044E\u0442\u0441\u044F?"
- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: GET_LATEST_BOOSTED_TOKENS

\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:
{{conversation}}

\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}
`;
var LatestBoostedTokensAction = class {
  name = "GET_LATEST_BOOSTED_TOKENS";
  similes = [
    "FETCH_NEW_BOOSTED_TOKENS",
    "CHECK_RECENT_BOOSTED_TOKENS",
    "LIST_NEW_BOOSTED_TOKENS"
  ];
  description = "Get the latest boosted tokens from DexScreener API";
  suppressInitialMessage = true;
  template = latestBoostedTemplate;
  async validate(_runtime, message) {
    var _a;
    const content = typeof message.content === "string" ? message.content : (_a = message.content) == null ? void 0 : _a.text;
    if (!content) return false;
    const hasLatestKeyword = /\b(latest|new|recent)\b/i.test(content) || /(последн..|нов..|недавн..)/i.test(content);
    ;
    const hasBoostedKeyword = /\b(boosted|promoted|featured)\b/i.test(content) || /(буст|буст..|продвигаем..|продвижен..)/i.test(content);
    ;
    const hasTokensKeyword = /\b(tokens?|coins?|crypto)\b/i.test(content) || /(токен|токен.|токен..|монет..|монет.|монет)/i.test(content);
    ;
    return hasLatestKeyword && (hasBoostedKeyword || hasTokensKeyword);
  }
  async handler(runtime, message, _state, _options = {}, callback) {
    elizaLogger.log("Starting GET_LATEST_BOOSTED_TOKENS handler...");
    try {
      const response = await fetch(
        "https://api.dexscreener.com/token-boosts/latest/v1",
        {
          method: "GET",
          headers: {
            accept: "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tokens = await response.json();
      const partialTokens = await tokens.filter((item) => item.chainId !== "solana");
      const formattedOutput = partialTokens.map((token) => {
        const description = token.description || "";
        const [website, twitter, tg] = token.links;
        return `${token.chainId} 
[\u{1F4DC}${token.tokenAddress}](${token.url})
${website ? `[\u{1F310}\u0421\u0430\u0439\u0442](${website.url})` : ""}${twitter ? `
[\u{1F7E2}X](${twitter.url})` : ""}${tg ? `
[\u{1F535}Telegram](${tg.url})` : ""}
Description: ${description}
 \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014 
`;
      }).join("");
      await createTokenMemory(runtime, message, formattedOutput);
      if (callback) {
        await callback({
          text: formattedOutput,
          action: this.name
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error("Error fetching latest boosted tokens:", error);
      if (callback) {
        await callback({
          text: `Failed to fetch latest boosted tokens: ${error.message}`,
          action: this.name
        });
      }
      return false;
    }
  }
  examples = [
    [
      {
        user: "{{user}}",
        content: {
          text: "\u043F\u043E\u043A\u0430\u0436\u0438 \u0441\u043F\u0438\u0441\u043E\u043A \u043D\u043E\u0432\u044B\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u043F\u0440\u043E\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435\u043C"
        }
      },
      {
        user: "{{system}}",
        content: {
          text: "\u0421\u043F\u0438\u0441\u043E\u043A \u043D\u043E\u0432\u044B\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u043F\u0440\u043E\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435\u043C",
          action: "GET_LATEST_BOOSTED_TOKENS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "\u043D\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "\u043D\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C",
          action: "GET_LATEST_BOOSTED_TOKENS"
        }
      }
    ]
  ];
};
var topBoostedTemplate = `\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u0442\u043E\u043F \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:

\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u043E\u043F \u0442\u043E\u043A\u0435\u043D\u043E\u0432 c \u0431\u0443\u0441\u0442\u043E\u043C"
- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 "\u0432 \u0442\u043E\u043F\u0435", "\u043B\u0438\u0434\u0440\u0443\u044E\u0449\u0438\u0435", "\u0442\u043E\u043F", "\u043B\u0443\u0447\u0448\u0438\u0435", "\u0441\u0430\u043C\u044B\u0435","\u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0435\u043C\u044B\u0435" \u0418 "\u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C"
- \u041F\u0440\u0438\u043C\u0435\u0440: "\u041F\u043E\u043A\u0430\u0436\u0438 \u0442\u043E\u043F \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C", "\u043B\u0438\u0434\u0438\u0440\u0443\u044E\u0449\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C" \u0438\u043B\u0438 "\u041A\u0430\u043A\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u044E\u0442\u0441\u044F \u0431\u043E\u043B\u044C\u0448\u0435 \u0432\u0441\u0435\u0433\u043E?"
- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: GET_TOP_BOOSTED_TOKENS

\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:
{{conversation}}

\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}
`;
var TopBoostedTokensAction = class {
  name = "GET_TOP_BOOSTED_TOKENS";
  similes = [
    "FETCH_MOST_BOOSTED_TOKENS",
    "CHECK_HIGHEST_BOOSTED_TOKENS",
    "LIST_TOP_BOOSTED_TOKENS"
  ];
  description = "Get tokens with most active boosts from DexScreener API";
  suppressInitialMessage = true;
  template = topBoostedTemplate;
  async validate(_runtime, message) {
    var _a;
    const content = typeof message.content === "string" ? message.content : (_a = message.content) == null ? void 0 : _a.text;
    if (!content) return false;
    const hasTopKeyword = /\b(top|best|most)\b/i.test(content) || /(топ|топ.|топовы.)/i.test(content);
    ;
    const hasBoostedKeyword = /\b(boosted|promoted|featured)\b/i.test(content) || /(буст|буст..|продвигаем..|продвижен..)/i.test(content);
    ;
    const hasTokensKeyword = /\b(tokens?|coins?|crypto)\b/i.test(content) || /(токен|токен.|токен..|монет..|монет.|монет)/i.test(content);
    ;
    return hasTopKeyword && (hasBoostedKeyword || hasTokensKeyword);
  }
  async handler(runtime, message, _state, _options = {}, callback) {
    elizaLogger.log("Starting GET_TOP_BOOSTED_TOKENS handler...");
    try {
      const response = await fetch(
        "https://api.dexscreener.com/token-boosts/top/v1",
        {
          method: "GET",
          headers: {
            accept: "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tokens = await response.json();
      const partialTokens = await tokens.filter((item) => item.chainId !== "solana");
      const formattedOutput = partialTokens.map((token) => {
        const [website, twitter, tg] = token.links;
        const description = token.description || "-";
        return `${token.chainId} 
[\u{1F4DC}${token.tokenAddress}](${token.url})
${website ? `[\u{1F310}\u0421\u0430\u0439\u0442](${website.url})` : ""}${twitter ? `
[\u{1F7E2}X](${twitter.url})` : ""}${tg ? `
[\u{1F535}Telegram](${tg.url})` : ""}
Description: ${description}
 \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014 
`;
      }).join("");
      await createTokenMemory(runtime, message, formattedOutput);
      if (callback) {
        await callback({
          text: formattedOutput,
          action: this.name
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error("Error fetching top boosted tokens:", error);
      if (callback) {
        await callback({
          text: `Failed to fetch top boosted tokens: ${error.message}`,
          action: this.name
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
          text: "\u043F\u043E\u043A\u0430\u0436\u0438 \u0442\u043E\u043F\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C"
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
          text: "\u043F\u043E\u043A\u0430\u0436\u0438 \u0442\u043E\u043A\u0435\u043D\u044B \u0432 \u0442\u043E\u043F\u0435 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C"
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
};
var latestTokensAction = new LatestTokensAction();
var latestBoostedTokensAction = new LatestBoostedTokensAction();
var topBoostedTokensAction = new TopBoostedTokensAction();

// src/actions/index.ts
var actions_exports = {};
__export(actions_exports, {
  LatestBoostedTokensAction: () => LatestBoostedTokensAction,
  LatestTokensAction: () => LatestTokensAction,
  TokenPriceAction: () => TokenPriceAction,
  TopBoostedTokensAction: () => TopBoostedTokensAction,
  latestBoostedTemplate: () => latestBoostedTemplate,
  latestBoostedTokensAction: () => latestBoostedTokensAction,
  latestTokensAction: () => latestTokensAction,
  latestTokensTemplate: () => latestTokensTemplate,
  priceTemplate: () => priceTemplate,
  tokenPriceAction: () => tokenPriceAction,
  topBoostedTemplate: () => topBoostedTemplate,
  topBoostedTokensAction: () => topBoostedTokensAction
});

// src/evaluators/index.ts
var evaluators_exports = {};
__export(evaluators_exports, {
  TokenPriceEvaluator: () => TokenPriceEvaluator,
  tokenPriceEvaluator: () => tokenPriceEvaluator
});

// src/providers/index.ts
var providers_exports = {};
__export(providers_exports, {
  TokenPriceProvider: () => TokenPriceProvider,
  tokenPriceProvider: () => tokenPriceProvider
});

// src/index.ts
var dexScreenerPlugin = {
  name: "dexscreener",
  description: "Dex Screener Plugin with Token Price Action, Token Trends, Evaluators and Providers",
  actions: [new TokenPriceAction(), new LatestTokensAction(), new LatestBoostedTokensAction(), new TopBoostedTokensAction()],
  evaluators: [new TokenPriceEvaluator()],
  providers: [new TokenPriceProvider()]
};
var index_default = dexScreenerPlugin;
export {
  actions_exports as actions,
  index_default as default,
  dexScreenerPlugin,
  evaluators_exports as evaluators,
  providers_exports as providers
};
//# sourceMappingURL=index.js.map