/* global vision */

const search = vision();

function someRandomFunction() {}

search.addWidget(vision.widgets.records({}));

someRandomFunction();

search.addWidget(vision.widgets.records({}));

search.addWidgets([vision.widgets.records({})]);

search.addWidget(vision.widgets.records({}));
