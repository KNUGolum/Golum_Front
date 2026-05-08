import { apiRequest, setTokens } from "./client";
import { mapUser } from "./mappers";

export const authApi = {
  async checkEmail(email) {
    return apiRequest("/auth/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async checkNickname(nickname) {
    return apiRequest("/auth/check-nickname", {
      method: "POST",
      body: JSON.stringify({ nickname }),
    });
  },

  async signup({ email, nickname, password }) {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, nickname, password }),
    });
  },

  async signin({ email, password }) {
    const tokenResponse = await apiRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setTokens(tokenResponse);
    return tokenResponse;
  },

  async me() {
    return mapUser(await apiRequest("/auth/me"));
  },
};
