import { EcoContext } from "@ecoflow/types";
import stringToJson from "../helpers/stringToJson";

async function deleteController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, deleteValueFilter } = inputs;
  let { bypassRequest, returnDelete } = inputs;

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

  if (_.isUndefined(returnDelete) || !_.isBoolean(returnDelete))
    returnDelete = false;

  const deleteFilter =
    bypassRequest && !_.isEmpty(payload.msg) && _.isObject(payload.msg)
      ? payload.msg
      : !bypassRequest &&
        deleteValueFilter.validate &&
        _.isObject(stringToJson(deleteValueFilter.value))
      ? stringToJson(deleteValueFilter.value)
      : {};

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      const result = [];
      if (returnDelete) {
        if (Array.isArray(deleteFilter))
          for await (const data of deleteFilter)
            result.push(
              await connection.queryBuilder(collectionID).select().where(data)
            );
        else
          result.push(
            await connection
              .queryBuilder(collectionID)
              .select()
              .where(deleteFilter)
          );
      }

      if (Array.isArray(deleteFilter))
        for await (const data of deleteFilter)
          for await (const data of deleteFilter)
            await connection.queryBuilder(collectionID).delete().where(data);
      else
        await connection
          .queryBuilder(collectionID)
          .delete()
          .where(deleteFilter);

      payload.msg = result.length === 1 ? result[0] : result;
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      const result = [];

      if (returnDelete) {
        if (Array.isArray(deleteFilter))
          for await (const data of deleteFilter)
            result.push(
              await connection.getConnection.db
                .collection(collectionID)
                .find(data)
                .toArray()
            );
        else
          result.push(
            await connection.getConnection.db
              .collection(collectionID)
              .find(deleteFilter)
              .toArray()
          );
      }

      if (Array.isArray(deleteFilter))
        for await (const data of deleteFilter)
          await connection.getConnection.db
            .collection(collectionID)
            .deleteMany(data);
      else
        await connection.getConnection.db
          .collection(collectionID)
          .deleteMany(deleteFilter);

      payload.msg = returnDelete
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

export default deleteController;
