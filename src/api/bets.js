import { apiRequest } from "./client";

export const betsApi = {
  async bet(pollId, { optionId, amount }) {
    return apiRequest(`/bets/${pollId}/bet`, {
      method: "POST",
      body: JSON.stringify({ optionId, amount }),
    });
  },
};
