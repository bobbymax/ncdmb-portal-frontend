import {
  ContentAreaProps,
  OptionsContentAreaProps,
  TableContentAreaProps,
} from "app/Hooks/useBuilder";
import React from "react";
import DynamicTableBuilder from "./DynamicTableBuilder";
import ContentBlockView from "../blocks/ContentBlockView";

type TemplateBuilderProps = {
  contents: ContentAreaProps[];
};

const TemplateBuilderView: React.FC<TemplateBuilderProps> = ({ contents }) => {
  // block content [table,event,paragraph,chart,invoice,list]
  return (
    <div className="template__page__preview">
      {contents.map((block) => {
        // const sharedData = sharedContentMap[block.id] ?? {};
        const content = block.content as OptionsContentAreaProps;

        return (
          <ContentBlockView
            key={block.id}
            content={content}
            // sharedData={sharedData}
          />
        );
      })}
    </div>
  );
};

export default TemplateBuilderView;
