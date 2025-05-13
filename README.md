# @elizaos/plugin-dexscreener

Плагин для получения данных о токенах и их ценах с помощью DexScreener через вашего ИИ-агента.

## Installation

```bash
pnpm add StarxCr/plugin-dexscreener-ru
```

## Использование плагина

```typescript
import { dexScreenerPlugin } from "@elizaos/plugin-dexscreener-ru";

const character = {
    plugins: [dexScreenerPlugin]
};
```

## Features

### Token Price Checking
Query token prices using addresses or symbols:
```plaintext
"Какая цена у ETH?"
"Проверь цену 0x1234..."
"Сколько стоит $BTC?"
```

### Token Trends
View latest and trending tokens:
```plaintext
"Покажи последние токены"
"Какие новые продвигаются токены?"
"Покажи самые популярные продвигаемые токены"
```

## Available Actions

### GET_TOKEN_PRICE
Получение текущей цены и рыночной информации о токене.
- Синонимы: `FETCH_TOKEN_PRICE`, `CHECK_TOKEN_PRICE`, `TOKEN_PRICE`
- Поддерживает: Ethereum-адреса, символы токенов с префиксом $ или без
- Возвращает: цену, ликвидность, объём торгов за 24 часа

### GET_LATEST_TOKENS
Получение списка последних добавленных токенов.
- Синонимы: `FETCH_NEW_TOKENS`, `CHECK_RECENT_TOKENS`, `LIST_NEW_TOKENS`
### GET_LATEST_BOOSTED_TOKENS
Получение списка недавно продвигаемых токенов.
- Синонимы: `FETCH_NEW_BOOSTED_TOKENS`, `CHECK_RECENT_BOOSTED_TOKENS`
### GET_TOP_BOOSTED_TOKENS
Получение токенов с наибольшим количеством активных бустов.
- Синонимы: `FETCH_MOST_BOOSTED_TOKENS`, `CHECK_HIGHEST_BOOSTED_TOKENS`


## Providers

### TokenPriceProvider
Источник данных о ценах токенов через DexScreener API:
- Текущая цена в долларах США
- Информация о ликвидности
- Объём торгов за последние 24 часа
- Автоматический выбор лучшей торговой пары по ликвидности

## Evaluators

### TokenPriceEvaluator
Оценивает, является ли сообщение запросом на получение цены токена:
- Распознаёт ключевые слова, связанные с ценами
- Определяет адреса и символы токенов
- Поддерживает разные форматы:
- Ethereum-адреса
- Символы с префиксами $ или #
- Естественные фразы вроде "цена токена"
