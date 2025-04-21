const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API_FACTORY =
  (base_url: string) =>
  (...paths: string[]) =>
    `${base_url}/${paths.join("/")}`;

const API = API_FACTORY(API_BASE_URL);

export { API, API_FACTORY, API_BASE_URL };
