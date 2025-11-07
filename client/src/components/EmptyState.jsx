import PropTypes from "prop-types";

function EmptyState({ message }) {
  return <p>{message}</p>;
}

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

export default EmptyState;
