import { ModuleManifest } from "@ecoflow/types";

const manifest: () => ModuleManifest = () => {
  const { database } = ecoFlow;

  const fetchDatabaseIDs = async () =>
    database.connectionList.map((database) => database.connectionsName);

  const fetchDatabaseCollection = async ({ databaseID }: any) => {
    if (databaseID && databaseID.validated && databaseID.value) {
      const connection = database.getDatabaseConnection(databaseID.value);
      if (database.isKnex(connection)) return await connection.listTables();
      if (database.isMongoose(connection))
        return await connection.listCollections();
    }

    return [];
  };

  return {
    name: "Database",
    specs: [
      {
        name: "Find",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "filterFind",
            label: "Filter",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
          },
        ],
        controller: "findController",
      },
      {
        name: "Insert",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be inserted from payload.msg",
            type: "Checkbox",
          },
          {
            name: "returnInsert",
            label: "Return Inserted values",
            hint: "Returned Inserted values in the payload",
            type: "Checkbox",
          },
          {
            name: "insertValue",
            label: "Insert value",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
          },
        ],
        controller: "insertController",
      },
      {
        name: "Update",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg.value and payload.msg.newValue",
            type: "Checkbox",
          },
          {
            name: "returnUpdate",
            label: "Return Inserted values",
            hint: "Returned Updated values in the payload",
            type: "Checkbox",
          },
          {
            name: "updateFilterValue",
            label: "Filter",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
          },
          {
            name: "updateValue",
            label: "Updated Values",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
          },
        ],
        controller: "updateController",
      },
      {
        name: "Delete",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg",
            type: "Checkbox",
          },
          {
            name: "returnDelete",
            label: "Return Deleted values",
            hint: "Returned Deleted values in the payload",
            type: "Checkbox",
          },
          {
            name: "deleteValueFilter",
            label: "Filter",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
          },
        ],
        controller: "deleteController",
      },
      {
        name: "Sort",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg",
            type: "Checkbox",
          },
          {
            name: "sortColumn",
            label: "Sort column name",
            type: "String",
            defaultValue: "",
            required: true,
          },
          {
            name: "sortType",
            label: "Sort type",
            type: "SelectPicker",
            pickerOptions: [
              {
                label: "Ascending",
                value: "asc",
              },
              {
                label: "Descending",
                value: "desc",
              },
            ],
            required: true,
          },
        ],
        controller: "sortController",
      },
      {
        name: "Limit",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg.limit",
            type: "Checkbox",
          },
          {
            name: "limitCount",
            label: "Limit",
            type: "Number",
            defaultValue: 0,
            required: true,
          },
        ],
        controller: "limitController",
      },
      {
        name: "Range",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg.range containing a object with key start and end of type number.",
            type: "Checkbox",
          },
          {
            name: "rangeCount",
            label: "Range",
            type: "Range",
            defaultValue: { start: 0, end: 0 },
            required: true,
          },
        ],
        controller: "rangeController",
      },
      {
        name: "Find And Return Selected Columns",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg.columns containing a array of strings.",
            type: "Checkbox",
          },
          {
            name: "columns",
            label: "Columns",
            type: "String",
            hint: "use , to specify multiple columns.",
            defaultValue: "",
            required: true,
          },
        ],
        controller: "findReturnSelectedController",
      },
      {
        name: "Find And sort",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg containing a object of filter,sortColumn,sortType.",
            type: "Checkbox",
          },
          {
            name: "findFilter",
            label: "Find Filter",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
            required: true,
          },
          {
            name: "sortColumn",
            label: "Sort column",
            type: "String",
            defaultValue: "",
            required: true,
          },
          {
            name: "sortType",
            label: "Sort Type",
            type: "SelectPicker",
            pickerOptions: [
              {
                label: "Ascending",
                value: "asc",
              },
              {
                label: "Descending",
                value: "desc",
              },
            ],
            required: true,
          },
        ],
        controller: "findAndSort",
      },
      {
        name: "Find And limit",
        type: "Middleware",
        inputs: [
          {
            name: "databaseID",
            label: "Database ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseIDs,
            required: true,
          },
          {
            name: "collectionID",
            label: "Collection ID",
            type: "SelectPicker",
            pickerOptions: fetchDatabaseCollection,
            required: true,
          },
          {
            name: "bypassRequest",
            label: "Bypass from Request",
            hint: "Retrives values to be updated from payload.msg containing a object of filter,limit.",
            type: "Checkbox",
          },
          {
            name: "findFilter",
            label: "Find Filter",
            type: "Code",
            codeLanguage: "json",
            defaultValue: "{}",
            required: true,
          },
          {
            name: "limitCount",
            label: "Limit Count",
            type: "Number",
            defaultValue: 0,
            required: true,
          },
        ],
        controller: "findAndLimit",
      },
    ],
  };
};

export default manifest;
