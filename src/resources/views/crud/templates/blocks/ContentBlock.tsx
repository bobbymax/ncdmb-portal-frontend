import { useEffect, useMemo, useState } from "react";
import { BlockDataTypeMap, blockFormMap } from ".";
import TextInput from "resources/views/components/forms/TextInput";
import Textarea from "resources/views/components/forms/Textarea";
import Button from "resources/views/components/forms/Button";
import { BlockDataType } from "app/Repositories/Block/data";
import _ from "lodash";
import { BaseRepository } from "app/Repositories/BaseRepository";
import {
  ContentAreaProps,
  OptionsContentAreaProps,
  TableContentAreaProps,
} from "app/Hooks/useBuilder";

const ContentBlock = <D extends BaseRepository>({
  repo,
  block,
  active,
  resolve,
  remove,
  collapse,
  viewCard = false,
}: {
  repo: D;
  block: ContentAreaProps;
  active: boolean;
  resolve: (data: OptionsContentAreaProps, blockId: string) => void;
  remove: (blockId: string) => void;
  collapse: (blockId: string, toggle: "collapse" | "expand") => void;
  viewCard?: boolean;
}) => {
  const [localContentState, setLocalContentState] =
    useState<OptionsContentAreaProps>({} as OptionsContentAreaProps);

  const updateLocalState = <T extends BlockDataType>(
    data: BlockDataTypeMap[T],
    identifier: keyof OptionsContentAreaProps
  ) => {
    setLocalContentState((prev) => ({
      ...prev,
      [identifier]: data,
    }));
  };

  const MemoBlockForm: JSX.Element | null = useMemo(() => {
    if (!localContentState) return null;

    const Component = blockFormMap[block.type];
    return Component ? (
      <Component
        localContentState={localContentState}
        updateLocal={updateLocalState}
      />
    ) : null;
  }, [localContentState]);

  // console.log(localContentState);

  useEffect(() => {
    if (block.content && _.has(block.content, block.type)) {
      const content = block.content;
      setLocalContentState((prev) => ({
        ...prev,
        ...content,
      }));
    }
  }, [block.content]);

  return (
    <div
      className={`${viewCard ? "preview_state" : "memo_block_container"} ${
        block.isCollapsed ? "collapsed" : "expanded"
      }`}
    >
      <div className="row">
        <div className="col-md-12 mb-4 flex align between">
          <h3>{block.name}</h3>
          <div className="flex align gap-sm">
            <Button
              icon={`${
                block.isCollapsed ? "ri-toggle-fill" : "ri-toggle-line"
              }`}
              // label={`${block.isCollapsed ? "Expand" : "Collapse"}`}
              variant="info"
              size="xs"
              handleClick={() =>
                collapse(block.id, block.isCollapsed ? "expand" : "collapse")
              }
            />
            <Button
              icon="ri-close-large-line"
              // label="Remove"
              variant="danger"
              size="xs"
              handleClick={() => remove(block.id)}
            />
          </div>
        </div>
        <div
          className="row"
          style={{ display: block.isCollapsed && !viewCard ? "none" : "block" }}
        >
          <div className="col-md-12 mb-3">{MemoBlockForm}</div>
          {!viewCard && (
            <div className="col-md-12 mb-3 flex end align">
              <Button
                label="Submit"
                icon="ri-send-plane-fill"
                handleClick={() => resolve(localContentState, block.id)}
                variant="success"
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentBlock;
