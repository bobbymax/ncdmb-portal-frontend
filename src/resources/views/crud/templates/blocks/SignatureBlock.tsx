import React, { useEffect, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "app/Repositories/Block/data";
import {
  SignatureContentAreaProps,
  SignaturePadGroupProps,
} from "app/Hooks/useBuilder";
import { useAuth } from "app/Context/AuthContext";
import TextInput from "resources/views/components/forms/TextInput";
import Select from "resources/views/components/forms/Select";
import Button from "resources/views/components/forms/Button";
import { useModal } from "app/Context/ModalContext";
import SignatureBlockPad from "../../modals/blocks/SignatureBlockPad";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";

const SignatureBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
}) => {
  const { staff } = useAuth();
  const { openBlock, closeModal } = useModal();
  const { collection: users } = useDirectories(repo("user"), "users");
  const { collection: departments } = useDirectories(
    repo("department"),
    "departments"
  );
  const { collection: groups } = useDirectories(repo("group"), "groups");
  const { collection: carders } = useDirectories(repo("carder"), "carders");
  const identifier: BlockDataType = "approval";
  const [state, setState] = useState<SignatureContentAreaProps>({
    style: "basic",
    max_signatures: 6,
    approvals: [],
    originator_id: 0,
    originator_name: "",
    originator_department_id: 0,
  });

  const handleResult = (data: SignatureContentAreaProps) => {
    setState((prev) => ({
      ...prev,
      ...data,
    }));

    updateLocal(data, identifier);
  };

  const handleBlockChange = (detail: unknown) => {
    const updatedRows = [
      {
        ...(detail as SignaturePadGroupProps),
        identifier: crypto.randomUUID(),
      },
      ...state.approvals,
    ];
    const updatedState: SignatureContentAreaProps = {
      ...state,
      approvals: updatedRows,
    };

    setState(updatedState);
    updateLocal(updatedState, "approval");

    closeModal();
  };

  const removeSignatureBlock = (signature: SignaturePadGroupProps) => {
    const updatedApprovals = state.approvals.filter(
      (item) => item.identifier !== signature.identifier
    );

    const updatedState: SignatureContentAreaProps = {
      ...state,
      approvals: updatedApprovals,
    };

    setState(updatedState);
    updateLocal(updatedState, "approval");
  };

  const addApprovalBlock = () => {
    openBlock(
      SignatureBlockPad,
      {
        title: "Add Approval Group",
        type: identifier,
        blockState: state,
        isUpdating: false,
        addBlockComponent: handleBlockChange,
        dependencies: {
          partials: [],
          extras: {
            users,
            departments,
            groups,
            carders,
          },
        },
      },
      identifier
    );
  };

  useEffect(() => {
    if (!staff) return;
    setState((prev) => ({
      ...prev,
      ...localContentState?.approval,
      originator_id: staff.id,
      originator_name: staff.name,
      originator_department_id: staff.department_id,
    }));
  }, [staff, localContentState?.approval]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <Select
          label="Style"
          name="style"
          value={state.style}
          valueKey="value"
          labelKey="label"
          onChange={(e) =>
            handleResult({
              ...state,
              style: e.target.value as
                | "boxed"
                | "tabular"
                | "stacked"
                | "basic",
            })
          }
          options={[
            { value: "boxed", label: "Boxed" },
            { value: "tabular", label: "Tabular" },
            { value: "stacked", label: "Stacked" },
            { value: "basic", label: "Basic" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-12 mb-3">
        <Button
          label="Add Approval Group"
          icon="ri-add-line"
          size="sm"
          handleClick={addApprovalBlock}
          variant="dark"
        />
      </div>
      <div className="col-md-12 mb-5">
        {state.approvals.length > 0 ? (
          state.approvals.map((approval, idx) => (
            <div
              className="signature__block flex align between gap-lg"
              key={idx}
            >
              <div className="signature__details">
                <h5 className="mb-2">{approval.group?.label || "No Group"}</h5>
                <p>
                  {approval.approver?.label || "Default Approving Staff"} |{" "}
                  {approval.department?.label || "No Department"} |{" "}
                  {approval.approval_type}
                </p>
              </div>
              <div className="signature__config">
                <Button
                  icon="ri-close-large-line"
                  handleClick={() => removeSignatureBlock(approval)}
                  variant="danger"
                  size="xs"
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No approval groups added yet.</p>
        )}
      </div>
    </div>
  );
};

export default SignatureBlock;
