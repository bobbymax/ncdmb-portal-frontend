import { useResourceActions } from "app/Hooks/useResourceActions";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { PageProps } from "bootstrap";
import React from "react";

const FileDocket = ({
  Repository,
  view,
  FileDocketComponent,
}: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });

  console.log(raw);

  return (
    <div className="docket__container">
      <div className="row">
        <div className="col-md-12">
          <div className="custom-card docket__header">
            <p>Yes</p>
          </div>
        </div>
        <div className="col-md-9"></div>
        <div className="col-md-3"></div>
      </div>
    </div>
  );
};

export default FileDocket;
