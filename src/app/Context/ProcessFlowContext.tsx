import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ConfigState } from "@/app/Hooks/useTemplateHeader";

type ProcessType = "from" | "to" | "through" | "cc" | "approvers";

interface ProcessFlowContextType {
  configState: ConfigState;
  updateProcessState: (key: ProcessType, state: any) => void;
  getProcessState: (key: ProcessType) => any;
  resetProcessState: () => void;
  hasProcessData: (key: ProcessType) => boolean;
}

const initialConfigState: ConfigState = {
  from: {
    key: "from",
    state: {
      process_type: "from",
      stage: null,
      group: null,
      department: null,
      staff: null,
      is_approving: null,
      permissions: "rw",
    },
  },
  to: {
    key: "to",
    state: {
      process_type: "to",
      stage: null,
      group: null,
      department: null,
      staff: null,
      is_approving: null,
      permissions: "rw",
    },
  },
  through: {
    key: "through",
    state: {
      process_type: "through",
      stage: null,
      group: null,
      department: null,
      staff: null,
      is_approving: null,
      permissions: "rw",
    },
  },
  cc: { key: "cc", state: [] },
  approvers: { key: "approvers", state: [] },
};

const ProcessFlowContext = createContext<ProcessFlowContextType | undefined>(
  undefined
);

interface ProcessFlowProviderProps {
  children: ReactNode;
  initialState?: ConfigState;
}

export const ProcessFlowProvider: React.FC<ProcessFlowProviderProps> = ({
  children,
  initialState = initialConfigState,
}) => {
  const [configState, setConfigState] = useState<ConfigState>(initialState);

  const updateProcessState = useCallback((key: ProcessType, state: any) => {
    setConfigState((prev) => ({
      ...prev,
      [key]: { key, state },
    }));
  }, []);

  const getProcessState = useCallback(
    (key: ProcessType) => {
      return configState[key]?.state;
    },
    [configState]
  );

  const resetProcessState = useCallback(() => {
    setConfigState(initialConfigState);
  }, []);

  const hasProcessData = useCallback(
    (key: ProcessType) => {
      const data = configState[key]?.state;
      if (!data) return false;

      if (["from", "to", "through"].includes(key)) {
        // Single process types: must have meaningful data
        const singleData = data as any;
        return !!(
          singleData.stage?.value ||
          singleData.group?.value ||
          singleData.staff?.value
        );
      }

      if (["cc", "approvers"].includes(key)) {
        // Array process types: must have actual items
        return Array.isArray(data) && data.length > 0;
      }

      return false;
    },
    [configState]
  );

  const contextValue: ProcessFlowContextType = {
    configState,
    updateProcessState,
    getProcessState,
    resetProcessState,
    hasProcessData,
  };

  return (
    <ProcessFlowContext.Provider value={contextValue}>
      {children}
    </ProcessFlowContext.Provider>
  );
};

export const useProcessFlow = (): ProcessFlowContextType => {
  const context = useContext(ProcessFlowContext);
  if (!context) {
    throw new Error("useProcessFlow must be used within a ProcessFlowProvider");
  }
  return context;
};

export default ProcessFlowContext;
