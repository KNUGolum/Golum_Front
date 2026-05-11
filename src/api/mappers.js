export function mapUser(apiUser) {
  return {
    id: apiUser.id,
    email: apiUser.email,
    nickname: apiUser.nickname,
    credits: apiUser.credit ?? apiUser.credits ?? 0,
  };
}

export function mapStatus(apiStatus) {
  if (apiStatus === "INVALID") return "invalid";
  return apiStatus === "ONGOING" || apiStatus === "ACTIVE" ? "active" : "closed";
}

function toTime(value, fallback) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? fallback : time;
}

function mapSelection(selection, optionA = {}, optionB = {}) {
  if (!selection) return null;
  const value = String(selection);
  const optionAId = optionA.id ?? optionA.optionId ?? optionA.option_id;
  const optionBId = optionB.id ?? optionB.optionId ?? optionB.option_id;
  if (value === "A" || value === String(optionAId)) return "A";
  if (value === "B" || value === String(optionBId)) return "B";
  return selection;
}

export function mapPollListItem(apiPoll) {
  const mappedStatus = mapStatus(apiPoll.status);
  const totalVotes = apiPoll.totalVotes ?? apiPoll.total_votes ?? 0;
  const status = mappedStatus;
  const choice = mapSelection(apiPoll.mySelection ?? apiPoll.my_selection);
  return {
    id: apiPoll.pollId ?? apiPoll.id,
    title: apiPoll.title || "",
    optA: apiPoll.optionA || "",
    optB: apiPoll.optionB || "",
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
    votesB: totalVotes,
    totalBetA: 0,
    totalBetB: 0,
    hasVoted: !!apiPoll.hasVoted,
    hasBet: !!apiPoll.hasBet,
    isCreator: !!apiPoll.isCreator,
    resultsVisible: apiPoll.resultsVisible,
    canVote: status === "invalid" ? false : !!apiPoll.canVote,
    canBet: status === "invalid" ? false : !!apiPoll.canBet,
    mySelection: choice,
    hasDetailedStats: false,
  };
}

export function mapPollDetail(apiPoll, userEmail) {
  const optionA = apiPoll.options?.[0] || {};
  const optionB = apiPoll.options?.[1] || {};
  const optionAId = optionA.id ?? optionA.optionId ?? optionA.option_id;
  const optionBId = optionB.id ?? optionB.optionId ?? optionB.option_id;
  const votesA = optionA.voteCount ?? optionA.vote_count ?? 0;
  const votesB = optionB.voteCount ?? optionB.vote_count ?? 0;
  const rawSelection = apiPoll.mySelection ?? apiPoll.my_selection;
  const choice = mapSelection(rawSelection, optionA, optionB);
  const selectedOptionId = choice === "A" ? optionAId : choice === "B" ? optionBId : rawSelection;
  const mappedStatus = mapStatus(apiPoll.status);
  const invalid = mappedStatus === "invalid";
  const winner = invalid ? null :
    apiPoll.isDraw ? "draw" :
    (apiPoll.winnerOptionId ?? apiPoll.winner_option_id) === optionAId ? "A" :
    (apiPoll.winnerOptionId ?? apiPoll.winner_option_id) === optionBId ? "B" :
    null;
  const status = invalid ? "invalid" : mappedStatus;

  return {
    id: apiPoll.id ?? apiPoll.pollId,
    title: apiPoll.title || "",
    optA: optionA.optionText ?? optionA.option_text ?? "",
    optB: optionB.optionText ?? optionB.option_text ?? "",
    optionAId,
    optionBId,
    duration: null,
    createdAt: toTime(apiPoll.createdAt, undefined),
    expiresAt: toTime(apiPoll.endTime),
    creator: apiPoll.isCreator ? userEmail : null,
    participants: apiPoll.hasVoted
      ? [{ email: userEmail, choice, votedAt: Date.now() }]
      : [],
    bets: apiPoll.hasBet
      ? [{ email: userEmail, choice, amount: 0, result: "pending", payout: 0, placedAt: Date.now() }]
      : [],
    status,
    winner,
    votesA,
    votesB,
    totalBetA: optionA.betCredits ?? optionA.bet_credits ?? 0,
    totalBetB: optionB.betCredits ?? optionB.bet_credits ?? 0,
    resultsVisible: apiPoll.resultsVisible,
    canVote: invalid ? false : apiPoll.canVote,
    canBet: invalid ? false : apiPoll.canBet,
    hasVoted: !!apiPoll.hasVoted,
    hasBet: !!apiPoll.hasBet,
    isCreator: !!apiPoll.isCreator,
    mySelection: choice,
    selectedOptionId: selectedOptionId == null ? null : String(selectedOptionId),
    hasDetailedStats: true,
  };
}
