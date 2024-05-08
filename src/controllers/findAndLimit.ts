import { EcoContext } from "@ecoflow/types";
import stringToJson from "../helpers/stringToJson";

async function findAndLimit(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, findFilter, limitCount } = inputs;
  let { bypassRequest } = inputs;

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

  if (_.isUndefined(bypassRequest) || !_.isBoolean(bypassRequest))
    bypassRequest = false;

  const { filter, limit: payloadLimitCount } = payload.msg;

  const filterValue =
    bypassRequest && !_.isEmpty(filter) && _.isObject(filter)
      ? filter
      : !bypassRequest &&
        findFilter.validate &&
        _.isObject(stringToJson(findFilter.value))
      ? stringToJson(findFilter.value)
      : {};

  const limit =
    bypassRequest &&
    !_.isEmpty(payloadLimitCount) &&
    _.isString(payloadLimitCount)
      ? Number(payloadLimitCount)
      : !bypassRequest &&
        limitCount.toString() &&
        _.isString(limitCount.toString())
      ? Number(limitCount)
      : 0;

  const limitValue = limit < 0 ? 0 : limit;

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      payload.msg = await connection
        .queryBuilder(collectionID)
        .select()
        .where(filterValue)
        .limit(limitValue);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find(filterValue)
        .limit(limitValue)
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

export default findAndLimit;
