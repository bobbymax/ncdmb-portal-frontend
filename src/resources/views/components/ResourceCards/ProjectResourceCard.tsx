import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import {
  BaseRepository,
  JsonResponse,
} from "@/app/Repositories/BaseRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { ProjectResponseData } from "@/app/Repositories/Project/data";
import { repo } from "bootstrap/repositories";
import moment from "moment";
import { DocumentResponseData } from "@/app/Repositories/Document/data";

interface ProjectResourceCardProps {
  category: DocumentCategoryResponseData;
  repository: BaseRepository | null;
  responseData: unknown;
}

interface ProjectPreviewProps {
  project: ProjectResponseData;
  onSelect?: () => void;
  isActive?: boolean;
  variant?: "list" | "selected";
}

const MAX_SUGGESTIONS = 6;
const PROJECT_STATUS_FILTER = "pending";
const PROJECT_LIFECYCLE_FILTER = "concept";

const sanitizeClassName = (value: string | undefined): string => {
  if (!value) return "neutral";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

const formatCurrency = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-NG", {
      currency: "NGN",
      style: "currency",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    return `₦${Number(amount).toLocaleString("en-NG")}`;
  }
};

const truncateText = (text: string | undefined, length: number): string => {
  if (!text) return "No description provided.";
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
};

const isProjectResponse = (value: unknown): value is ProjectResponseData => {
  if (!value || typeof value !== "object") return false;
  return "id" in value && "title" in value && "code" in value;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const parsed = moment(value);
  if (!parsed.isValid()) return "—";
  return parsed.format("DD MMM YYYY");
};

