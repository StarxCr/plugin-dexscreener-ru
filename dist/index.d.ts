import { Action, IAgentRuntime, Memory, State, HandlerCallback, Evaluator, Provider, Plugin } from '@elizaos/core';

declare const priceTemplate = "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u0446\u0435\u043D\u0443 \u0442\u043E\u043A\u0435\u043D\u0430. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:\n\n\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: \"\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0446\u0435\u043D\u0443 \u0442\u043E\u043A\u0435\u043D\u0430\"\n- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 \"\u0446\u0435\u043D\u0430\", \"\u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C\", \"\u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044C\", \"\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u043E\u0438\u0442\" \u0418 \u0441\u0438\u043C\u0432\u043E\u043B/\u0430\u0434\u0440\u0435\u0441 \u0442\u043E\u043A\u0435\u043D\u0430\n- \u041F\u0440\u0438\u043C\u0435\u0440: \"\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u043E\u0438\u0442 ETH?\", \"\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u043E\u0438\u0442 0xfbd2bc331233f9747d5aa57b0cdf8e0289ca4444?\" \u0438\u043B\u0438 \"\u041A\u0430\u043A\u043E\u0432\u0430 \u0446\u0435\u043D\u0430 BTC?\"\n- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: \u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u0446\u0435\u043D\u0443 \u0442\u043E\u043A\u0435\u043D\u0430\n\n\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:\n{{conversation}}\n\n\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}\n";
declare class TokenPriceAction implements Action {
    name: string;
    similes: string[];
    description: string;
    suppressInitialMessage: boolean;
    template: string;
    validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean>;
    handler(runtime: IAgentRuntime, message: Memory, state?: State, _options?: {
        [key: string]: unknown;
    }, callback?: HandlerCallback): Promise<boolean>;
    examples: ({
        user: string;
        content: {
            text: string;
            action?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
        };
    })[][];
}
declare const tokenPriceAction: TokenPriceAction;

declare const latestTokensTemplate = "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:\n\n\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: \"\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B\"\n- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 \"\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435\", \"\u043D\u043E\u0432\u044B\u0435\", \"\u0441\u0432\u0435\u0436\u0438\u0435\" \u0418 \"\u0442\u043E\u043A\u0435\u043D\u044B\"\n- \u041F\u0440\u0438\u043C\u0435\u0440: \"\u041F\u043E\u043A\u0430\u0436\u0438 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B\" \u0438\u043B\u0438 \"\u041A\u0430\u043A\u0438\u0435 \u043D\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u043E\u044F\u0432\u0438\u043B\u0438\u0441\u044C?\"\n- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: \u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u0430\u043C\u044B\u0445 \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432\n\n\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:\n{{conversation}}\n\n\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}\n";
declare class LatestTokensAction implements Action {
    name: string;
    similes: string[];
    description: string;
    suppressInitialMessage: boolean;
    template: string;
    validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean>;
    handler(runtime: IAgentRuntime, message: Memory, _state?: State, _options?: {
        [key: string]: unknown;
    }, callback?: HandlerCallback): Promise<boolean>;
    examples: ({
        user: string;
        content: {
            text: string;
            action?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
        };
    })[][];
}
declare const latestBoostedTemplate = "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:\n\n\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: \"\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0435\u043C\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B\"\n- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 \"\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435\", \"\u043D\u043E\u0432\u044B\u0435\", \"\u0431\u0443\u0441\u0442\u044F\u0442\",\"\u0441\u0432\u0435\u0436\u0438\u0435\", \"\u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C\" \u0418 \"\u0431\u0443\u0441\u0442 \u0442\u043E\u043A\u0435\u043D\u044B\"\n- \u041F\u0440\u0438\u043C\u0435\u0440: \"\u041F\u043E\u043A\u0430\u0436\u0438 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0435\u043C\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B\" \u0438\u043B\u0438 \"\u041A\u0430\u043A\u0438\u0435 \u043D\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u044E\u0442\u0441\u044F?\"\n- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: GET_LATEST_BOOSTED_TOKENS\n\n\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:\n{{conversation}}\n\n\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}\n";
declare class LatestBoostedTokensAction implements Action {
    name: string;
    similes: string[];
    description: string;
    suppressInitialMessage: boolean;
    template: string;
    validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean>;
    handler(runtime: IAgentRuntime, message: Memory, _state?: State, _options?: {
        [key: string]: unknown;
    }, callback?: HandlerCallback): Promise<boolean>;
    examples: ({
        user: string;
        content: {
            text: string;
            action?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
        };
    })[][];
}
declare const topBoostedTemplate = "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435, \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C \u043D\u0430 \u0442\u043E\u043F \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043E\u0434\u0438\u043D \u0438\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0447\u0430\u0435\u0432, \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:\n\n\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044F 1: \"\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u043E\u043F \u0442\u043E\u043A\u0435\u043D\u043E\u0432 c \u0431\u0443\u0441\u0442\u043E\u043C\"\n- \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442: \u0441\u043B\u043E\u0432\u0430 \u0432\u0440\u043E\u0434\u0435 \"\u0432 \u0442\u043E\u043F\u0435\", \"\u043B\u0438\u0434\u0440\u0443\u044E\u0449\u0438\u0435\", \"\u0442\u043E\u043F\", \"\u043B\u0443\u0447\u0448\u0438\u0435\", \"\u0441\u0430\u043C\u044B\u0435\",\"\u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0435\u043C\u044B\u0435\" \u0418 \"\u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C\"\n- \u041F\u0440\u0438\u043C\u0435\u0440: \"\u041F\u043E\u043A\u0430\u0436\u0438 \u0442\u043E\u043F \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0441 \u0431\u0443\u0441\u0442\u043E\u043C\", \"\u043B\u0438\u0434\u0438\u0440\u0443\u044E\u0449\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u0441 \u0431\u0443\u0441\u0442\u043E\u043C\" \u0438\u043B\u0438 \"\u041A\u0430\u043A\u0438\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u044E\u0442\u0441\u044F \u0431\u043E\u043B\u044C\u0448\u0435 \u0432\u0441\u0435\u0433\u043E?\"\n- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: GET_TOP_BOOSTED_TOKENS\n\n\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430:\n{{conversation}}\n\n\u0412\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u0435 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: {{message}}\n";
declare class TopBoostedTokensAction implements Action {
    name: string;
    similes: string[];
    description: string;
    suppressInitialMessage: boolean;
    template: string;
    validate(_runtime: IAgentRuntime, message: Memory): Promise<boolean>;
    handler(runtime: IAgentRuntime, message: Memory, _state?: State, _options?: {
        [key: string]: unknown;
    }, callback?: HandlerCallback): Promise<boolean>;
    examples: ({
        user: string;
        content: {
            text: string;
            action?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
        };
    })[][];
}
declare const latestTokensAction: LatestTokensAction;
declare const latestBoostedTokensAction: LatestBoostedTokensAction;
declare const topBoostedTokensAction: TopBoostedTokensAction;

