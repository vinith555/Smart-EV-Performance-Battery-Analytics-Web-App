# Evon Text-to-SQL Setup

Evon now supports two fallback modes when prompt patterns are not covered by fixed intents:

1. Built-in text-to-SQL (enabled by default in code)
- Handles common relational prompts such as:
  - "vehicle owned by John Doe"
  - "services for vehicle id 1"
  - "issues for vehicle id 1"

2. LangChain text-to-SQL (optional)
- Enable only when you configure an LLM provider.

## 1) Install Optional Dependencies

Uncomment these in `requirements.txt` and install:

- `langchain`
- `langchain-community`
- `langchain-openai`

## 2) Environment Variables

Add these in backend `.env`:

```env
EVON_TEXT2SQL_ENABLED=True
OPENAI_API_KEY=your_openai_api_key
EVON_LLM_MODEL=gpt-4o-mini
```

## 3) Security Guardrails (already enforced)

Evon blocks unsafe SQL:
- Only `SELECT` / `WITH` queries are allowed
- Mutation keywords are blocked (`INSERT`, `UPDATE`, `DELETE`, etc.)
- Queries touching non-whitelisted tables are blocked
- Multi-statement SQL is blocked

## 4) Recommendation

Keep fixed intents + built-in text-to-SQL as primary path for reliability.
Use LangChain fallback for broader natural-language coverage.
