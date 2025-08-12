import { useEffect, useRef } from "react";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import { ProcessType } from "resources/views/crud/ContentBuilder";

interface UseProcessStateDebugProps {
  processType: ProcessType;
  currentState: TemplateProcessProps;
  dependencies: {
    stages: any[];
    groups: any[];
    users: any[];
  };
  handleStateUpdate: (state: TemplateProcessProps, key: ProcessType) => void;
}

export const useProcessStateDebug = ({
  processType,
  currentState,
  dependencies,
  handleStateUpdate,
}: UseProcessStateDebugProps) => {
  const debugRef = useRef({
    stateChanges: 0,
    dependencyUpdates: 0,
    lastStateUpdate: null as any,
    performanceMetrics: {
      avgUpdateTime: 0,
      totalUpdates: 0,
    },
  });

  // Track state changes
  useEffect(() => {
    debugRef.current.stateChanges++;
    debugRef.current.lastStateUpdate = {
      timestamp: Date.now(),
      state: currentState,
      processType,
    };

    // Log significant state changes
    if (debugRef.current.stateChanges % 10 === 0) {
      console.log(
        `[${processType}] State change #${debugRef.current.stateChanges}:`,
        currentState
      );
    }
  }, [currentState, processType]);

  // Track dependency updates
  useEffect(() => {
    debugRef.current.dependencyUpdates++;

    if (debugRef.current.dependencyUpdates % 5 === 0) {
      console.log(
        `[${processType}] Dependencies updated #${debugRef.current.dependencyUpdates}:`,
        {
          stages: dependencies.stages.length,
          groups: dependencies.groups.length,
          users: dependencies.users.length,
        }
      );
    }
  }, [
    dependencies.stages.length,
    dependencies.groups.length,
    dependencies.users.length,
    processType,
  ]);

  // Performance monitoring
  const measureUpdateTime = (updateFn: () => void) => {
    const startTime = performance.now();
    updateFn();
    const endTime = performance.now();

    const updateTime = endTime - startTime;
    const { performanceMetrics } = debugRef.current;

    performanceMetrics.totalUpdates++;
    performanceMetrics.avgUpdateTime =
      (performanceMetrics.avgUpdateTime *
        (performanceMetrics.totalUpdates - 1) +
        updateTime) /
      performanceMetrics.totalUpdates;

    // Log slow updates
    if (updateTime > 16) {
      // 16ms = 60fps threshold
      console.warn(
        `[${processType}] Slow state update: ${updateTime.toFixed(2)}ms`
      );
    }
  };

  // Debug info getter
  const getDebugInfo = () => ({
    ...debugRef.current,
    currentState,
    dependencies: {
      stagesCount: dependencies.stages.length,
      groupsCount: dependencies.groups.length,
      usersCount: dependencies.users.length,
    },
  });

  // Enhanced handleStateUpdate with performance monitoring
  const debugHandleStateUpdate = (
    state: TemplateProcessProps,
    key: ProcessType
  ) => {
    measureUpdateTime(() => {
      handleStateUpdate(state, key);
    });
  };

  return {
    debugHandleStateUpdate,
    getDebugInfo,
    measureUpdateTime,
  };
};
