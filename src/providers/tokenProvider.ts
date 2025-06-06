import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";

interface DexScreenerPair {
    baseToken: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
    };
    priceUsd: string;
    liquidity?: {
        usd: string;
    };
    volume?: {
        h24: number;
    };
}

export class TokenPriceProvider implements Provider {
    async get(
        _lengthruntime: IAgentRuntime,
        message: Memory,
        _state?: State
    ): Promise<string> {
        try {
            const content =
                typeof message.content === "string"
                    ? message.content
                    : message.content?.text;

            if (!content) {
                throw new Error("No message content provided");
            }

            // Extract token from content
            const tokenIdentifier = this.extractToken(content);
            if (!tokenIdentifier) {
                // throw new Error("Could not identify token in message");
                return
            }

            console.log(`Fetching price for token: ${tokenIdentifier}`);

            // Make API request
            const isAddress =
                /^0x[a-fA-F0-9]{40}$/.test(tokenIdentifier) ||
                /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(tokenIdentifier); // validates for ethAddress and solAddress
            const endpoint = isAddress
                ? `https://api.dexscreener.com/latest/dex/tokens/${tokenIdentifier}`
                : `https://api.dexscreener.com/latest/dex/search?q=${tokenIdentifier}`;

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.pairs || data.pairs.length === 0) {
                throw new Error(`No pricing data found for ${tokenIdentifier}`);
            }

            // Get best pair by liquidity
            const bestPair = this.getBestPair(data.pairs);
            return this.formatPriceData(bestPair);
        } catch (error) {
            console.error("TokenPriceProvider error:", error);
            return `Error: ${error.message}`;
        }
    }

    private extractToken(content: string): string | null {
        // Try different patterns in order of specificity
        const patterns = [
            /0x[a-fA-F0-9]{40}/, // ETH address
            /[$#]([a-zA-Z0-9]+)/, // $TOKEN or #TOKEN
            /(?:price|value|worth|cost)\s+(?:of|for)\s+([a-zA-Z0-9]+)/i, // "price of TOKEN"
            /(?:цена|стоимость|стоит)\s+([a-zA-Z0-9]+)/i, //цена
            /\b(?:of|for)\s+([a-zA-Z0-9]+)\b/i, // "of TOKEN"
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                // Use captured group if it exists, otherwise use full match
                const token = match[1] || match[0];
                // Clean up the token identifier
                return token.replace(/[$#]/g, "").toLowerCase().trim();
            }
        }

        return null;
    }

    private getBestPair(pairs: DexScreenerPair[]): DexScreenerPair {
        return pairs.reduce((best, current) => {
            const bestLiquidity = Number.parseFloat(best.liquidity?.usd || "0");
            const currentLiquidity = Number.parseFloat(current.liquidity?.usd || "0");
            return currentLiquidity > bestLiquidity ? current : best;
        }, pairs[0]);
    }

    private formatPriceData(pair: DexScreenerPair): string {
        const price = Number.parseFloat(pair.priceUsd).toFixed(6);
        const liquidity = Number.parseFloat(
            pair.liquidity?.usd || "0"
        ).toLocaleString();
        const volume = (pair.volume?.h24 || 0).toLocaleString();

        return `
        ${pair.baseToken.symbol} стоит $${price}\nЛиквидность: $${liquidity}\nОбъем за сутки: $${volume}.`;
    }
}

export const tokenPriceProvider = new TokenPriceProvider();
