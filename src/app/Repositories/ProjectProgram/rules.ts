export const projectProgramRules = {
  title: "required|string|min:5|max:500",
  description: "nullable|string",
  department_id: "required|integer",
  ministry_id: "nullable|integer",
  project_category_id: "nullable|integer",
  planned_start_date: "required|date",
  planned_end_date: "required|date|after:planned_start_date",
  status: "required|in:concept,approved,active,suspended,completed,cancelled",
  priority: "required|in:critical,high,medium,low",
  strategic_alignment: "nullable|string",
};