const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  project,
  onSelect,
  isActive = false,
  variant = "list",
}) => {
  const statusLabel = project.status?.replace(/[_-]/g, " ") ?? "Unknown";
  const statusClass = sanitizeClassName(project.status);
  const isInteractive = typeof onSelect === "function";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.();
    }
  };

  return (
    <div
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={[
        "project-resource-card",
        variant === "selected"
          ? "project-resource-card--selected"
          : "project-resource-card--list",
        isActive ? "project-resource-card--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={isInteractive ? "option" : undefined}
      aria-selected={isInteractive ? isActive : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <div className="project-resource-card__header">
        <div className="project-resource-card__heading">
          <p className="project-resource-card__title">{project.title}</p>
          <span className="project-resource-card__code">
            Project Code: {project.code || "N/A"}
          </span>
        </div>
        <span
          className={[
            "project-resource-chip",
            `project-resource-chip--${statusClass}`,
          ].join(" ")}
        >
          {statusLabel}
        </span>
      </div>

      <p className="project-resource-card__description">
        {truncateText(project.description, variant === "selected" ? 240 : 140)}
      </p>

      <div className="project-resource-card__meta">
        <div>
          <span className="project-resource-card__label">Budget Year</span>
          <span className="project-resource-card__value">
            {project.budget_year || "N/A"}
          </span>
        </div>
        <div>
          <span className="project-resource-card__label">Proposed Amount</span>
          <span className="project-resource-card__value">
            {formatCurrency(project.total_proposed_amount)}
          </span>
        </div>
        <div>
          <span className="project-resource-card__label">Priority</span>
          <span className="project-resource-card__value">
            {project.priority ? project.priority.replace(/[_-]/g, " ") : "N/A"}
          </span>
        </div>
      </div>

      <div className="project-resource-card__dates">
        <div>
          <span className="project-resource-card__label">Start</span>
          <span className="project-resource-card__value">
            {formatDate(project.proposed_start_date)}
          </span>
        </div>
        <div>
          <span className="project-resource-card__label">End</span>
          <span className="project-resource-card__value">
            {formatDate(project.proposed_end_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProjectResourceCard: React.FC<ProjectResourceCardProps> = ({
  category,
  repository,
  responseData: _responseData,
}) => {
  const { state, actions } = usePaperBoard();
  const projectRepo = useMemo(() => repo("project"), []);
  const [projects, setProjects] = useState<ProjectResponseData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<ProjectResponseData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(
    null
  );
  const dropdownPortalRef = useRef<HTMLDivElement | null>(null);

  const parseProjects = useCallback(
    (payload: unknown): ProjectResponseData[] => {
      if (!repository || !payload) return [];

      const parseEntry = (entry: JsonResponse): ProjectResponseData => {
        return repository.fromJson(entry) as ProjectResponseData;
      };

      if (Array.isArray(payload)) {
        return payload
          .filter((item): item is JsonResponse => !!item)
          .map(parseEntry);
      }

      if (typeof payload === "object" && payload !== null) {
        const dataField = (payload as Record<string, unknown>).data;
        if (Array.isArray(dataField)) {
          return dataField
            .filter((item): item is JsonResponse => !!item)
            .map(parseEntry);
        }

        return [parseEntry(payload as JsonResponse)];
      }

      return [];
    },
    [repository]
  );

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectRepo.store("query", {
        service: "project",
        conditions: [
          {
            column: "status",
            operator: "=",
            value: PROJECT_STATUS_FILTER,
          },
          {
            column: "lifecycle_stage",
            operator: "=",
            value: PROJECT_LIFECYCLE_FILTER,
          },
        ],
      });

      if (response.status === "success") {
        const normalized = parseProjects(response.data);
        setProjects(normalized);
      } else {
        setProjects([]);
        setError(
          response.message || "We could not fetch matching projects right now."
        );
      }
    } catch (err) {
      setProjects([]);
      setError("Something went wrong while retrieving projects.");
    } finally {
      setIsLoading(false);
    }
  }, [parseProjects, projectRepo]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!category?.service || category.service !== "project") return;
    if (!state.resource || !isProjectResponse(state.resource)) return;

    setSelectedProject(state.resource);
    setSearchValue(state.resource.title ?? "");
  }, [state.resource, category?.service]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const container = containerRef.current;
      const dropdown = dropdownPortalRef.current;

      if (container && container.contains(target)) {
        return;
      }

      if (dropdown && dropdown.contains(target)) {
        return;
      }

      setIsDropdownOpen(false);
      setHighlightIndex(-1);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchValue.trim()) return [];

    const term = searchValue.trim().toLowerCase();
    return projects
      .filter((project) => {
        const { title, status, code, description } = project;
        return [title, status, code, description]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term));
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [projects, searchValue]);

  useEffect(() => {
    if (!isDropdownOpen) {
      setHighlightIndex(-1);
      return;
    }
    setHighlightIndex(filteredProjects.length ? 0 : -1);
  }, [filteredProjects, isDropdownOpen]);

  useEffect(() => {
    const existingProject = state.existingDocument
      ?.documentable as ProjectResponseData | null;

    if (isProjectResponse(existingProject)) {
      setSelectedProject(existingProject);
      setSearchValue(existingProject.title ?? "");
      actions.setResource(existingProject);
    } else if (isProjectResponse(state.resource)) {
      setSelectedProject(state.resource);
      setSearchValue(state.resource.title ?? "");
    }
  }, [state.existingDocument?.documentable, state.resource]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);
      setIsDropdownOpen(Boolean(value.trim()));
    },
    []
  );

  const handleSelectProject = useCallback(
    (project: ProjectResponseData) => {
      setSelectedProject(project);
      setSearchValue(project.title ?? "");
      setIsDropdownOpen(false);
      setHighlightIndex(-1);

      actions.setResource(project);
      actions.setMode("update");
      // actions.setDepartmentOwner(project.department_owner ?? null);
      actions.setFund(project.fund ?? null);

      actions.setDocumentState({
        ...(state.documentState as DocumentResponseData),
        title: `Request for Approval of ${project.title}`,
      } as DocumentResponseData);
    },
    [actions]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || !filteredProjects.length) {
        if (event.key === "Escape") {
          setIsDropdownOpen(false);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev + 1;
          return next >= filteredProjects.length ? 0 : next;
        });
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? filteredProjects.length - 1 : next;
        });
      }

      if (event.key === "Enter" && highlightIndex >= 0) {
        event.preventDefault();
        handleSelectProject(filteredProjects[highlightIndex]);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsDropdownOpen(false);
      }
    },
    [filteredProjects, handleSelectProject, highlightIndex, isDropdownOpen]
  );

  const showDropdown = Boolean(
    isDropdownOpen && (filteredProjects.length > 0 || error || isLoading)
  );

  useEffect(() => {
    if (!showDropdown) {
      setDropdownStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!searchWrapperRef.current) return;
      const rect = searchWrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 12,
        left: rect.left,
        width: rect.width,
        maxHeight: 380,
        zIndex: 1200,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showDropdown]);

  return (
    <div className="project-resource" ref={containerRef}>
      <div className="project-resource__header">
        <h5>Link a Project</h5>
        <p>Search and attach a pending project to this document.</p>
      </div>

      <div className="project-resource-search__wrapper" ref={searchWrapperRef}>
        <label className="project-resource-search">
          <span className="project-resource-search__label">
            Search projects
          </span>
          <div className="project-resource-search__control">
            <i className="ri-search-line project-resource-search__icon" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search by title, status, code, or description"
              className="project-resource-search__input"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="project-search-results"
              disabled={!!state.existingDocument}
            />
            {isLoading && (
              <span className="project-resource-search__spinner ri-loader-4-line" />
            )}
          </div>
        </label>
      </div>

      {showDropdown &&
        dropdownStyle &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="project-search-results"
            role="listbox"
            className="project-resource-dropdown"
            style={dropdownStyle}
            ref={dropdownPortalRef}
          >
            {isLoading && (
              <div className="project-resource-dropdown__meta">
                <span className="ri-loader-4-line project-resource-dropdown__spinner" />
                <p>Fetching projects…</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="project-resource-dropdown__meta project-resource-dropdown__meta--error">
                <span className="ri-error-warning-line" />
                <p>{error}</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredProjects.length === 0 &&
              searchValue.trim().length > 0 && (
                <div className="project-resource-dropdown__meta">
                  <span className="ri-search-eye-line" />
                  <p>No projects match “{searchValue}”.</p>
                </div>
              )}

            {!isLoading &&
              !error &&
              filteredProjects.map((project, index) => (
                <ProjectPreview
                  key={project.id}
                  project={project}
                  onSelect={() => handleSelectProject(project)}
                  isActive={highlightIndex === index}
                  variant="list"
                />
              ))}
          </div>,
          document.body
        )}

      {selectedProject && (
        <div className="project-resource-selected">
          <h6>Selected project</h6>
          <ProjectPreview project={selectedProject} variant="selected" />
        </div>
      )}
    </div>
  );
};

export default ProjectResourceCard;
