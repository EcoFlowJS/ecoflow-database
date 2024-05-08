import { EcoContext } from "@ecoflow/types";
import stringToJson from "../helpers/stringToJson";

async function findController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;
  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }
  const { databaseID, collectionID, filterFind } = inputs;

  if (
    _.isUndefined(databaseID) ||
    _.isUndefined(collectionID) ||
    _.isEmpty(databaseID) ||
    _.isEmpty(collectionID)
  ) {
    payload.msg = [];
    next();
    return;
  }

  const filter =
    !_.isEmpty(payload.msg) && _.isObject(this.payload.msg)
      ? payload.msg
      : filterFind.validate && _.isObject(stringToJson(filterFind.value))
      ? stringToJson(filterFind.value)
      : {};

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      payload.msg = await connection
        .queryBuilder(collectionID)
        .select()
        .where(filter);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find(filter)
        .toArray();
      next();
      return;
    }

    payload.msg = {
      error: true,
      payload: "Invalid database connection Settings",
    };
    next();
  } catch (error) {
    payload.msg = {
      error: true,
      payload: error,
    };
    next();
  }
}

export default findController;
