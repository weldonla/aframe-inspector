const Events = require('./Events');

const updates = {};

/**
 * Store change to export.
 *
 * payload: entity, component, property, value.
 */
Events.on('entityupdate', payload => {
  let value = payload.value;

  const entity = payload.entity;
  updates[entity.id] = updates[entity.id] || {};

  const component = AFRAME.components[payload.component];
  const markerChild = document.querySelector("a-marker").children[entity.id];
  if (component) {
    if (payload.property) {
      updates[entity.id][payload.component] =
        updates[entity.id][payload.component] || {};
      if (component.schema[payload.property]) {
        value = component.schema[payload.property].parse(payload.value);
      }
      updates[entity.id][payload.component][payload.property] = value;
      markerChild.setAttribute(payload.property, value)
    } else {
      value = component.schema.parse(payload.value);
      updates[entity.id][payload.component] = value;
      markerChild.setAttribute(payload.component, value)
    }
  }
});

module.exports = {
  updates: updates
};
