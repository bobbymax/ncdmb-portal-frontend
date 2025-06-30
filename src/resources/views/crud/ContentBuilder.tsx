import { BlockResponseData } from "app/Repositories/Block/data";
import { TemplateResponseData } from "app/Repositories/Template/data";
import TemplateRepository from "app/Repositories/Template/TemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import { InternalMemoHeader } from "resources/templates/headers";

interface DependencyProps {
  //
}

// Declare the generic component properly
const ContentBuilder: React.FC<
  BuilderComponentProps<TemplateResponseData, TemplateRepository>
> = ({ repo, resource: template, state, setState }): React.ReactElement => {
  const [blocks, setBlocks] = useState<BlockResponseData[]>([]);

  useEffect(() => {
    if (template?.blocks && template.blocks.length > 0) {
      setBlocks(template.blocks);
    }
  }, [template?.blocks]);

  console.log(blocks);

  return (
    <div className="row mt-4">
      <div className="col-md-9 mb-3">
        <div className="custom-card file__card desk__office">
          <div className="row">
            <div className="col-md-8 mb-3">
              {/* Page Component */}
              <div className="template__page">
                <InternalMemoHeader
                  to={null}
                  from={null}
                  through={null}
                  ref={null}
                  date={null}
                  title={null}
                />
              </div>
              {/* End Page Component */}
            </div>
            <div className="col-md-4 mb-3"></div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-3">
        <div className="custom-card file__card desk__office">
          <h4 className="mb-5">Memo Blocks</h4>
          <div className="block__container flex column gap-lg">
            {blocks.map((block) => (
              <div className="glassy-card" key={block.id}>
                <div className="flex align gap-lg">
                  <i className={`glassy-card__icon ${block.icon}`} />
                  <span className="glassy-card__title">{block.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentBuilder;
