import { EcoContext } from "@ecoflow/types";

async function findReturnSelectedController(this: EcoContext) {
  const { _, database } = ecoFlow;
  const { payload, inputs, next } = this;

  if (_.isUndefined(inputs)) {
    payload.msg = [];
    next();
    return;
  }

  const { databaseID, collectionID, columns } = inputs;
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

  const { columns: bypassedColumns } = payload.msg;

  const columnsValue =
    bypassRequest && !_.isEmpty(bypassedColumns) && _.isString(bypassedColumns)
      ? bypassedColumns
      : !bypassRequest && columns && _.isString(columns)
      ? columns
      : "";

  if (_.isEmpty(columnsValue)) {
    payload.msg = {
      error: true,
      payload: "columns name is required.",
    };
    next();
    return;
  }

  const returnColumnValue = columnsValue
    .split(",")
    .map((column) => column.trim());

  try {
    const connection = await database.getDatabaseConnection(databaseID);
    if (database.isKnex(connection)) {
      payload.msg = await connection
        .queryBuilder(collectionID)
        .select(returnColumnValue);
      next();
      return;
    }

    if (database.isMongoose(connection)) {
      const project = Object.create({});
      returnColumnValue.forEach((column) => (project[column] = 1));
      payload.msg = await connection.getConnection.db
        .collection(collectionID)
        .find({})
        .project(project)
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

export default findReturnSelectedController;
