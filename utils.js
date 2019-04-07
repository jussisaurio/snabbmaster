const getTempFileName = ext =>
  `tmp-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

module.exports = {
  getTempFileName
};
