import { EcoContext } from "@ecoflow/types";

async function sortController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, sortColumn, sortType } = inputs;
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

  const { sortColumn: column, sortType: type } = payload.msg;

  const sortColumnValue =
    bypassRequest && !_.isEmpty(column) && _.isString(column)
      ? column
      : !bypassRequest && sortColumn && _.isString(sortColumn)
      ? sortColumn
      : "";

  const sortTypeValue =
    bypassRequest && !_.isEmpty(type) && _.isString(type)
      ? type
      : !bypassRequest && sortType && _.isString(sortType)
      ? sortType
      : "";

  if (!_.isString(sortColumnValue) || !_.isString(sortTypeValue)) {
    payload.msg = {
      error: true,
      payload: "Column and type must be of type strings.",
    };
    next();
    return;
  }

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      payload.msg = await connection
        .queryBuilder(collectionID)
        .select()
        .orderBy(sortColumnValue, sortTypeValue);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      const sort = Object.create({});
      sort[sortColumnValue] = sortTypeValue;
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find({})
        .sort(sort)
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

export default sortController;
