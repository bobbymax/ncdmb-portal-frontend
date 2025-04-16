import { useStateContext } from "app/Context/ContentContext";
import { AuthPageResponseData } from "app/Repositories/Page/data";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const usePageComponents = () => {
  const { pathname } = useLocation();
  const { pages } = useStateContext();

  const [page, setPage] = useState<AuthPageResponseData | null>(null);

  useEffect(() => {
    if (pathname && pages?.length > 0) {
      const url = pathname.split("/").slice(1, -1).join("/");
      const page = pages.find((page) => page.path === `/${url}`);

      setPage(page ?? null);
    }
  }, [pages, pathname]);

  return page;
};

export default usePageComponents;
