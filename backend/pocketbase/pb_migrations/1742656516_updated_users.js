/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1986748085",
    "maxSelect": 7,
    "name": "activites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Concerts & Festivals",
      "Bars & Restaurants",
      "Culture & Musées",
      "Sport & Bien-être",
      "Jeux & Soirées",
      "Nature & Découvertes",
      "Études & Workshops"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1986748085",
    "maxSelect": 7,
    "name": "activites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Concerts & Festivals",
      "Bars & Restaurants",
      "Culture & Musées",
      "Sport & Bien-être",
      "Jeux & Soirées",
      "Nature & Découvertes",
      "Études & Workshops",
      "bite"
    ]
  }))

  return app.save(collection)
})
