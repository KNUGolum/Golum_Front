export function mapUser(apiUser) {
  return {
    id: apiUser.id,
    email: apiUser.email,
    nickname: apiUser.nickname,
    credits: apiUser.credit,
  };
}

export function mapStatus(apiStatus) {
  return apiStatus === "ONGOING" ? "active" : "closed";
}

function toTime(value, fallback = Date.now()) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? fallback : time;
}

export function mapPollListItem(apiPoll) {
  const status = mapStatus(apiPoll.status);
  const choice = apiPoll.mySelection || null;
  return {
    id: apiPoll.pollId,
    title: apiPoll.title,
    optA: apiPoll.optionA,
    optB: apiPoll.optionB,
    duration: null,
    createdAt: toTime(apiPoll.createdAt),
    expiresAt: toTime(apiPoll.endTime),
    creator: apiPoll.isCreator ? "__me__" : null,
    creatorId: apiPoll.creatorId,
    participants: apiPoll.hasVoted ? [{ email: "__me__", choice, votedAt: Date.now() }] : [],
    bets: apiPoll.hasBet ? [{ email: "__me__", choice, amount: 0, result: "pending", payout: 0, placedAt: Date.now() }] : [],
    status,
    winner: null,
    votesA: 0,
    votesB: apiPoll.totalVotes || 0,
    totalBetA: 0,
    totalBetB: 0,
    hasVoted: apiPoll.hasVoted,
    hasBet: apiPoll.hasBet,
    isCreator: apiPoll.isCreator,
    resultsVisible: apiPoll.resultsVisible,
    canVote: apiPoll.canVote,
    canBet: apiPoll.canBet,
    mySelection: choice,
    hasDetailedStats: false,
  };
}

export function mapPollDetail(apiPoll, userEmail) {
  const optionA = apiPoll.options?.[0] || {};
  const optionB = apiPoll.options?.[1] || {};
  const winner =
    apiPoll.isDraw ? "draw" :
    apiPoll.winnerOptionId === optionA.id ? "A" :
    apiPoll.winnerOptionId === optionB.id ? "B" :
    null;
  const status = mapStatus(apiPoll.status);

  return {
    id: apiPoll.id,
    title: apiPoll.title,
    optA: optionA.optionText || "",
    optB: optionB.optionText || "",
    duration: null,
    createdAt: Date.now(),
    expiresAt: toTime(apiPoll.endTime),
    creator: apiPoll.isCreator ? userEmail : null,
    participants: apiPoll.hasVoted
      ? [{ email: userEmail, choice: apiPoll.mySelection, votedAt: Date.now() }]
      : [],
    bets: apiPoll.hasBet
      ? [{ email: userEmail, choice: apiPoll.mySelection, amount: 0, result: "pending", payout: 0, placedAt: Date.now() }]
      : [],
    status,
    winner,
    votesA: optionA.voteCount || 0,
    votesB: optionB.voteCount || 0,
    totalBetA: optionA.betCredits || 0,
    totalBetB: optionB.betCredits || 0,
    resultsVisible: apiPoll.resultsVisible,
    canVote: apiPoll.canVote,
    canBet: apiPoll.canBet,
    hasVoted: apiPoll.hasVoted,
    hasBet: apiPoll.hasBet,
    isCreator: apiPoll.isCreator,
    mySelection: apiPoll.mySelection,
    hasDetailedStats: true,
  };
}
