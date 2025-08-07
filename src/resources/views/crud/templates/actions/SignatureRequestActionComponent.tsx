import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { SignatureRequestResponseData } from "app/Repositories/SignatureRequest/data";
import SignatureRequestRepository from "app/Repositories/SignatureRequest/SignatureRequestRepository";
import { GroupResponseData } from "app/Repositories/Group/data";
import useRepo from "app/Hooks/useRepo";
import { repo } from "bootstrap/repositories";
import { useAuth } from "app/Context/AuthContext";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import { UserResponseData } from "app/Repositories/User/data";
import Button from "resources/views/components/forms/Button";

type DependencyProps = {
  groups: GroupResponseData[];
};

const SignatureRequestActionComponent: React.FC<
  ActionComponentProps<SignatureRequestResponseData, SignatureRequestRepository>
> = ({
  identifier,
  data,
  action,
  currentDraft,
  getModalState,
  updateModalState,
  handleFormSubmit,
  isLoading,
  Repo,
}) => {
  const { staff } = useAuth();
  const { dependencies } = useRepo(repo("signature_request"));

  const state: SignatureRequestResponseData = useMemo(
    () => getModalState(identifier),
    [getModalState, identifier]
  );

  const [group, setGroup] = useState<DataOptionsProps | null>(null);
  const [authorisers, setAuthorisers] = useState<UserResponseData[]>([]);
  const [user, setUser] = useState<DataOptionsProps | null>(null);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const groups = useMemo(() => {
    if (!dependencies || !staff) return [];
    const { groups = [] } = dependencies as DependencyProps;

    return groups.filter((group) =>
      group.carderIds?.includes(staff.carder?.id)
    );
  }, [dependencies, staff]);

  const handleGroupsChange = useCallback((newValue: unknown) => {
    setGroup(newValue as DataOptionsProps);
  }, []);

  const handleUserChange = useCallback(
    (newValue: unknown) => {
      const selectedUser = newValue as DataOptionsProps;
      const officer = authorisers.find(
        (user) => user.id === selectedUser.value
      );

      if (officer && group) {
        updateModalState(identifier, {
          ...state,
          department_id: officer.department_id,
          user_id: officer.id,
          group_id: group.value,
        });
      }

      setUser(selectedUser);
    },
    [authorisers, group, identifier, state, updateModalState]
  );

  const fetchAuthorisingStaff = useCallback(async () => {
    if (!group) return;

    setLoadingStaff(true);
    try {
      const response = await Repo.show("authorised/users", `${group.value}/0`);
      if (response) {
        setAuthorisers(response.data as UserResponseData[]);
      }
    } catch (error) {
      console.error("Error fetching authorising staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  }, [group, Repo]);

  useEffect(() => {
    fetchAuthorisingStaff();
  }, [fetchAuthorisingStaff]);

  useEffect(() => {
    updateModalState(identifier, {
      ...state,
      document_id: currentDraft.document_id,
      document_draft_id: currentDraft.id,
    });
  }, [identifier, currentDraft]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="col-md-5 mb-3">
          <MultiSelect
            label="Authorisers"
            options={formatOptions(groups, "id", "name")}
            value={group}
            onChange={handleGroupsChange}
            placeholder="Group"
            isSearchable
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-7 mb-3">
          <MultiSelect
            label="Staff"
            options={formatOptions(authorisers, "id", "name")}
            value={user}
            onChange={handleUserChange}
            placeholder="Staff"
            isSearchable
            isDisabled={
              isLoading || !group || loadingStaff || authorisers.length < 1
            }
          />
          {loadingStaff && <small>Loading staff...</small>}
        </div>

        <div className="col-md-12 mt-2">
          <Button
            label={action.button_text}
            type="submit"
            variant={action.variant}
            size="sm"
            icon={action.icon}
            isDisabled={!group || !user}
          />
        </div>
      </div>
    </form>
  );
};

export default SignatureRequestActionComponent;
