export const GA_TRACKING_ID = "G-0EJCE06X9B";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const logPageView = (url: URL): void => {
  (window as any).gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const logEvent = ({ action, category, label, value }: GTagEvent): void => {
  (window as any).gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
