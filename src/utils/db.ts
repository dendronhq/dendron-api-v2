import _ from "lodash";
import { Sequelize } from "sequelize";

export function sqlClient(storage: string, opts?: { logging?: boolean }) {
  const { logging } = _.defaults(opts, { logging: false });
  const sequelize = new Sequelize("database", "username", "password", {
    dialect: "sqlite",
    storage,
    logging,
  });
  return sequelize;
}
