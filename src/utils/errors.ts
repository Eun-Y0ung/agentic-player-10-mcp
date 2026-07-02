export class UserSafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserSafeError";
  }
}

export const missingApiKeyMessage = "사람인 API 키가 설정되지 않았습니다.";
export const apiFailureMessage = "채용 공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
