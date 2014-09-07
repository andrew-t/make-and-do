'use strict';

// In theory we could just add the 'big' dependency to 'prime',
// but I can't bring myself to add a dependency I know it doesn't need.
angular.module('prime-app', ['prime', 'big']);