import pending from "./assets/images/statuses/pending.png";
import altered from "./assets/images/statuses/queried.png";
import safe from "./assets/images/statuses/paid.png";
import exp from "./assets/images/exp-bg.webp";
export const template = {
  status: {
    pending: {
      icon: "ri-time-line",
      image: pending,
      color: "orange",
    },
    altered: {
      icon: "ri-file-edit-line",
      image: altered,
      color: "purple",
    },
    rejected: {
      icon: "ri-verified-badge-line",
      image: safe,
      color: "gray",
    },
    cleared: {
      icon: "ri-verified-badge-line",
      image: safe,
      color: "green",
    },
  },
  bgs: {
    expense: exp,
  },
};
