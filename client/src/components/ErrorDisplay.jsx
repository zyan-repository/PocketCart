import PropTypes from "prop-types";

function ErrorDisplay({ error }) {
  if (!error) return null;

  return <div className="error">{error}</div>;
}

ErrorDisplay.propTypes = {
  error: PropTypes.string,
};

export default ErrorDisplay;
