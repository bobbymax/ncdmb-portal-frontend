import PaperBoardErrorBoundary from "app/Boundaries/PaperBoardErrorBoundary";
import { PaperBoardProvider } from "app/Context/PaperBoardProvider";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { PageProps } from "@/bootstrap";
import DocumentTemplateContent, { SheetProps } from "./DocumentTemplateContent";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { useEffect, useState } from "react";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";

const BuildTemplate = ({
  Repository,
  view,
  BuilderComponent,
}: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });

  return (
    // <PaperBoardErrorBoundary>
    //   <PaperBoardProvider>
    //     {/* <DocumentTemplateContent
    //       Repository={Repository}
    //       ResourceGeneratorComponent={BuilderComponent}
    //       category={raw as DocumentCategoryResponseData}
    //       editedContents={(
    //         (raw as DocumentCategoryResponseData).template?.body ?? []
    //       ).map((content, index) => ({
    //         id: content.id || `content-${index}`,
    //         block: {
    //           id: content.block_id || index + 1,
    //           title: content.name || `Content ${index + 1}`,
    //           icon: "",
    //           data_type: content.type || "text",
    //           input_type: "ParagraphBlock",
    //           max_words: 0,
    //           type: "document",
    //           contents: [],
    //           active: 1,
    //         },
    //         order: content.order || index + 1,
    //         content: content.content
    //           ? ({
    //               id: content.id || `content-${index}`,
    //               order: content.order || index + 1,
    //               expense: content.content.expense || {},
    //               invoice: content.content.invoice || {},
    //               requisition: content.content.requisition || {},
    //               signature: content.content.signature || {},
    //               title: content.content.title || {},
    //               text: content.content.paragraph || {},
    //               table: content.content.table || {},
    //               list: content.content.expense || {},
    //               header: content.content.paper_title || {},
    //               event: content.content.event || {},
    //             } as SheetProps)
    //           : null,
    //         comments: content.comments || [],
    //       }))}
    //       mode="update"
    //       context="builder"
    //     /> */}
    //   </PaperBoardProvider>
    // </PaperBoardErrorBoundary>
    <></>
  );
};

export default BuildTemplate;
