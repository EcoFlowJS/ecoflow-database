import { EcoContext } from "@ecoflow/types";
import stringToJson from "../helpers/stringToJson";

async function updateController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, updateFilterValue, updateValue } = inputs;
  let { bypassRequest, returnUpdate } = inputs;

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

  if (_.isUndefined(returnUpdate) || !_.isBoolean(returnUpdate))
    returnUpdate = false;

  const { value, newValue } = payload.msg;

  const oldUpdateValue =
    bypassRequest && !_.isEmpty(value) && _.isObject(value)
      ? value
      : !bypassRequest &&
        updateFilterValue.validate &&
        _.isObject(stringToJson(updateFilterValue.value))
      ? stringToJson(updateFilterValue.value)
      : {};

  const newUpdateValue =
    bypassRequest && !_.isEmpty(newValue) && _.isObject(newValue)
      ? newValue
      : !bypassRequest &&
        updateValue.validate &&
        _.isObject(stringToJson(updateValue.value))
      ? stringToJson(updateValue.value)
      : {};

  if (Array.isArray(oldUpdateValue)) {
    payload.msg = {
      error: true,
      payload: "Update value can only be a object.",
    };
    next();
    return;
  }
  if (_.isEmpty(oldUpdateValue) || _.isEmpty(newUpdateValue)) {
    payload.msg = {
      error: true,
      payload: "Update value or update new value is empty.",
    };
    next();
    return;
  }

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      if (Array.isArray(newUpdateValue))
        for await (const data of newUpdateValue)
          await connection
            .queryBuilder(collectionID)
            .update(data)
            .where(oldUpdateValue);
      else
        await connection
          .queryBuilder(collectionID)
          .update(newUpdateValue)
          .where(oldUpdateValue);

      const result = [];
      if (returnUpdate) {
        if (Array.isArray(newUpdateValue))
          for await (const data of newUpdateValue)
            result.push(
              await connection.queryBuilder(collectionID).select().where(data)
            );
        else
          result.push(
            await connection
              .queryBuilder(collectionID)
              .select()
              .where(newUpdateValue)
          );
      }

      payload.msg = result.length === 1 ? result[0] : result;
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      const result = [];

      if (Array.isArray(newUpdateValue))
        for await (const data of newUpdateValue) {
          await connection.getConnection.db
            .collection(collectionID)
            .updateOne({ ...oldUpdateValue }, { $set: { ...data } });
          result.push(
            await connection.getConnection.db
              .collection(collectionID)
              .findOne(data)
          );
        }
      else {
        await connection.getConnection.db
          .collection(collectionID)
          .updateOne({ ...oldUpdateValue }, { $set: { ...newUpdateValue } });
        result.push(
          await connection.getConnection.db
            .collection(collectionID)
            .findOne(newUpdateValue)
        );
      }

      payload.msg = returnUpdate
        ? result.length === 1
          ? result[0]
          : result
        : {};

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

export default updateController;
