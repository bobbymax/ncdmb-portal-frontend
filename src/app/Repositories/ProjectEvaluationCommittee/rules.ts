export const projectEvaluationCommitteeRules = {
  project_id: "required|integer|exists:projects,id",
  committee_name: "required|string|max:255",
  committee_type: "required|in:tender_board,technical,financial,opening",
  chairman_id: "required|integer|exists:users,id",
  members: "array",
  status: "in:active,dissolved",
};

