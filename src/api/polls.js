import { apiRequest } from "./client";
import { mapPollDetail, mapPollListItem } from "./mappers";

export const pollsApi = {
  async list({ filter = "active", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });

    if (filter === "closed") {
      params.set("status", "ended");
      params.set("sort", "latest");
    } else if (filter === "popular") {
      params.set("status", "ongoing");
      params.set("sort", "popular");
    } else if (filter === "mine") {
      params.set("mine", "true");
      params.set("sort", "latest");
    } else {
      params.set("status", "ongoing");
      params.set("sort", "latest");
    }

    const data = await apiRequest(`/poll?${params.toString()}`);
    const polls = (data.polls || []).map(mapPollListItem);

    return {
      ...data,
      polls,
    };
  },

  async detail(pollId, userEmail) {
    return mapPollDetail(await apiRequest(`/polls/${pollId}`), userEmail);
  },

  async create({ title, optionA, optionB, durationHours }) {
    return apiRequest("/poll", {
      method: "POST",
      body: JSON.stringify({ title, optionA, optionB, durationHours }),
    });
  },

  async vote(pollId, selection) {
    return apiRequest(`/poll/${pollId}/vote`, {
      method: "POST",
      body: JSON.stringify({ selection }),
    });
  },
};