type index$2_LatestBoostedTokensAction = LatestBoostedTokensAction;
declare const index$2_LatestBoostedTokensAction: typeof LatestBoostedTokensAction;
type index$2_LatestTokensAction = LatestTokensAction;
declare const index$2_LatestTokensAction: typeof LatestTokensAction;
type index$2_TokenPriceAction = TokenPriceAction;
declare const index$2_TokenPriceAction: typeof TokenPriceAction;
type index$2_TopBoostedTokensAction = TopBoostedTokensAction;
declare const index$2_TopBoostedTokensAction: typeof TopBoostedTokensAction;
declare const index$2_latestBoostedTemplate: typeof latestBoostedTemplate;
declare const index$2_latestBoostedTokensAction: typeof latestBoostedTokensAction;
declare const index$2_latestTokensAction: typeof latestTokensAction;
declare const index$2_latestTokensTemplate: typeof latestTokensTemplate;
declare const index$2_priceTemplate: typeof priceTemplate;
declare const index$2_tokenPriceAction: typeof tokenPriceAction;
declare const index$2_topBoostedTemplate: typeof topBoostedTemplate;
declare const index$2_topBoostedTokensAction: typeof topBoostedTokensAction;
declare namespace index$2 {
  export { index$2_LatestBoostedTokensAction as LatestBoostedTokensAction, index$2_LatestTokensAction as LatestTokensAction, index$2_TokenPriceAction as TokenPriceAction, index$2_TopBoostedTokensAction as TopBoostedTokensAction, index$2_latestBoostedTemplate as latestBoostedTemplate, index$2_latestBoostedTokensAction as latestBoostedTokensAction, index$2_latestTokensAction as latestTokensAction, index$2_latestTokensTemplate as latestTokensTemplate, index$2_priceTemplate as priceTemplate, index$2_tokenPriceAction as tokenPriceAction, index$2_topBoostedTemplate as topBoostedTemplate, index$2_topBoostedTokensAction as topBoostedTokensAction };
}

declare class TokenPriceEvaluator implements Evaluator {
    name: string;
    similes: string[];
    description: string;
    validate(runtime: IAgentRuntime, message: Memory): Promise<boolean>;
    handler(_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string>;
    examples: {
        context: string;
        messages: {
            user: string;
            content: {
                text: string;
                action: string;
            };
        }[];
        outcome: string;
    }[];
}
declare const tokenPriceEvaluator: TokenPriceEvaluator;

type index$1_TokenPriceEvaluator = TokenPriceEvaluator;
declare const index$1_TokenPriceEvaluator: typeof TokenPriceEvaluator;
declare const index$1_tokenPriceEvaluator: typeof tokenPriceEvaluator;
declare namespace index$1 {
  export { index$1_TokenPriceEvaluator as TokenPriceEvaluator, index$1_tokenPriceEvaluator as tokenPriceEvaluator };
}

declare class TokenPriceProvider implements Provider {
    get(_lengthruntime: IAgentRuntime, message: Memory, _state?: State): Promise<string>;
    private extractToken;
    private getBestPair;
    private formatPriceData;
}
declare const tokenPriceProvider: TokenPriceProvider;

type index_TokenPriceProvider = TokenPriceProvider;
declare const index_TokenPriceProvider: typeof TokenPriceProvider;
declare const index_tokenPriceProvider: typeof tokenPriceProvider;
declare namespace index {
  export { index_TokenPriceProvider as TokenPriceProvider, index_tokenPriceProvider as tokenPriceProvider };
}

declare const dexScreenerPlugin: Plugin;

export { index$2 as actions, dexScreenerPlugin as default, dexScreenerPlugin, index$1 as evaluators, index as providers };
