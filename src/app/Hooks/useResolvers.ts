import { repo, response } from "bootstrap/repositories";

const useResolvers = () => {
  const serviceCache = new Map<string, any>();

  /**
   * Converts a snake_case or lowercase concatenated string (e.g., "documentupdate")
   * into PascalCase (e.g., "DocumentUpdate").
   */
  const toPascalCase = (input: string): string => {
    return input.replace(/(^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase());
  };

  const serviceBundle = async (serviceName: string) => {
    if (serviceCache.has(serviceName)) {
      return serviceCache.get(serviceName);
    }

    try {
      //   const formattedName = toPascalCase(serviceName);

      const Repo = repo(serviceName);
      const ResponseData = await response(serviceName);

      if (!Repo || !ResponseData) {
        throw new Error(`Service resolution failed for: ${serviceName}`);
      }

      const serviceBundle = { Repo, ResponseData };

      // Cache result
      serviceCache.set(serviceName, serviceBundle);

      return serviceBundle;
    } catch (error) {
      console.error(`Failed to resolve service: ${serviceName}`, error);
      return null;
    }
  };
  return { serviceBundle, toPascalCase };
};

export default useResolvers;
