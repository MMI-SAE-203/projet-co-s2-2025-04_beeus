/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select1945302907",
    "maxSelect": 3,
    "name": "budget",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Gratuit ou petit budget",
      "Budget moyen (10–30€ par sortie)",
      "Peu importe si ça en vaut la peine"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select1945302907")

  return app.save(collection)
})
