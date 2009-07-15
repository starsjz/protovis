Date.__parse__ = Date.parse;

/**
 * Parses a date from a string, optionally using the specified formatting. If
 * only a single argument is specified (i.e., {@code format} is not specified),
 * this method invokes the native implementation to guarantee
 * backwards-compatibility.
 *
 * <p>The format string is in the same format expected by the {@code strptime}
 * function in C. TODO expand support to include all (or at least most) of the
 * substitution variables.
 *
 * @see http://www.opengroup.org/onlinepubs/007908799/xsh/strptime.html
 * @param s the string to parse as a date.
 * @param format an optional format string.
 * @return the parsed date.
 */
Date.parse = function(s, format) {
  if (arguments.length == 1) {
    return Date.__parse__(s);
  }

  var d = new Date(1970, 1, 1); // local time
  var fields = [function() {}];
  format = format.replace(/[\\\^\$\*\+\?\[\]\(\)\.\{\}]/g, "\\$&");
  format = format.replace(/%[a-zA-Z0-9]/g, function(s) {
      switch (s) {
        case '%S': {
          fields.push(function(x) { d.setSeconds(x); });
          return "([0-9]+)";
        }
        case '%M': {
          fields.push(function(x) { d.setMinutes(x); });
          return "([0-9]+)";
        }
        case '%H': {
          fields.push(function(x) { d.setHours(x); });
          return "([0-9]+)";
        }
        case '%d': {
          fields.push(function(x) { d.setDate(x); });
          return "([0-9]+)";
        }
        case '%m': {
          fields.push(function(x) { d.setMonth(x - 1); });
          return "([0-9]+)";
        }
        case '%Y': {
          fields.push(function(x) { d.setYear(x); });
          return "([0-9]+)";
        }
        case '%%': {
          fields.push(function() {});
          return "%";
        }
        case '%y': {
          fields.push(function(x) {
              x = Number(x);
              d.setYear(x + (((0 <= x) && (x < 69)) ? 2000
                  : (((x >= 69) && (x < 100) ? 1900 : 0))));
            });
          return "([0-9]+)";
        }
      }
      return s;
    });

  var match = s.match(format);
  if (match) match.forEach(function(m, i) { fields[i](m); });
  return d;
};

/**
 * Converts a date to a string using the specified formatting. If the {@code
 * Date} object already supports the {@code toLocaleFormat} method, this is
 * simply an alias to the built-in method.
 *
 * <p>The format string is in the same format expected by the {@code strftime}
 * function in C. TODO expand support to include all (or at least most) of the
 * substitution variables.
 *
 * @see http://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/toLocaleFormat
 * @see http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html
 */
if (Date.prototype.toLocaleFormat) {
  Date.prototype.format = Date.prototype.toLocaleFormat;
} else {
  Date.prototype.format = function(format) {
    var d = this;
    return format.replace(/%[a-zA-Z0-9]/g, function(s) {
        switch (s) {
          case '%a': return [
              "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            ][d.getDay()];
          case '%A': return [
              "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
              "Saturday",
            ][d.getDay()];
          case '%b': return [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
              "Oct", "Nov", "Dec",
            ][d.getMonth()];
          case '%B': return [
              "January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December",
            ][d.getMonth()];
          case '%S': return d.getSeconds();
          case '%M': return d.getMinutes();
          case '%H': return d.getHours();
          case '%d': return d.getDate();
          case '%m': return d.getMonth() + 1;
          case '%Y': return d.getYear();
          case '%%': return "%";
          case '%y': return d.getYear() % 100;
        }
        return s;
      });
    };
}
