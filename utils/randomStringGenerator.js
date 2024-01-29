function randomStringGenerator() {
  const randomString = Math.random().toString(36).substr(2, 11);

  return randomString;
}

module.exports = randomStringGenerator;
