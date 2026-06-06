import { apiRequest } from "./client";

export const titlesApi = {
  async shop() {
    return apiRequest("/titles/shop");
  },

  async inventory() {
    return apiRequest("/titles/inventory");
  },

  async purchase(titleId) {
    return apiRequest(`/titles/${titleId}/purchase`, {
      method: "POST",
    });
  },

  async equip(titleId) {
    return apiRequest("/titles/equipped", {
      method: "PUT",
      body: JSON.stringify({ titleId }),
    });
  },

  async unequip() {
    return apiRequest("/titles/equipped", {
      method: "PUT",
      body: JSON.stringify({ titleId: null }),
    });
  },
};
