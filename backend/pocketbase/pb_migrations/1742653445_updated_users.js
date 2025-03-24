/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select750439983",
    "maxSelect": 4,
    "name": "disponibilites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "En journée",
      "Le soir",
      "Week-ends seulement",
      "Dépend de mon emploi du temps"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select750439983",
    "maxSelect": 4,
    "name": "disponibilite",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "En journée",
      "Le soir",
      "Week-ends seulement",
      "Dépend de mon emploi du temps"
    ]
  }))

  return app.save(collection)
})
