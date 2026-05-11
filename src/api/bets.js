import { apiRequest } from "./client";

export const betsApi = {
  async bet(pollId, { optionId, amount }) {
    if (optionId !== "A" && optionId !== "B") {
      throw new Error("배팅 선택 정보가 없습니다.");
    }
    return apiRequest(`/bets/${pollId}/bet`, {
      method: "POST",
      body: JSON.stringify({ optionId, amount }),
    });
  },
};
