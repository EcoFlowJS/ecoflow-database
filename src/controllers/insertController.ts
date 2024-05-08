import { EcoContext } from "@ecoflow/types";
import stringToJson from "../helpers/stringToJson";

async function insertController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, insertValue } = inputs;
  let { bypassRequest, returnInsert } = inputs;

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

  if (_.isUndefined(returnInsert) || !_.isBoolean(returnInsert))
    returnInsert = false;

  const insertData =
    bypassRequest && !_.isEmpty(payload.msg) && _.isObject(payload.msg)
      ? payload.msg
      : !bypassRequest &&
        insertValue.validate &&
        _.isObject(stringToJson(insertValue.value))
      ? stringToJson(insertValue.value)
      : {};

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      if (Array.isArray(insertData))
        for await (const data of insertData)
          await connection.queryBuilder(collectionID).insert(data);
      else await connection.queryBuilder(collectionID).insert(insertData);

      if (returnInsert) {
        if (Array.isArray(insertData))
          payload.msg = await connection
            .queryBuilder(collectionID)
            .select()
            .limit(insertData.length)
            .orderBy("_id", "desc");
        else
          payload.msg = await connection
            .queryBuilder(collectionID)
            .select()
            .limit(1)
            .orderBy("_id", "desc");
      } else payload.msg = {};
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      const result = [];

      if (Array.isArray(insertData))
        for await (const data of insertData)
          result.push(
            await connection.getConnection.db
              .collection(collectionID)
              .insertOne(data)
          );
      else
        result.push(
          await connection.getConnection.db
            .collection(collectionID)
            .insertOne(insertData)
        );

      if (returnInsert) payload.msg = result.length === 1 ? result[0] : result;
      else payload.msg = {};

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

export default insertController;
