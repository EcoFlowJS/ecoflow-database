import { EcoContext } from "@ecoflow/types";

async function rangeController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, rangeCount } = inputs;
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

  const { range } = payload.msg;

  const { start, end } = rangeCount;
  const { start: rangeStart, end: rangeEnd } = range
    ? range
    : Object.create({});

  const startIndexValue =
    bypassRequest &&
    !_.isEmpty(rangeStart) &&
    (_.isString(rangeStart) || _.isNumber(rangeStart))
      ? Number(rangeStart)
      : !bypassRequest && start && (_.isString(start) || _.isNumber(start))
      ? Number(start)
      : 0;

  const endIndexValue =
    bypassRequest &&
    !_.isEmpty(rangeEnd) &&
    (_.isString(rangeEnd) || _.isNumber(rangeEnd))
      ? Number(rangeEnd)
      : !bypassRequest && end && (_.isString(end) || _.isNumber(end))
      ? Number(end)
      : 0;

  const startValue = startIndexValue >= 0 ? startIndexValue : 0;
  const endValue = endIndexValue >= startValue ? endIndexValue : startValue;

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      payload.msg = await connection
        .queryBuilder(collectionID)
        .select()
        .offset(startValue)
        .limit(endValue - startValue);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find({})
        .skip(startValue)
        .limit(endValue - startValue)
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

export default rangeController;
