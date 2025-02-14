import useFileActions from "app/Hooks/useFileActions";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";

const DocumentUploads: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data, tab, Repo, loading, view }) => {
  const { mergedPdfUrl } = useFileActions({
    Repo,
    uploads: data.uploads ?? [],
    tab,
  });

  return (
    <div>
      {mergedPdfUrl && (
        <div style={{ marginTop: "12px" }}>
          <iframe
            src={mergedPdfUrl}
            title="Merged PDF"
            style={{ width: "100%", height: "620px", border: "none" }}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default DocumentUploads;
