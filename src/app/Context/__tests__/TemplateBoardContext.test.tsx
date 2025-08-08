import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  TemplateBoardProvider,
  useTemplateBoard,
} from "../TemplateBoardContext";
import { TemplateBoardMigration } from "../TemplateBoardMigration";
import { useTemplateBoardOptimized } from "../../Hooks/useTemplateBoardOptimized";

// Test component to access context
const TestComponent = () => {
  const { state, actions } = useTemplateBoard();

  return (
    <div>
      <div data-testid="category">{state.category?.name || "No category"}</div>
      <div data-testid="template">{state.template?.name || "No template"}</div>
      <div data-testid="contents-count">{state.contents.length}</div>
      <button
        data-testid="add-content"
        onClick={() =>
          actions.addContent(
            { id: 1, title: "Test Block", data_type: "paragraph" } as any,
            "paragraph"
          )
        }
      >
        Add Content
      </button>
      <button
        data-testid="set-category"
        onClick={() =>
          actions.setCategory({ id: 1, name: "Test Category" } as any)
        }
      >
        Set Category
      </button>
    </div>
  );
};

// Test component for optimized hook
const OptimizedTestComponent = () => {
  const { selectors, computed } = useTemplateBoardOptimized();

  return (
    <div>
      <div data-testid="content-count">{selectors.getContentCount()}</div>
      <div data-testid="has-contents">
        {computed.hasContents ? "true" : "false"}
      </div>
      <div data-testid="error-count">{computed.errorCount}</div>
    </div>
  );
};

describe("TemplateBoardContext", () => {
  describe("Basic Context Functionality", () => {
    it("should provide initial state", () => {
      render(
        <TemplateBoardProvider>
          <TestComponent />
        </TemplateBoardProvider>
      );

      expect(screen.getByTestId("category")).toHaveTextContent("No category");
      expect(screen.getByTestId("template")).toHaveTextContent("No template");
      expect(screen.getByTestId("contents-count")).toHaveTextContent("0");
    });

    it("should add content when action is called", async () => {
      render(
        <TemplateBoardProvider>
          <TestComponent />
        </TemplateBoardProvider>
      );

      fireEvent.click(screen.getByTestId("add-content"));

      await waitFor(() => {
        expect(screen.getByTestId("contents-count")).toHaveTextContent("1");
      });
    });

    it("should set category when action is called", async () => {
      render(
        <TemplateBoardProvider>
          <TestComponent />
        </TemplateBoardProvider>
      );

      fireEvent.click(screen.getByTestId("set-category"));

      await waitFor(() => {
        expect(screen.getByTestId("category")).toHaveTextContent(
          "Test Category"
        );
      });
    });
  });

  describe("Optimized Hook", () => {
    it("should provide memoized selectors", () => {
      render(
        <TemplateBoardProvider>
          <OptimizedTestComponent />
        </TemplateBoardProvider>
      );

      expect(screen.getByTestId("content-count")).toHaveTextContent("0");
      expect(screen.getByTestId("has-contents")).toHaveTextContent("false");
      expect(screen.getByTestId("error-count")).toHaveTextContent("0");
    });
  });

  describe("Migration Utility", () => {
    it("should validate correct state structure", () => {
      const validState = {
        contents: [],
        configState: {
          from: {
            key: "from",
            state: {
              process_type: "from",
              stage: null,
              group: null,
              department: null,
              permissions: {},
            },
          },
          to: {
            key: "to",
            state: {
              process_type: "to",
              stage: null,
              group: null,
              department: null,
              permissions: {},
            },
          },
          through: {
            key: "through",
            state: {
              process_type: "through",
              stage: null,
              group: null,
              department: null,
              permissions: {},
            },
          },
          cc: { key: "cc", state: [] },
          approvers: { key: "approvers", state: [] },
        },
        resource: null,
      } as any;

      const validation = TemplateBoardMigration.validateState(validState);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid state structure", () => {
      const invalidState = {
        contents: "not an array",
        configState: null,
        resource: null,
      } as any;

      const validation = TemplateBoardMigration.validateState(invalidState);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should create fallback state", () => {
      const fallbackState = TemplateBoardMigration.createFallbackState();

      expect(fallbackState.contents).toEqual([]);
      expect(fallbackState.configState).toBeDefined();
      expect(fallbackState.resource).toBeNull();
      expect(fallbackState.isValid).toBe(false);
    });

    it("should migrate existing content state", () => {
      const existingContents = [
        { id: "1", type: "paragraph", content: { body: "Test content" } },
      ];
      const existingConfigState = {
        from: {
          key: "from",
          state: {
            process_type: "from",
            stage: null,
            group: null,
            department: null,
            permissions: {},
          },
        },
      };
      const existingResource = { id: 1, name: "Test Resource" };

      const migratedState = TemplateBoardMigration.migrateContentState(
        existingContents,
        existingConfigState,
        existingResource
      );

      expect(migratedState.contents).toEqual(existingContents);
      expect(migratedState.configState).toEqual(existingConfigState);
      expect(migratedState.resource).toEqual(existingResource);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing context gracefully", () => {
      // This test ensures that components don't crash when context is missing
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("Performance", () => {
    it("should not cause unnecessary re-renders", () => {
      const renderSpy = jest.fn();

      const PerformanceTestComponent = () => {
        const { selectors } = useTemplateBoardOptimized();
        renderSpy();

        return (
          <div>
            <div data-testid="content-count">{selectors.getContentCount()}</div>
          </div>
        );
      };

      render(
        <TemplateBoardProvider>
          <PerformanceTestComponent />
        </TemplateBoardProvider>
      );

      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render should not happen for same state
      renderSpy.mockClear();

      // Force a re-render by updating state
      fireEvent.click(screen.getByTestId("add-content"));

      // Should only render once more
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});
