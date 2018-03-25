// Verify that value is a valid number.
function isNumber(value) {
  return (!isNaN(parseFloat(value)) && isFinite(value));
}

// Verify that value is a valid identifier.
function isIdentifier(value) {
  return (isNumber(value) && value >= 0);
}

module.exports = {
  isNumber,
  isIdentifier
}
