import { apiRequest } from "./client";

export const logsApi = {
  async votes() {
    return apiRequest("/poll/history");
  },

  async bets() {
    return apiRequest("/bets/history");
  },
};
