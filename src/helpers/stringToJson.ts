const stringToJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export default stringToJson;
