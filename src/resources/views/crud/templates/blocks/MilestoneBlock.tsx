import React, { useEffect, useMemo, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { ProjectResponseData } from "@/app/Repositories/Project/data";
import { MilestoneContentAreaProps } from "@/app/Hooks/useBuilder";
import Button from "resources/views/components/forms/Button";
import { useModal } from "app/Context/ModalContext";
import { MilestoneResponseData } from "@/app/Repositories/Milestone/data";
import { BlockDataType } from "@/app/Repositories/Block/data";
import MilestoneBlockModal from "../../modals/blocks/MilestoneBlockModal";

const MilestoneBlock: React.FC<BlockContentComponentPorps> = ({
  resource,
  localContentState,
  updateLocal,
}) => {
  const { openBlock, closeModal } = useModal();
  const identifier: BlockDataType = "milestone";
  const project = useMemo(
    () => (resource as ProjectResponseData) ?? null,
    [resource]
  );

  const [state, setState] = useState<MilestoneContentAreaProps>({
    milestones: project?.milestones ?? [],
    project,
  });

  const [totalPercentage, setTotalPercentage] = useState<number>(0);

  const handleBlockChange = (detail: unknown, mode?: "store" | "update") => {
    const updatedMilestone = detail as MilestoneResponseData;
    const updatedMilestones =
      mode === "store"
        ? [
            ...state.milestones,
            {
              ...updatedMilestone,
              id: state.milestones.length + 1,
            },
          ]
        : state.milestones.map((milestone) =>
            milestone.id === updatedMilestone.id ? updatedMilestone : milestone
          );

    const updatedState: MilestoneContentAreaProps = {
      ...state,
      milestones: updatedMilestones,
    };

    setState((prev) => ({
      ...prev,
      milestones: updatedMilestones,
    }));

    updateLocal(updatedState, "milestone");
    closeModal();
  };

  const handleMilestoneChange = (milestone?: MilestoneResponseData) => {
    openBlock(
      MilestoneBlockModal,
      {
        title: milestone ? "Update Milestone" : "Add Milestone",
        type: identifier,
        blockState: state,
        data: milestone,
        isUpdating: milestone ? true : false,
        addBlockComponent: handleBlockChange,
        dependencies: {
          partials: [],
          extras: {
            project,
            totalPercentage,
          },
        },
      },
      identifier
    );
  };

  // console.log(state);

  useEffect(() => {
    if (project) {
      setState((prev) => ({
        ...prev,
        milestones: project.milestones ?? [],
        project,
      }));
    }
  }, [project]);

  useEffect(() => {
    const total = state.milestones.reduce((acc, milestone) => {
      return acc + milestone.percentage_completion;
    }, 0);
    setTotalPercentage(total);
  }, [state.milestones]);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="flex end align">
          <Button
            label="Add Milestone"
            icon="ri-add-line"
            handleClick={() => handleMilestoneChange()}
            variant="info"
            size="xs"
          />
        </div>
      </div>
    </div>
  );
};

export default MilestoneBlock;
