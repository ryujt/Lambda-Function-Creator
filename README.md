# Lambda-Function-Creator

AWS Lambda 함수를 웹 인터페이스로 손쉽게 생성하고 관리할 수 있는 도구입니다.

## 주요 기능

- 웹 기반 인터페이스로 Lambda 함수 생성
- Node.js 16.x부터 22.x까지 지원
- 서울(ap-northeast-2)과 도쿄(ap-northeast-1) 리전 지원 (나머지는 직접 추가하세요)
- 함수 URL 자동 생성 및 CORS 설정

## 시작하기

### 사전 준비사항

- AWS 계정 및 적절한 IAM 권한
- Node.js 16.x 이상
- npm 또는 yarn

### 설치

1. 저장소를 클론합니다:
```bash
git clone https://github.com/yourusername/lambda-function-creator.git
cd lambda-function-creator
```

2. 의존성을 설치합니다:
```bash
cd backend
npm install
```

### 환경 설정

1. backend/index.mjs에서 다음 값을 수정합니다:
```javascript
const roleArn = '[your-role-arn]'; // Lambda 실행 역할의 ARN으로 변경
```

2. frontend/index.html에서 다음 값을 수정합니다:
```javascript
const baseUrl = '[your-lambda-url]'; // Lambda 함수의 URL로 변경
```

## 사용 방법

1. index.html 파일을 웹 브라우저에서 엽니다.

2. 다음 정보를 입력합니다:
   - Function Name: Lambda 함수 이름
   - Runtime: Node.js 버전 선택
   - Region: 배포할 리전 선택
   - Architecture: 아키텍처 선택 (x86_64 또는 arm64)

3. "Create Lambda Function" 버튼을 클릭하여 함수를 생성합니다.

## 기본 설정

- 메모리: 128MB
- 타임아웃: 30초
- 기본 코드:
```javascript
export const handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
```

## 주의사항

- 생성된 함수는 기본적으로 공개 액세스가 가능합니다
- IAM 역할에 적절한 Lambda 실행 권한이 필요합니다
- 추가 설정은 AWS Console에서 수정 가능합니다

## 라이선스

MIT License
