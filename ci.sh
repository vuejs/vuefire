set -e
if [ -z "$CI_PULL_REQUEST" ]
then
  npm test
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
else
  npm test
fi
