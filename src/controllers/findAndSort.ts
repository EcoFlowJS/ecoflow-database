import { EcoContext } from "@ecoflow/types";
import stringToJson from "../helpers/stringToJson";

async function findAndSort(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, findFilter, sortColumn, sortType } = inputs;
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

  const {
    filter,
    sortColumn: payloadSortColumn,
    sortType: payloadSortType,
  } = payload.msg;

  const filterValue =
    bypassRequest && !_.isEmpty(filter) && _.isObject(filter)
      ? filter
      : !bypassRequest &&
        findFilter.validate &&
        _.isObject(stringToJson(findFilter.value))
      ? stringToJson(findFilter.value)
      : {};

  const columnValue =
    bypassRequest &&
    !_.isEmpty(payloadSortColumn) &&
    _.isString(payloadSortColumn)
      ? payloadSortColumn
      : !bypassRequest && sortColumn && _.isString(sortColumn)
      ? sortColumn
      : "";

  const sortTypeValue =
    bypassRequest && !_.isEmpty(payloadSortType) && _.isString(payloadSortType)
      ? payloadSortType
      : !bypassRequest && sortType && _.isString(sortType)
      ? sortType
      : "";

  if (_.isEmpty(columnValue)) {
    payload.msg = {
      error: true,
      payload: "columns name is required.",
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
        .where(filterValue)
        .orderBy(columnValue, sortTypeValue);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      const sort = Object.create({});
      sort[columnValue] = sortTypeValue;
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find(filterValue)
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

export default findAndSort;
