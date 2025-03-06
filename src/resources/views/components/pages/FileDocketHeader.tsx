import Button from "../forms/Button";

const FileDocketHeader = ({
  title,
  reference,
  document_type,
  back,
}: {
  title: string;
  reference: string;
  document_type: string;
  back: (value: any) => void;
}) => {
  return (
    <div className="row">
      <div className="col-md-8 mb-5">
        <div className="document__analysis flex align start gap-xxl">
          <div className="document__title">
            <small>{reference}</small>
            <h1>{title}</h1>
          </div>

          <div className="document__type">{document_type}</div>
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="actions__container flex align end gap-md">
          <Button
            label="Go Back"
            variant="danger"
            rounded
            handleClick={back}
            icon="ri-arrow-left-line"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

export default FileDocketHeader;
