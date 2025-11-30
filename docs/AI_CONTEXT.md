# AI Context for Frontend Development

이 문서는 AI가 코드를 생성할 때 따라야 할 핵심 규칙을 요약한 것입니다.

## Core Principles

1. **Changeability**: 코드는 변경하기 쉬워야 합니다. 가독성과 예측 가능성을
   최우선으로 합니다.
2. **No Over-Abstraction**: 불필요한 Wrapper Hook을 만들지 마세요.
3. **Separation of Concerns**: Hook은 로직과 상태만 제공하고, UI
   사이드이펙트(라우팅, 토스트 등)는 컴포넌트에서 처리합니다.

## Tech Stack & Patterns

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (`@tanstack/react-query`)
- **HTTP Client**: Axios
- **Form**: React Hook Form
- **State Management**: Zustand (Global), React Query (Server), URL Params
  (Shareable UI State)

## Coding Rules

### 1. React Query Usage

- 항상 `queryOptions`를 사용하여 쿼리 설정을 분리하세요.
- Query Key는 `QUERY_KEYS` 객체로 중앙 관리하세요.
- 컴포넌트 내에서 `useSuspenseQuery` 사용을 권장합니다 (가능한 경우).

### 2. API Calls

- `lib/api/instance.ts`에 정의된 `publicApi` 또는 `authenticatedApi`를
  사용하세요.
- API 함수는 `lib/api/` 디렉토리에 정의하세요.

### 3. Component Structure

- 컴포넌트는 가능한 작게 유지하세요.
- 비즈니스 로직이 복잡해지면 Custom Hook으로 분리하되, 사이드이펙트는 컴포넌트에
  남겨두세요.

### 4. Error Handling

- 비동기 작업의 에러는 `try-catch`나 `onError` 콜백에서 명시적으로 처리하고,
  사용자에게 피드백(Toast 등)을 제공하세요.
