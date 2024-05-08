import { EcoContext } from "@ecoflow/types";

async function limitController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, limitCount } = inputs;
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

  const { limit } = payload.msg;

  const limitValue =
    bypassRequest &&
    !_.isEmpty(limit) &&
    (_.isString(limit) || _.isNumber(limit))
      ? Number(limit)
      : !bypassRequest &&
        limitCount &&
        (_.isString(limitCount) || _.isNumber(limitCount))
      ? Number(limitCount)
      : 0;

  const limitCountValue = limitValue >= 0 ? limitValue : 0;

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      payload.msg = await connection
        .queryBuilder(collectionID)
        .select()
        .limit(limitCountValue);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find({})
        .limit(limitCountValue)
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

export default limitController;
