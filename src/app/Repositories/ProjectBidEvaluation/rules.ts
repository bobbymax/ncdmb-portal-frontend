export const projectBidEvaluationRules = {
  project_bid_id: "required|integer|exists:project_bids,id",
  evaluator_id: "integer|exists:users,id",
  evaluation_type: "required|in:administrative,technical,financial,post_qualification",
  evaluation_date: "date",
  criteria: "array",
  total_score: "numeric|min:0|max:100",
  pass_fail: "in:pass,fail,conditional",
  status: "in:draft,submitted,reviewed,approved",
};

