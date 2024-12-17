const { constants } = require("../constant");

const errorhandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode);

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "Validation Error",
        message: err.message,
        stacktrace: process.env.NODE_ENV === 'development' ? err.stack : null, 
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not Found",
        message: err.message,
        stacktrace: process.env.NODE_ENV === 'development' ? err.stack : null,
      });
      break;
    case constants.FORBIDDEN:
      res.json({
        title: "Forbidden",
        message: err.message,
        stacktrace: process.env.NODE_ENV === 'development' ? err.stack : null,
      });
      break;
    case constants.UNAUTHORIZED:
      res.json({
        title: "Unauthorized",
        message: err.message,
        stacktrace: process.env.NODE_ENV === 'development' ? err.stack : null,
      });
      break;
    default:
      res.json({
        title: "Internal Server Error",
        message: err.message,
        stacktrace: process.env.NODE_ENV === 'development' ? err.stack : null,
      });
      break;
  }
};

module.exports = errorhandler;
