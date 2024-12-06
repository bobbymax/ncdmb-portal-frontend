import { AuthPageResponseData } from "app/Repositories/Page/data";

export default class MenuProvider {
  applications = (pages: AuthPageResponseData[]): AuthPageResponseData[] => {
    return pages.filter((page) => page.type === "app");
  };

  getRequestedPage = (
    path: string,
    pages: AuthPageResponseData[]
  ): AuthPageResponseData | undefined => {
    const appPath = path.split("/")[1];
    return pages.find((page) => page.path === `/${appPath}`);
  };

  children = (
    parent_id: number,
    pages: AuthPageResponseData[]
  ): AuthPageResponseData[] => {
    return pages.filter((page) => page.parent_id === parent_id);
  };
}
