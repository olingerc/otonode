exports.all = function(fn) {
  fn(null, [
     {'name':'tobi'},
     {'name':'jane'},
     {'name':'loki'}
  ]);
};

exports.one = function(fn) {
  fn(null, [
     {'name':'tobi'}
  ]);
};
