# Frontend Development Guide

이 문서는 프로젝트의 프론트엔드 개발 가이드라인입니다. 좋은 코드의 기준, 자주
하는 실수, 그리고 우리 프로젝트의 핵심 아키텍처 패턴을 설명합니다.

## 1. 좋은 코드의 기준

좋은 프론트엔드 코드는 **"변경하기 쉬운 코드"**입니다. 오류 없이 동작하고 편리한
사용자 경험을 제공하는 것은 기본이며, 그 위에서 우리는 다음을 최우선으로
고려합니다.

> **"이 코드는 변경하기 쉬운 코드인가?"**

코드 품질의 4가지 각도(가독성, 예측 가능성, 응집도, 결합도)를 항상 고려하여
설계합니다.

## 2. 자주 하는 실수와 대안

### 2.1 불필요한 추상화

별도 로직 없이 단순히 Hook을 감싸기만 하는 추상화는 지양합니다.

**❌ Bad:**

```tsx
export function useRestockWishlistProducts() {
	return useNotificationProducts("RESTOCK");
}
```

**✅ Good:** 사용처에서 직접 `useNotificationProducts("RESTOCK")`를 사용합니다.

### 2.2 과도한 추상화 (Hook에 사이드이펙트 포함)

Hook 안에서 라우팅, 토스트 메시지 등 모든 사이드이펙트를 처리하면 재사용성이
떨어지고 디버깅이 어렵습니다. Hook은 데이터와 상태만 반환하고, 사이드이펙트는
컴포넌트(이벤트 핸들러)에서 처리합니다.

**❌ Bad:**

```tsx
function useDeleteNotification() {
	const router = useRouter();
	return async (id) => {
		await api.delete(id);
		router.push("/list"); // Hook 내부에서 라우팅 처리
	};
}
```

**✅ Good:**

```tsx
function useDeleteNotification() {
	return useMutation({ mutationFn: (id) => api.delete(id) });
}

function Component() {
	const { mutate } = useDeleteNotification();
	const router = useRouter();

	const handleDelete = () => {
		mutate(id, {
			onSuccess: () => router.push("/list"), // 컴포넌트에서 사이드이펙트 처리
		});
	};
}
```

## 3. 아키텍처 및 패턴

### 3.1 API Instance

Axios를 사용하여 API 인스턴스를 관리합니다. 인증이 필요한 요청과 그렇지 않은
요청을 구분합니다.

- `publicApi`: 인증 불필요
- `authenticatedApi`: 인증 토큰 자동 포함 (Interceptor 활용)

### 3.2 Server State (React Query)

서버 데이터는 React Query(`@tanstack/react-query`)를 사용하여 관리합니다.

- **Query Keys**: `QUERY_KEYS` 상수를 만들어 구조적으로 관리합니다.
- **Query Options**: `queryOptions` 헬퍼를 사용하여 쿼리 설정을 한곳에서
  관리합니다.
- **useSuspenseQuery**: 데이터가 반드시 필요한 컴포넌트에서는
  `useSuspenseQuery`를 사용하여 로딩 상태 처리를 Suspense에 위임합니다.

### 3.3 에러 처리

- **Global/Page Level**: `ErrorBoundary`를 사용하여 렌더링 중 발생하는 에러를
  포착합니다.
- **Event Handler**: `try-catch` 또는 `mutate`의 `onError` 콜백을 사용하여
  사용자 상호작용 중 발생하는 에러를 처리합니다.

### 3.4 상태 관리 원칙

1. **Server State**: React Query (대부분의 데이터)
2. **Form State**: React Hook Form (입력 폼)
3. **URL State**: URL Search Params (필터, 페이지네이션 등 공유/새로고침 시
   유지되어야 하는 상태)
4. **Local State**: `useState`, `useReducer` (단일 컴포넌트 UI 상태)
5. **Global State**: Zustand, Context API (정말 필요한 전역 상태만 최소한으로
   사용)

## 4. 디렉토리 구조

```
app/              # Next.js App Router
components/       # UI 컴포넌트
  ui/             # 공통 UI 컴포넌트 (Button, Input 등)
  feature/        # 기능별 컴포넌트
hooks/            # 커스텀 Hooks
lib/
  api/            # API 정의 및 Axios 인스턴스
  types/          # 타입 정의
  utils/          # 유틸리티 함수
```
