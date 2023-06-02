import _ from "lodash";

export type ExcludeOption = {
  tags: { key: string; value: any }[];
  hierarchies: string[];
};

export const processExcludeOption = (value: string): ExcludeOption => {
  const out = value
    .split(",")
    .reduce((acc: Partial<ExcludeOption>, param: string) => {
      const [key, value] = param.split("=");
      let cvalue: any = value;
      switch (key) {
        case "tags": {
          const [tagKey, tagValue] = value.split(":");
          cvalue = [{ key: tagKey, tagValue }];
          acc[key] = cvalue;
          break;
        }
        case "hierarchies":
          cvalue = value.split("|");
          acc[key] = cvalue;
          break;
        default:
          throw new Error(`Invalid key "${key}"`);
      }
      return acc;
    }, {});
  return _.defaults(out, { tags: [], hierarchies: [] });
};
