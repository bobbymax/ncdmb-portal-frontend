import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import FileTemplateRepository from "app/Repositories/FileTemplate/FileTemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React from "react";
import LogoWidget from "../components/widgets/LogoWidget";
import BatchBanner from "../components/widgets/BatchBanner";

const TemplateBuilder: React.FC<
  BuilderComponentProps<FileTemplateResponseData, FileTemplateRepository>
> = ({ state, setState, repo, resource }) => {
  console.log(state);

  return (
    <div className="row">
      <div className="col-md-8 mb-3">
        <div className="template custom-card file__card"></div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="widgets custom-card file__card">
          <h5>Widgets</h5>

          <div className="widget__items">
            <BatchBanner />
            <LogoWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
