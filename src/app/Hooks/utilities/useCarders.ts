import { CarderResponseData } from "app/Repositories/Carder/data";
import { repo } from "bootstrap/repositories";
import { useCallback, useEffect, useMemo, useState } from "react";

const useCarders = (trackerCarderId: number, staffCarderId: number) => {
  const carderRepo = useMemo(() => repo("carder"), []);
  const [loading, setLoading] = useState<boolean>(true);
  const [carders, setCarders] = useState<CarderResponseData[]>([]);
  const [isOperational, setIsOperational] = useState<boolean>(false);

  // Finds a carder by ID
  const carder = useCallback(
    (carderId: number): CarderResponseData | undefined => {
      return carders.find((card) => card.id === carderId);
    },
    [carders]
  );

  // Evaluate isOperational when relevant values are present
  useEffect(() => {
    if (carders.length === 0 || trackerCarderId <= 0 || staffCarderId <= 0)
      return;

    const target = carder(trackerCarderId);

    const result = target
      ? target.label === "all-carders" || target.id === staffCarderId
      : false;

    setIsOperational(result);
  }, [carders, trackerCarderId, staffCarderId, carder]);

  // Load carders
  useEffect(() => {
    const getCarders = async () => {
      const response = await carderRepo.collection("carders");
      if (response) {
        const carders = response.data as CarderResponseData[];
        setCarders(carders);
      }
      setLoading(false);
    };

    if (trackerCarderId > 0 && staffCarderId > 0) {
      getCarders();
    }
  }, [carderRepo, trackerCarderId, staffCarderId]);

  return { carders, carder, isOperational, loading };
};

export default useCarders;
